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

When presenting risk data:
- Show risk score prominently in a stat card or highlight box.
- Use a table for contributing risk factors with impact percentages.
- Use prioritized lists (High/Medium/Low) for intervention steps.

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
];

// ─── Mastra Tool Executor ─────────────────────────────────────────────────────
type MastraTool = { execute?: (input: any, ctx: any) => Promise<any> };

async function executeMastraTool(name: string, args: Record<string, any>): Promise<string> {
    const toolMap: Record<string, MastraTool> = {
        getStudentProfile: getStudentProfileTool,
        getStudentAcademics: getStudentAcademicsTool,
        getInterventions: getInterventionsTool,
        searchStudentNotes: searchStudentNotesTool,
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
        };

        const { messages, currentViewContext } = body;

        if (!messages?.length) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

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
            systemContent = `ACTIVE CONTEXT: Educator is viewing ${contextId}. Automatically fetch this student's data if relevant.\n\n${BASE_SYSTEM_PROMPT}`;
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
                        tools: C1_TOOLS,
                        tool_choice: 'auto',
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
                            tools: C1_TOOLS,
                            tool_choice: 'auto',
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
