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
    }
};

export function getStepImporter(actionType: string): StepImporter | undefined {
    return ACTION_REGISTRY[actionType];
}

export function getActionLabel(actionType: string): string {
    return Object.keys(ACTION_REGISTRY).find(key => key === actionType) || actionType;
}
