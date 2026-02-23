import { StepImporter } from './types';

// Registry maps UI action types to dynamic imports for code splitting
export const ACTION_REGISTRY: Record<string, StepImporter> = {
    "Send Email": {
        importer: () => import('../integrations/resend'),
        stepFunction: "sendEmailStep"
    },
    "Send SMS": {
        importer: () => import('../integrations/twilio'),
        stepFunction: "sendSMSStep"
    },
    "Check Attendance": {
        importer: () => import('../integrations/student-data'),
        stepFunction: "checkAttendanceMilestones"
    },
    "Check Grades": {
        importer: () => import('../integrations/student-data'),
        stepFunction: "checkGradeDrops"
    },
    "Add Student Note": {
        importer: () => import('../integrations/student-notes'),
        stepFunction: "addStudentNoteStep"
    },
    // ── Integration Actions (Composio) ──
    "Slack Message": {
        importer: () => import('../integrations/composio-steps'),
        stepFunction: "slackMessageStep"
    },
    "Gmail Send": {
        importer: () => import('../integrations/composio-steps'),
        stepFunction: "gmailSendStep"
    },
    "Calendar Event": {
        importer: () => import('../integrations/composio-steps'),
        stepFunction: "calendarEventStep"
    },
    "Notion Page": {
        importer: () => import('../integrations/composio-steps'),
        stepFunction: "notionPageStep"
    },
    "Sheets Row": {
        importer: () => import('../integrations/composio-steps'),
        stepFunction: "sheetsRowStep"
    },
    "Drive Upload": {
        importer: () => import('../integrations/composio-steps'),
        stepFunction: "driveUploadStep"
    },
};

export function getStepImporter(actionType: string): StepImporter | undefined {
    return ACTION_REGISTRY[actionType];
}

export function getActionLabel(actionType: string): string {
    return Object.keys(ACTION_REGISTRY).find(key => key === actionType) || actionType;
}
