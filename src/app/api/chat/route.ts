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
// Custom notification integrations (Twilio SMS, Resend Email)
import { sendSMSStep } from '@/lib/integrations/twilio';
import { sendEmailStep } from '@/lib/integrations/resend';
import { logInterventionTool } from '@/mastra/tools/logInterventionTool';
import { getInterventionHistoryTool } from '@/mastra/tools/getInterventionHistoryTool';
import { checkEarlyWarningsTool } from '@/mastra/tools/checkEarlyWarningsTool';
import { runScenarioSimulationTool } from '@/mastra/tools/runScenarioSimulationTool';
import { getCohortRiskAnalysisTool } from '@/mastra/tools/getCohortRiskAnalysisTool';
import { addStudentTool } from '@/mastra/tools/addStudentTool';
import { updateStudentGradesTool } from '@/mastra/tools/updateStudentGradesTool';

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

Core tools (always available):
- getStudentProfile: Fetch a student's demographic info, attendance rate, risk score and category, notes, and tags.
- getStudentAcademics: Fetch a student's GPA, assignment completion rate, and late submission count.
- getInterventions: Fetch a student's intervention history, active action plan, behavior referrals, and scheduled meetings.
- searchStudentNotes: Semantic search across counselor notes, IEP summaries, and disciplinary reports.
- sendSMS: Send SMS via Twilio. Use when educator asks to text a parent or contact.
- sendEmail: Fallback email via school notification system. Only use this if Gmail/Outlook are NOT connected.
- create_report: Generate a downloadable PDF risk report.
- create_slides: Generate a slide presentation.
- edit_artifact: Edit a previously generated report or presentation.
- triggerWorkflow: Start a predefined automation workflow.
- requestAutomation: Create a new smart notification or rule from chat.
- addStudent: Add a new student to the roster. Use when teacher says "add", "enroll", or "register" a student.
- updateStudentGrades: Update a student's GPA, attendance, assignments, etc. Use when teacher reports new grades or academic changes.

Student query workflow:
1. If a specific student is mentioned, call getStudentProfile first.
2. Augment with getStudentAcademics and/or getInterventions if needed.
3. Use searchStudentNotes for qualitative context.
4. Present findings using rich C1 visual components: stat cards, tables, progress bars, badges, callouts.

Workflow automation:
- If asked to "start a workflow" or "send alerts", use triggerWorkflow.
- If asked for a NEW smart notification or rule, use requestAutomation.

Presentation:
- Show risk scores in stat cards or highlight boxes.
- Use tables for risk factors with impact percentages.
- Use prioritized lists (High/Medium/Low) for intervention steps.

Always be empathetic, evidence-based, and action-oriented. Never stigmatize students.`;

// ─── Dynamic integration prompt builder ───────────────────────────────────────
function buildIntegrationPrompt(composioToolNames: string[]): string {
    const has = (prefix: string) => composioToolNames.some(n => n.startsWith(prefix));
    const sections: string[] = [];

    // ── Email ─────────────────────────────────────────
    if (has('GMAIL_')) {
        sections.push(`[EMAIL — Gmail ✅]:
- ALWAYS use \`GMAIL_SEND_EMAIL\` to send emails. It sends from the user's own Gmail.
- Do NOT use the fallback \`sendEmail\` tool when Gmail is connected.
- For drafts, use \`GMAIL_CREATE_EMAIL_DRAFT\`.`);
    } else if (has('OUTLOOK_')) {
        sections.push(`[EMAIL — Outlook ✅]:
- Use \`OUTLOOK_SEND_EMAIL\` to send emails from the user's Outlook account.
- For drafts use \`OUTLOOK_CREATE_EMAIL_DRAFT\`.
- Do NOT use the fallback \`sendEmail\` tool when Outlook is connected.`);
    } else {
        sections.push(`[EMAIL — Fallback]:
- Gmail and Outlook are NOT connected. Use the \`sendEmail\` tool (sends from noreply@withrin.co).
- Always include the educator's name and school in the email signature.`);
    }

    // ── Calendar ──────────────────────────────────────
    if (has('GOOGLECALENDAR_')) {
        sections.push(`[CALENDAR — Google Calendar ✅]:
- Use \`GOOGLECALENDAR_CREATE_EVENT\` to schedule meetings. It auto-generates Google Meet links.
- Use \`GOOGLECALENDAR_FIND_EVENT\` to look up existing events.
- When inviting parents, first call getStudentProfile for their email and include it in attendees.
- If no parent email found, ask the user for it before creating the event.
- After creating, confirm with event title and Meet link.`);
    } else if (has('OUTLOOK_CREATE_CALENDAR_EVENT')) {
        sections.push(`[CALENDAR — Outlook ✅]:
- Use \`OUTLOOK_CREATE_CALENDAR_EVENT\` to schedule meetings via Outlook.
- Use \`OUTLOOK_LIST_EVENTS\` to check the educator's upcoming schedule.`);
    } else {
        sections.push(`[CALENDAR]: No calendar integration connected. Events are saved to the local database only.`);
    }

    // ── Team Messaging ────────────────────────────────
    if (has('SLACK_')) {
        sections.push(`[TEAM MESSAGING — Slack ✅]:
- Use \`SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL\` to post messages to school channels.
- Use \`SLACK_SEND_MESSAGE\` for direct messages.
- Use \`SLACK_LIST_ALL_CHANNELS\` or \`SLACK_FIND_CHANNELS\` to discover channel names/IDs.
- Use \`SLACK_SEARCH_MESSAGES\` to search Slack history.
- Great for: risk alerts to counselor channels, team notifications, daily digests.`);
    } else if (has('MICROSOFT-TEAMS_')) {
        sections.push(`[TEAM MESSAGING — Microsoft Teams ✅]:
- Use \`MICROSOFT-TEAMS_POST_MESSAGE_TO_TEAMS_CHANNEL\` for channel alerts.
- Use \`MICROSOFT-TEAMS_SEND_MESSAGE_TO_TEAMS_CHAT\` for direct messages.
- Use \`MICROSOFT-TEAMS_CREATE_ONLINE_MEETING\` for scheduling Teams video calls.
- Use \`MICROSOFT-TEAMS_LIST_TEAMS\` and \`MICROSOFT-TEAMS_LIST_TEAM_CHANNELS\` to discover teams/channels.`);
    } else {
        sections.push(`[TEAM MESSAGING]: Slack and Teams are NOT connected. Use sendSMS or email as alternatives for team alerts.`);
    }

    // ── Documents & Notes ─────────────────────────────
    if (has('NOTION_')) {
        sections.push(`[DOCUMENTS — Notion ✅]:
- Use \`NOTION_CREATE_A_PAGE\` to export student reports, meeting notes, or intervention plans to Notion.
- Use \`NOTION_UPDATE_A_PAGE\` to update existing pages.
- Use \`NOTION_SEARCH_IN_NOTION\` to find existing documents in the workspace.`);
    }

    // ── Spreadsheets ──────────────────────────────────
    if (has('GOOGLESHEETS_')) {
        sections.push(`[SPREADSHEETS — Google Sheets ✅]:
- Use \`GOOGLESHEETS_BATCH_UPDATE_SPREADSHEET\` to update attendance/grade sheets.
- Use \`GOOGLESHEETS_LOOK_UP_SPREADSHEET_ROW\` to search for student data in sheets.
- Use \`GOOGLESHEETS_CREATE_GOOGLE_SHEET\` to create new tracking spreadsheets.
- Use \`GOOGLESHEETS_CREATE_CHART_IN_GOOGLE_SHEETS\` to visualize trends.`);
    } else if (has('EXCEL_')) {
        sections.push(`[SPREADSHEETS — Excel ✅]:
- Use \`EXCEL_ADD_TABLE_ROW\` to log attendance/risk data to school workbooks.
- Use \`EXCEL_GET_RANGE\` and \`EXCEL_UPDATE_RANGE\` to read/update data.
- Use \`EXCEL_ADD_CHART\` to generate visual charts.
- Use \`EXCEL_LIST_WORKSHEETS\` to discover available sheets.`);
    }

    // ── File Storage ──────────────────────────────────
    if (has('GOOGLEDRIVE_')) {
        sections.push(`[FILE STORAGE — Google Drive ✅]:
- Use \`GOOGLEDRIVE_CREATE_A_FILE_FROM_TEXT\` to save reports to Drive.
- Use \`GOOGLEDRIVE_FIND_FILE\` to search for existing documents.
- Use \`GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE\` to share files with staff or parents.
- Use \`GOOGLEDRIVE_CREATE_A_FOLDER\` to organize school documents.`);
    }

    // ── LMS ───────────────────────────────────────────
    if (has('GOOGLECLASSROOM_')) {
        sections.push(`[LMS — Google Classroom ✅]:
- Use Google Classroom tools to sync rosters, assignments, and course data.
- Helpful for cross-referencing student enrollment with risk data.`);
    }

    if (sections.length === 0) {
        return '\n\n[INTEGRATIONS]: No external integrations are currently connected. Use built-in tools (sendEmail, sendSMS, create_report) for all actions.';
    }

    return '\n\n─── CONNECTED INTEGRATIONS ───\n' + sections.join('\n\n');
}

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
    {
        type: 'function',
        function: {
            name: 'sendSMS',
            description: 'Send an SMS text message to a phone number. Use this when the educator asks to send a text message or SMS to a parent, guardian, or any phone number.',
            parameters: {
                type: 'object',
                properties: {
                    to: { type: 'string', description: 'The recipient phone number including country code (e.g., "+260777731615")' },
                    message: { type: 'string', description: 'The text message content to send.' },
                },
                required: ['to', 'message'],
            },
        },
    },
    // Simulations & Cohort
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
            name: 'sendEmail',
            description: 'Send an email to a recipient. Use this when the educator asks to send an email to a parent, guardian, or any email address.',
            parameters: {
                type: 'object',
                properties: {
                    to: { type: 'string', description: 'The recipient email address.' },
                    subject: { type: 'string', description: 'The email subject line.' },
                    body: { type: 'string', description: 'The HTML or plain text email body.' },
                },
                required: ['to', 'subject', 'body'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getCohortRiskAnalysis',
            description: 'Analyze risk patterns across an entire grade level or cohort of students. Identifies at-risk clusters and collective trends.',
            parameters: { type: 'object', properties: { gradeLevel: { type: 'string' }, riskThreshold: { type: 'number' } } }
        }
    },
    // Data entry tools
    {
        type: 'function',
        function: {
            name: 'addStudent',
            description: 'Add a new student to the school roster. Use when the teacher says "add a student", "enroll", or "register a new student".',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Full name of the student' },
                    grade: { type: 'string', description: 'Grade level (e.g. "9", "10", "11", "12")' },
                    studentId: { type: 'string', description: 'Student ID (auto-generated if omitted)' },
                    gpa: { type: 'number', description: 'Current GPA (0-4.0)' },
                    attendanceRate: { type: 'number', description: 'Attendance rate percentage (0-100)' },
                    parentName: { type: 'string', description: 'Parent or guardian name' },
                    parentEmail: { type: 'string', description: 'Parent email address' },
                    notes: { type: 'string', description: 'Any initial notes about the student' },
                },
                required: ['name', 'grade'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'updateStudentGrades',
            description: 'Update a student\'s academic records — GPA, attendance rate, assignment completion, late submissions, or behavior referrals. Use when teachers report new grades, updated attendance, or academic changes.',
            parameters: {
                type: 'object',
                properties: {
                    studentQuery: { type: 'string', description: 'Student name or ID to search for' },
                    gpa: { type: 'number', description: 'New GPA value (0-4.0)' },
                    attendanceRate: { type: 'number', description: 'New attendance rate percentage (0-100)' },
                    assignmentCompletion: { type: 'number', description: 'New assignment completion percentage (0-100)' },
                    lateSubmissions: { type: 'number', description: 'Updated late submission count' },
                    behaviorReferrals: { type: 'number', description: 'Updated behavior referral count' },
                    notes: { type: 'string', description: 'Additional notes to append' },
                },
                required: ['studentQuery'],
            },
        },
    },
];

// ─── Mastra Tool Executor ─────────────────────────────────────────────────────
type MastraTool = { execute?: (input: any, ctx: any) => Promise<any> };

async function executeMastraTool(name: string, args: Record<string, any>): Promise<string> {
    // Handle custom notification tools directly — bypass Mastra wrapper
    if (name === 'sendSMS') {
        try {
            const result = await sendSMSStep({ to: args.to, message: args.message });
            return JSON.stringify(result);
        } catch (err) {
            return JSON.stringify({ success: false, error: String(err) });
        }
    }
    if (name === 'sendEmail') {
        try {
            const result = await sendEmailStep({
                to: args.to,
                subject: args.subject,
                body: args.body,
                from: args.from || undefined, // Let AI specify from, or fall back to default noreply@withrin.co
            });
            return JSON.stringify(result);
        } catch (err) {
            return JSON.stringify({ success: false, error: String(err) });
        }
    }

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
        addStudent: addStudentTool,
        updateStudentGrades: updateStudentGradesTool,
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

        // ── START STREAM IMMEDIATELY — user sees think state within milliseconds ──
        // Everything else (Composio init, LLM calls) happens inside the async IIFE below.
        const c1Response = makeC1Response();
        c1Response.writeThinkItem({
            title: 'Analyzing your request…',
            description: 'RIN is thinking…',
        });

        // ── Encode responseStream → bytes for NextResponse (set up before the IIFE) ──
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

        // Fire response immediately so browser gets the stream — IIFE below populates it
        const streamResponse = new NextResponse(encodedStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });

        // ── Async background worker: init tools then drive the LLM loop ──
        (async () => {
            let composioTools: OpenAI.Chat.ChatCompletionTool[] = [];
            let composioSession: any = null;
            let composioInstance: any = null;

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

                // We create a session for the user — store its ID for meta-tool execution
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
                        description: t.function.description || 'Connected app action',
                        parameters: t.function.parameters || t.inputSchema || { type: 'object', properties: {} },
                    }
                })) as OpenAI.Chat.ChatCompletionTool[];

            } catch (err) {
                console.error('Failed to initialize Composio tools:', err);
            }

            // ── CUSTOM_TOOLS are built-in tools served by our own code — never route through Composio
            const CUSTOM_TOOLS = new Set([
                'getStudentProfile', 'getStudentAcademics', 'getInterventions',
                'searchStudentNotes', 'triggerWorkflow', 'requestAutomation',
                'sendSMS', 'sendEmail',
                'create_report', 'create_slides', 'edit_artifact',
            ]);
            const rawTools = [...C1_TOOLS, ...composioTools];
            const ALL_TOOLS = Array.from(
                new Map((rawTools as any[]).map(tool => [tool.function.name, tool])).values()
            ) as OpenAI.Chat.ChatCompletionTool[];

            // Inject student context into system prompt if available
            let systemContent = BASE_SYSTEM_PROMPT;

            // Inject user identity so emails/communications use real names
            try {
                const identitySession = await auth.api.getSession({ headers: req.headers });
                const uid = identitySession?.user?.id;
                if (uid) {
                    const { db: idb } = await import('@/db');
                    const { users: usersTable, schools: schoolsTable } = await import('@/db/schema');
                    const { eq } = await import('drizzle-orm');
                    if (idb) {
                        const [me] = await idb.select().from(usersTable).where(eq(usersTable.id, uid));
                        if (me) {
                            let schoolName = 'your school';
                            if (me.schoolId) {
                                const [sch] = await idb.select().from(schoolsTable).where(eq(schoolsTable.id, me.schoolId));
                                if (sch) schoolName = sch.name;
                            }
                            systemContent = `YOUR IDENTITY (the logged-in educator):\n- Name: ${me.name}\n- Email: ${me.email}\n- Role: ${me.role}\n- School: ${schoolName}\n\nWhen composing emails, letters, or any communication on behalf of this educator, ALWAYS sign with their real name, role, and school. NEVER use placeholders like [Your Name] or [School Name].\n\n${systemContent}`;
                        }
                    }
                }
            } catch (e) { /* identity lookup failed — proceed without */ }

            // ── Dynamic integration detection & prompt injection ──
            const composioToolNames = (composioTools as any[]).map((t: any) => t.function.name as string);
            systemContent += buildIntegrationPrompt(composioToolNames);

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
                    const MAX_ITERATIONS = 10; // allow complex multi-tool tasks (email + calendar + lookups)

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

                            // ── Friendly, opaque think items — never disclose internal tool names ──
                            const MASTRA_TOOLS = new Set(['getStudentProfile', 'getStudentAcademics', 'getInterventions', 'searchStudentNotes', 'triggerWorkflow', 'requestAutomation']);
                            if (!ARTIFACT_TOOLS.has(toolName)) {
                                let thinkTitle = 'Working on it…';
                                let thinkDesc = 'Gathering information to respond.';
                                if (MASTRA_TOOLS.has(toolName)) {
                                    thinkTitle = 'Looking at student records…';
                                    thinkDesc = toolArgs.query ? `Searching for information about "${toolArgs.query}".` : 'Pulling data from the school database.';
                                } else if (toolName === 'sendSMS') {
                                    thinkTitle = 'Sending SMS…';
                                    thinkDesc = `Delivering the message to ${toolArgs.to || 'the recipient'}.`;
                                } else if (toolName === 'sendEmail') {
                                    thinkTitle = 'Sending email…';
                                    thinkDesc = `Preparing message for ${toolArgs.to || 'the recipient'}.`;
                                } else if (toolName.startsWith('GOOGLECALENDAR')) {
                                    thinkTitle = 'Checking your calendar…';
                                    thinkDesc = 'Syncing with Google Calendar.';
                                } else if (toolName.startsWith('GMAIL')) {
                                    thinkTitle = 'Sending email…';
                                    thinkDesc = 'Preparing and sending the message.';
                                }
                                c1Response.writeThinkItem({ title: thinkTitle, description: thinkDesc });
                            }

                            let toolResult: string;
                            if (ARTIFACT_TOOLS.has(toolName)) {
                                // Artifact tools stream content directly into c1Response
                                toolResult = await executeArtifactTool(toolName, toolArgs, c1Response);
                            } else if (toolName.startsWith('COMPOSIO_')) {
                                // Composio META-tools (COMPOSIO_SEARCH_TOOLS, COMPOSIO_MANAGE_CONNECTIONS)
                                // These are internal framework tools — execute via executeMetaTool with the session ID
                                try {
                                    if (!composioInstance || !composioSession) {
                                        throw new Error("External integrations not initialized");
                                    }
                                    let executorUserId = 'anonymous_educator';
                                    try {
                                        const authSession = await auth.api.getSession({ headers: req.headers });
                                        executorUserId = authSession?.user?.id || 'anonymous_educator';
                                    } catch (e) { /* silent fail */ }

                                    // Meta-tools require sessionId (the session object ID), not userId
                                    const sessionId: string = (composioSession as any).id
                                        || (composioSession as any).sessionId
                                        || executorUserId;
                                    const result = await composioInstance.tools.executeMetaTool(toolName, {
                                        sessionId,
                                        arguments: toolArgs,
                                    });
                                    toolResult = typeof result === 'string' ? result : JSON.stringify(result);
                                } catch (error) {
                                    console.error(`[Meta Tool Error - ${toolName}]:`, error);
                                    // Gracefully degrade: return empty so conversation continues
                                    toolResult = JSON.stringify({ tools: [], message: 'Tool search unavailable, proceeding without discovery.' });
                                }

                            } else if (!CUSTOM_TOOLS.has(toolName) && (composioTools as any[]).some((t: any) => t.function.name === toolName)) {
                                // Regular Composio toolkit tools (GOOGLECALENDAR_*, GMAIL_*, etc.)
                                try {
                                    if (!composioInstance) {
                                        throw new Error("External integrations not initialized");
                                    }
                                    let executorUserId = 'anonymous_educator';
                                    try {
                                        const authSession = await auth.api.getSession({ headers: req.headers });
                                        executorUserId = authSession?.user?.id || 'anonymous_educator';
                                    } catch (e) { /* silent fail */ }

                                    // ✅ Correct Composio SDK execution pattern:
                                    // dangerouslySkipVersionCheck bypasses the version requirement for session-fetched tools
                                    const result = await composioInstance.tools.execute(toolName, {
                                        userId: executorUserId,
                                        arguments: toolArgs,
                                        dangerouslySkipVersionCheck: true,
                                    });
                                    toolResult = typeof result === 'string' ? result : JSON.stringify(result);
                                } catch (error) {
                                    console.error(`[External Tool Error - ${toolName}]:`, error);
                                    toolResult = JSON.stringify({ error: `Could not complete the action. Please ensure the required service is connected in Settings > Integrations. (${String(error)})` });
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
            })(); // end LLM loop IIFE

        })(); // end background worker IIFE

        return streamResponse;
    } catch (error) {
        console.error('[/api/chat] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
