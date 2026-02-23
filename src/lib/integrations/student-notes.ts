import { ExecutionResult, StepContext } from "../workflow-engine/types";
import { db } from "@/db";
import { studentNotes } from "@/db/schema";

export interface AddNoteConfig {
    studentId: string;
    content: string;
    type?: string;
    authorId: string;
    _context?: StepContext;
}

export async function addStudentNoteStep(config: AddNoteConfig): Promise<ExecutionResult> {
    const { studentId, content, type = 'general', authorId, _context } = config;

    console.log(`[Workflow: ${_context?.nodeName}] Adding note for student ${studentId}...`);

    if (!db) {
        return { success: false, error: "Database not connected" };
    }

    try {
        await db.insert(studentNotes).values({
            id: `note_${Date.now()}`,
            studentId,
            content: `[Automated Workflow: ${_context?.nodeName}] ${content}`,
            type,
            authorId,
        });

        return {
            success: true,
            data: { studentId, message: "Note added successfully" }
        };
    } catch (err: any) {
        console.error("Add Note Error:", err);
        return { success: false, error: err.message };
    }
}
