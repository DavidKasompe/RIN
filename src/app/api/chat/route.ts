/**
 * /api/chat/route.ts
 *
 * Architecture:
 *  1. Call Thesys C1 API (OpenAI-compatible) with Mastra tool schemas exposed as OpenAI tools.
 *  2. When C1 decides to call a tool, execute the real Mastra tool (DB query / RAG search).
 *  3. Return the result to C1 as a tool message, then loop until C1 produces a final response.
 *  4. Stream the C1 DSL response through makeC1Response so the frontend C1Component renders rich UI.
 *  5. Artifact tools (create_report, create_slides) call the Thesys artifact API and stream into makeC1Response.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { makeC1Response } from '@thesysai/genui-sdk/server';

// Mastra tool executors — direct DB / RAG functions
import { getStudentProfileTool } from '@/mastra/tools/getStudentProfileTool';
import { getStudentAcademicsTool } from '@/mastra/tools/getStudentAcademicsTool';
import { getInterventionsTool } from '@/mastra/tools/getInterventionsTool';
import { searchStudentNotesTool } from '@/mastra/tools/searchStudentNotesTool';
import { triggerWorkflowTool } from '@/mastra/tools/triggerWorkflowTool';
import { requestAutomationTool } from '@/mastra/tools/requestAutomationTool';
import { logInterventionTool } from '@/mastra/tools/logInterventionTool';
import { getInterventionHistoryTool } from '@/mastra/tools/getInterventionHistoryTool';
import { checkEarlyWarningsTool } from '@/mastra/tools/checkEarlyWarningsTool';
import { runScenarioSimulationTool } from '@/mastra/tools/runScenarioSimulationTool';
import { getCohortRiskAnalysisTool } from '@/mastra/tools/getCohortRiskAnalysisTool';

// Composio integration
import { Composio } from '@composio/core';
import { OpenAIAgentsProvider } from '@composio/openai-agents';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

// ─── OpenAI Clients ───────────────────────────────────────────────────────────
// Chat client: Thesys C1 for generative UI DSL responses
const chatClient = new OpenAI({
    apiKey: process.env.THESYS_API_KEY,
    baseURL: 'https://api.thesys.dev/v1/embed/',
});

// Artifact client: Thesys artifact generation (reports / slides)
const artifactClient = new OpenAI({
    apiKey: process.env.THESYS_API_KEY,
    baseURL: 'https://api.thesys.dev/v1/artifact',
});

// ─── System Prompt ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are RIN, an AI-powered student dropout risk intelligence assistant for educators.

IMPORTANT: You have real-time access to the school database via tools. ALWAYS use tools to fetch real student data before answering questions about specific students. Never make up or estimate student data.

Available tools:
- getStudentProfile: Fetch a student's demographic info, attendance rate, risk score and category, notes, and tags.
- getStudentAcademics: Fetch a student's GPA, assignment completion rate, and late submission count.
- getInterventions: Fetch a student's intervention history, active action plan, behavior referrals, and scheduled meetings.
- searchStudentNotes: Semantic search across counselor notes, IEP summaries, and disciplinary reports.
- create_report: Generate a downloadable PDF risk report for a student or cohort.
- create_slides: Generate a slide presentation for school boards, parent meetings, or counselor teams.
- edit_artifact: Edit a previously generated report or presentation.

Workflow for student queries:
1. If a specific student is mentioned, call getStudentProfile first (by name or ID).
2. Augment with getStudentAcademics and/or getInterventions if needed.
3. Use searchStudentNotes for qualitative context ("why has attendance dropped?").
4. Present findings using rich C1 visual components: stat cards, tables, progress bars, badges, callouts.

Workflow automation (NEW):
- If the educator asks to "start a workflow", "send alerts", or run a specific system automation, use the \`triggerWorkflow\` tool.
- If the educator asks for a *new* smart notification or rule ("Remind me if Sarah misses tomorrow"), use the \`requestAutomation\` tool to draft a workflow.

When presenting risk data:
- Show risk score prominently in a stat card or highlight box.
- Use a table for contributing risk factors with impact percentages.
- Use prioritized lists (High/Medium/Low) for intervention steps.

When scheduling meetings or adding events to the calendar:
- ALWAYS use the \`GOOGLECALENDAR_CREATE_EVENT\` tool if available to sync directly with the user's Google Calendar.
- If asked for a "Meet link" or "video call", ensure you use \`GOOGLECALENDAR_CREATE_EVENT\` (it automatically generates a Google Meet link by default).
- If inviting parents, first check the \`getStudentProfile\` tool for the parent's email address and include it in the \`attendees\` array.
- If the parent's email is NOT found in the profile, explicitly ask the user for the email address first before creating the event.
- After successfully creating the event, clearly announce: "Event created with [Student Name]'s parent" and confirm that a Meet link was included.

Always be empathetic, evidence-based, and action-oriented. Never stigmatize students.`;

// ─── Tool Definitions (OpenAI-format, passed to C1 API) ──────────────────────
const C1_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'getStudentProfile',
            description: "Fetch a student's full demographic, attendance, risk score, notes and tags from the school database. Use this first when asked about a specific student.",
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Student name or ID (e.g. "Marcus" or "STU-123")' },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getStudentAcademics',
            description: "Fetch a student's GPA, assignment completion rate, and late submission counts from the database.",
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Student name or ID' },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getInterventions',
            description: "Fetch a student's intervention history, active action plan, behavior referrals, and scheduled meetings.",
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Student name or ID' },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'searchStudentNotes',
            description: 'Semantic search across counselor notes, IEP summaries, and disciplinary reports. Use for qualitative questions like "why has attendance dropped?" or "what are the family issues?"',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'The question or concept to search for' },
                    studentIdOrName: { type: 'string', description: 'Optional student name or ID to filter notes' },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_report',
            description: 'Generate a detailed, downloadable RIN student risk report with full analysis, risk scores, and intervention plans. Use when educator asks for a report, PDF, or formal documentation.',
            parameters: {
                type: 'object',
                properties: {
                    instructions: { type: 'string', description: 'Full instructions for the report including student data, risk factors, and intervention strategies.' },
                    student_name: { type: 'string', description: "Student's name for the report title." },
                },
                required: ['instructions'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_slides',
            description: 'Generate a slide presentation for sharing with school boards, parent meetings, or counselor teams. Use when educator asks for a presentation, slides, or shareable deck.',
            parameters: {
                type: 'object',
                properties: {
                    instructions: { type: 'string', description: 'Instructions for the presentation including topic, audience, and key data points.' },
                    title: { type: 'string', description: 'Presentation title.' },
                },
                required: ['instructions'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'edit_artifact',
            description: 'Edit an existing report or presentation based on feedback. Use when educator asks to modify, update, or revise previously generated content.',
            parameters: {
                type: 'object',
                properties: {
                    artifact_id: { type: 'string', description: 'ID of the artifact to edit.' },
                    current_content: { type: 'string', description: 'Current C1 DSL content of the artifact.' },
                    edit_instructions: { type: 'string', description: 'Description of changes to make.' },
                    artifact_type: { type: 'string', enum: ['report', 'slides'], description: 'Type of artifact.' },
                },
                required: ['artifact_id', 'current_content', 'edit_instructions', 'artifact_type'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'triggerWorkflow',
            description: 'Triggers a predefined workflow by name or ID. Use this when the user asks to start an automation sequence, send notifications, or run a class-wide scan.',
            parameters: {
                type: 'object',
                properties: {
                    workflowIdOrName: { type: 'string', description: 'The ID or exact name of the workflow to run.' },
                    triggerData: {
                        type: 'object',
                        description: 'Optional data to pass to the workflow trigger (e.g., studentId, riskScore).',
                        additionalProperties: true
                    },
                },
                required: ['workflowIdOrName'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'requestAutomation',
            description: 'Use this tool when a teacher asks for a NEW smart notification or automation in chat (e.g. "Remind me if Sarah misses class tomorrow"). It creates a draft workflow they can enable.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'A short, descriptive name for the requested automation.' },
                    description: { type: 'string', description: 'What the automation is supposed to do.' },
                    triggerType: { type: 'string', description: 'The type of event that triggers this (e.g., "Student Event", "Cron Schedule")' },
                    actionType: { type: 'string', description: 'The resulting action (e.g., "Send SMS", "Send Email", "Flag Review")' },
                    config: {
                        type: 'object',
                        description: 'Initial configuration parameters derived from the chat.',
                        additionalProperties: true
                    },
                },
                required: ['name', 'description', 'triggerType', 'actionType', 'config'],
            },
        },
    },
    // Simulations & Cohort (Prompt 07)
    {
        type: 'function',
        function: {
            name: 'runScenarioSimulation',
            description: 'Simulate how a student\'s risk score would change if their attendance, GPA, or other factors improved or worsened. Use for "what if" questions.',
            parameters: { type: 'object', properties: { studentQuery: { type: 'string' }, scenarios: { type: 'array', items: { type: 'object', properties: { factor: { type: 'string' }, change: { type: 'number' } }, required: ['factor', 'change'] } } }, required: ['studentQuery', 'scenarios'] }
        }
    },
    {
        type: 'function',
        function: {
            name: 'getCohortRiskAnalysis',
            description: 'Analyze risk patterns across an entire grade level or cohort of students. Identifies at-risk clusters and collective trends.',
            parameters: { type: 'object', properties: { gradeLevel: { type: 'string' }, riskThreshold: { type: 'number' } } }
        }
    }
];

// ─── Mastra Tool Executor ─────────────────────────────────────────────────────
type MastraTool = { execute?: (input: any, ctx: any) => Promise<any> };

async function executeMastraTool(name: string, args: Record<string, any>): Promise<string> {
    const toolMap: Record<string, MastraTool> = {
        getStudentProfile: getStudentProfileTool,
        getStudentAcademics: getStudentAcademicsTool,
        getInterventions: getInterventionsTool,
        searchStudentNotes: searchStudentNotesTool,
        triggerWorkflow: triggerWorkflowTool,
        requestAutomation: requestAutomationTool,
        logIntervention: logInterventionTool,
        getInterventionHistory: getInterventionHistoryTool,
        checkEarlyWarnings: checkEarlyWarningsTool,
        runScenarioSimulation: runScenarioSimulationTool,
        getCohortRiskAnalysis: getCohortRiskAnalysisTool,
    };
    const tool = toolMap[name];
    if (!tool?.execute) {
        return JSON.stringify({ error: `Tool "${name}" not found or has no execute function.` });
    }
    try {
        const result = await tool.execute(args, {});
        return JSON.stringify(result);
    } catch (err) {
        console.error(`[tool:${name}] error:`, err);
        return JSON.stringify({ error: `Tool execution failed: ${String(err)}` });
    }
}

// ─── Artifact Handlers ────────────────────────────────────────────────────────
async function executeArtifactTool(
    name: string,
    args: Record<string, any>,
    c1Response: ReturnType<typeof makeC1Response>,
): Promise<string> {
    const artifactId = crypto.randomUUID();
    const isSlides = name === 'create_slides';
    const isEdit = name === 'edit_artifact';
    const artifactType = isSlides ? 'slides' : 'report';

    c1Response.writeThinkItem({
        title: isEdit ? 'Editing artifact…' : isSlides ? 'Generating presentation…' : 'Generating report…',
        description: isEdit
            ? 'Applying your changes.'
            : `Building your ${isSlides ? 'slide deck' : 'risk report'} — this takes a moment.`,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = isEdit
        ? [
            { role: 'assistant', content: args.current_content || '' },
            { role: 'user', content: args.edit_instructions || '' },
        ]
        : [{ role: 'user', content: args.instructions || '' }];

    const stream = await artifactClient.chat.completions.create({
        model: 'c1/artifact/v-20251030',
        messages,
        // @ts-ignore — Thesys-specific metadata
        metadata: {
            thesys: JSON.stringify({
                c1_artifact_type: artifactType,
                id: isEdit ? (args.artifact_id || artifactId) : artifactId,
            }),
        },
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) c1Response.writeContent(content);
    }

    return JSON.stringify({
        success: true,
        artifact_id: isEdit ? (args.artifact_id || artifactId) : artifactId,
        message: `${isSlides ? 'Slides' : 'Report'} ${isEdit ? 'updated' : 'created'} successfully.`,
    });
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            messages: OpenAI.Chat.ChatCompletionMessageParam[];
            currentViewContext?: any;
            activeToolkits?: string[];
        };

        const { messages, currentViewContext, activeToolkits } = body;

        if (!messages?.length) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        // Get the active user session for Composio account connection
        // Only run Composio stuff if there's a valid COMPOSIO_API_KEY
        let composioTools: OpenAI.Chat.ChatCompletionTool[] = [];
        let composioSession: any = null;
        let composioInstance: any = null;

        if (process.env.COMPOSIO_API_KEY) {
            try {
                // Determine user ID
                const authSession = await auth.api.getSession({ headers: req.headers });
                const userId = authSession?.user?.id || 'anonymous_educator';

                let schoolId = 'no_school';
                if (userId !== 'anonymous_educator') {
                    try {
                        const { db } = await import('@/db');
                        const { users } = await import('@/db/schema');
                        const { eq } = await import('drizzle-orm');
                        if (db) {
                            const currentUserReq = await db.select().from(users).where(eq(users.id, userId));
                            if (currentUserReq.length > 0 && currentUserReq[0].schoolId) {
                                schoolId = currentUserReq[0].schoolId;
                            }
                        }
                    } catch (e) { /* silent fail */ }
                }

                // Initialize Composio natively
                composioInstance = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

                // We create a session for both the user and the school
                composioSession = await composioInstance.create(userId);
                const composioSchoolSession = await composioInstance.create(schoolId);

                // Fetch ALL connected tools from both entities
                const userTools = await composioSession.tools();
                const schoolTools = await composioSchoolSession.tools();

                // Merge tools, giving preference to school tools if overlap (though usually distinct)
                const mergedTools = [...schoolTools, ...userTools];

                // Hack to fix type mismatches between Composio's output and OpenAI SDK types
                composioTools = mergedTools.map((t: any) => ({
                    type: 'function',
                    function: {
                        name: t.function.name,
                        description: t.function.description || 'Composio toolkit action',
                        parameters: t.function.parameters || t.inputSchema || { type: 'object', properties: {} },
                    }
                })) as OpenAI.Chat.ChatCompletionTool[];

            } catch (err) {
                console.error('Failed to initialize Composio tools:', err);
            }
        }

        // Merge the Mastra C1 tools with the dynamic Composio tools
        const ALL_TOOLS = [...C1_TOOLS, ...composioTools];

        const c1Response = makeC1Response();

        c1Response.writeThinkItem({
            title: 'Analyzing your request…',
            description: 'RIN is checking student records and preparing a response.',
        });

        // Inject student context into system prompt if available
        let systemContent = BASE_SYSTEM_PROMPT;
        if (currentViewContext) {
            const contextId = currentViewContext.studentId
                ? `Student ID: ${currentViewContext.studentId}`
                : JSON.stringify(currentViewContext);
            systemContent = `ACTIVE CONTEXT: Educator is viewing ${contextId}. Automatically fetch this student's data if relevant.\n\n${systemContent}`;
        }

        if (activeToolkits && activeToolkits.length > 0) {
            systemContent += `\n\n[USER ACTION]: The user has explicitly selected the following external tools for this task: ${activeToolkits.join(', ')}. YOU MUST PRIORITIZE USING THESE TOOLS IF APPLICABLE.`;
        }

        // Build message history — start with system prompt
        const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemContent },
            ...messages,
        ];

        // ── Manual tool-call loop ─────────────────────────────────────────────
        // Standard OpenAI pattern: send messages → if tool_calls in response → execute tools → append results → repeat
        // This works with the C1 API because it's fully OpenAI-compatible.
        (async () => {
            try {
                const ARTIFACT_TOOLS = new Set(['create_report', 'create_slides', 'edit_artifact']);
                let iterations = 0;
                const MAX_ITERATIONS = 6; // safety limit

                while (iterations < MAX_ITERATIONS) {
                    iterations++;

                    // Non-streaming first pass to check for tool calls
                    const response = await chatClient.chat.completions.create({
                        model: 'c1/anthropic/claude-sonnet-4/v-20251230',
                        messages: conversationMessages,
                        tools: ALL_TOOLS.length > 0 ? ALL_TOOLS : undefined,
                        tool_choice: ALL_TOOLS.length > 0 ? 'auto' : undefined,
                        stream: false,
                    });

                    const choice = response.choices[0];
                    const assistantMessage = choice.message;

                    // 1. No tool calls — final response, stream it out
                    if (!assistantMessage.tool_calls?.length) {
                        // Stream the final C1 DSL response for rich rendering
                        const finalStream = await chatClient.chat.completions.create({
                            model: 'c1/anthropic/claude-sonnet-4/v-20251230',
                            messages: conversationMessages,
                            tools: ALL_TOOLS.length > 0 ? ALL_TOOLS : undefined,
                            tool_choice: ALL_TOOLS.length > 0 ? 'auto' : undefined,
                            stream: true,
                        });

                        for await (const chunk of finalStream) {
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) c1Response.writeContent(content);
                        }

                        break;
                    }

                    // 2. Tool calls present — append assistant message to conversation
                    conversationMessages.push({
                        role: 'assistant',
                        content: assistantMessage.content ?? null,
                        tool_calls: assistantMessage.tool_calls,
                    });

                    for (const toolCall of assistantMessage.tool_calls) {
                        // Type guard: only 'function' tool calls have .function.name / .arguments
                        if (toolCall.type !== 'function') continue;

                        const toolName = toolCall.function.name;
                        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

                        // Show thinking state for each Mastra tool call
                        if (!ARTIFACT_TOOLS.has(toolName)) {
                            c1Response.writeThinkItem({
                                title: `Querying database: ${toolName}…`,
                                description: `Fetching ${toolArgs.query ? `data for "${toolArgs.query}"` : 'student records'} from school database.`,
                            });
                        }

                        let toolResult: string;
                        if (ARTIFACT_TOOLS.has(toolName)) {
                            // Artifact tools stream content directly into c1Response
                            toolResult = await executeArtifactTool(toolName, toolArgs, c1Response);
                        } else if (toolName.startsWith('COMPOSIO_') || toolName.startsWith('composio_')) {
                            // Let the Composio SDK execute its own tools directly using the session ID + raw arguments
                            try {
                                if (!composioSession) {
                                    throw new Error("Composio session not initialized");
                                }

                                c1Response.writeThinkItem({
                                    title: `Running remote action…`,
                                    description: `Connecting to ${toolName.split('_')[1] || 'external service'} to perform the task.`,
                                });

                                // Some native agents require passing the exact original tool call ID instead
                                // But since we are directly calling the API, we can use the composio provider directly
                                // Try to find the actual tool in composio.tools() from either session
                                const userToolsObj = await composioSession.tools();

                                // Need to also import schoolId logic again here to execute school tools
                                let toolSchoolId = 'no_school';
                                try {
                                    const { db } = await import('@/db');
                                    const { users } = await import('@/db/schema');
                                    const { eq } = await import('drizzle-orm');
                                    const authSession = await auth.api.getSession({ headers: req.headers });
                                    const uid = authSession?.user?.id || 'anonymous_educator';
                                    if (db && uid !== 'anonymous_educator') {
                                        const currentUserReq = await db.select().from(users).where(eq(users.id, uid));
                                        if (currentUserReq.length > 0 && currentUserReq[0].schoolId) {
                                            toolSchoolId = currentUserReq[0].schoolId;
                                        }
                                    }
                                } catch (e) { }

                                const schoolSessionObj = await composioInstance.create(toolSchoolId);
                                const schoolToolsObj = await schoolSessionObj.tools();

                                const targetTool = userToolsObj.find((t: any) => t.function.name === toolName)
                                    || schoolToolsObj.find((t: any) => t.function.name === toolName);

                                if (!targetTool) {
                                    throw new Error(`Composio tool ${toolName} not found in user or school session`);
                                }

                                // The tool execution interface in native Composio objects
                                const result = await targetTool.execute(toolArgs);
                                toolResult = typeof result === 'string' ? result : JSON.stringify(result);

                            } catch (error) {
                                console.error(`[Composio Tool Execution Error - ${toolName}]:`, error);
                                toolResult = JSON.stringify({ error: `Composio tool execution failed: ${String(error)}` });
                            }
                        } else {
                            // Mastra tools execute DB queries and return JSON
                            toolResult = await executeMastraTool(toolName, toolArgs);
                        }

                        // Append tool result to conversation
                        conversationMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: toolResult,
                        });
                    }
                }

                await c1Response.end();
            } catch (err) {
                console.error('[/api/chat] Stream error:', err);
                c1Response.writeContent('\n\nSomething went wrong. Please try again.');
                await c1Response.end();
            }
        })();

        // Encode responseStream → bytes for NextResponse
        const encoder = new TextEncoder();
        const encodedStream = new ReadableStream<Uint8Array>({
            async start(controller) {
                const reader = (c1Response.responseStream as ReadableStream<string>).getReader();
                try {
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) { controller.close(); break; }
                        controller.enqueue(encoder.encode(value));
                    }
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new NextResponse(encodedStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[/api/chat] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
