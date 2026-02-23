import { ExecutionResult, StepContext } from "../workflow-engine/types";
import { Composio } from "@composio/core";

const apiKey = process.env.COMPOSIO_API_KEY;

// Helper to execute a Composio tool action
async function executeComposioAction(
    actionName: string,
    params: Record<string, any>,
    context?: StepContext
): Promise<ExecutionResult> {
    console.log(`[Workflow: ${context?.nodeName}] Executing Composio action: ${actionName}`);

    if (!apiKey) {
        console.warn("COMPOSIO_API_KEY is not set. Simulating action.");
        return {
            success: true,
            data: { simulated: true, action: actionName, params }
        };
    }

    try {
        const composio = new Composio({ apiKey });
        const result = await composio.tools.execute({
            action: actionName,
            params,
            entityId: "default",
            dangerouslySkipVersionCheck: true,
        } as any);

        return {
            success: true,
            data: result
        };
    } catch (err: any) {
        console.error(`[Composio:${actionName}] Error:`, err);
        return { success: false, error: err.message };
    }
}

// ─── Slack ─────────────────────────────────────────────────────────────────────
export interface SlackMessageConfig {
    channel: string;
    message: string;
    _context?: StepContext;
}

export async function slackMessageStep(config: SlackMessageConfig): Promise<ExecutionResult> {
    return executeComposioAction(
        "SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL",
        { channel: config.channel, text: config.message },
        config._context
    );
}

// ─── Gmail ─────────────────────────────────────────────────────────────────────
export interface GmailSendConfig {
    to: string;
    subject: string;
    body: string;
    _context?: StepContext;
}

export async function gmailSendStep(config: GmailSendConfig): Promise<ExecutionResult> {
    return executeComposioAction(
        "GMAIL_SEND_EMAIL",
        { to: config.to, subject: config.subject, body: config.body },
        config._context
    );
}

// ─── Google Calendar ───────────────────────────────────────────────────────────
export interface CalendarEventConfig {
    title: string;
    attendees?: string;
    startTime?: string;
    endTime?: string;
    _context?: StepContext;
}

export async function calendarEventStep(config: CalendarEventConfig): Promise<ExecutionResult> {
    const attendeesList = config.attendees
        ? config.attendees.split(',').map(e => ({ email: e.trim() }))
        : [];

    return executeComposioAction(
        "GOOGLECALENDAR_CREATE_EVENT",
        {
            summary: config.title,
            attendees: attendeesList,
            start: { dateTime: config.startTime || new Date().toISOString() },
            end: { dateTime: config.endTime || new Date(Date.now() + 3600000).toISOString() },
            conferenceData: { createRequest: { requestId: `rin-${Date.now()}` } },
        },
        config._context
    );
}

// ─── Notion ────────────────────────────────────────────────────────────────────
export interface NotionPageConfig {
    pageTitle: string;
    content: string;
    _context?: StepContext;
}

export async function notionPageStep(config: NotionPageConfig): Promise<ExecutionResult> {
    return executeComposioAction(
        "NOTION_CREATE_A_PAGE",
        {
            title: config.pageTitle,
            content: config.content,
        },
        config._context
    );
}

// ─── Google Sheets ─────────────────────────────────────────────────────────────
export interface SheetsRowConfig {
    spreadsheetId: string;
    range: string;
    values: string;
    _context?: StepContext;
}

export async function sheetsRowStep(config: SheetsRowConfig): Promise<ExecutionResult> {
    const rowValues = config.values.split(',').map(v => v.trim());

    return executeComposioAction(
        "GOOGLESHEETS_BATCH_UPDATE_SPREADSHEET",
        {
            spreadsheet_id: config.spreadsheetId,
            range: config.range,
            values: [rowValues],
        },
        config._context
    );
}

// ─── Google Drive ──────────────────────────────────────────────────────────────
export interface DriveUploadConfig {
    fileName: string;
    folder?: string;
    content?: string;
    _context?: StepContext;
}

export async function driveUploadStep(config: DriveUploadConfig): Promise<ExecutionResult> {
    return executeComposioAction(
        "GOOGLEDRIVE_CREATE_A_FILE_FROM_TEXT",
        {
            name: config.fileName,
            content: config.content || '',
            folder_name: config.folder || undefined,
        },
        config._context
    );
}
