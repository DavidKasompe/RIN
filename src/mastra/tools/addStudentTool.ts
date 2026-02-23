import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students } from '@/db/schema';

export const addStudentTool = createTool({
    id: 'addStudent',
    description: 'Add a new student to the school roster. Use when the teacher says "add a student", "enroll", or "register a new student".',
    inputSchema: z.object({
        name: z.string().describe('Full name of the student'),
        grade: z.string().describe('Grade level (e.g. "9", "10", "11", "12")'),
        studentId: z.string().optional().describe('Student ID (auto-generated if omitted)'),
        gpa: z.number().optional().describe('Current GPA (0-4.0)'),
        attendanceRate: z.number().optional().describe('Attendance rate percentage (0-100)'),
        parentName: z.string().optional().describe('Parent or guardian name'),
        parentEmail: z.string().optional().describe('Parent email address'),
        parentPhone: z.string().optional().describe('Parent phone number'),
        notes: z.string().optional().describe('Any initial notes about the student'),
    }),
    execute: async ({ name, grade, studentId, gpa, attendanceRate, parentName, parentEmail, parentPhone, notes }) => {
        if (!db) return { success: false, message: 'Database disconnected' };

        const id = `stu-${Date.now()}`;
        const sid = studentId || `STU-${Date.now().toString(36).toUpperCase()}`;

        // Build parent info as a note if provided
        const parentInfo = [parentName, parentEmail, parentPhone].filter(Boolean).length > 0
            ? `Parent: ${parentName || 'N/A'} | ${parentEmail || 'N/A'} | ${parentPhone || 'N/A'}`
            : null;
        const combinedNotes = [notes, parentInfo].filter(Boolean).join('\n');

        const [row] = await db.insert(students).values({
            id,
            userId: 'u1', // default system user
            name,
            studentId: sid,
            grade,
            gpa: gpa ?? 3.0,
            attendanceRate: attendanceRate ?? 90,
            assignmentCompletion: 85,
            behaviorReferrals: 0,
            lateSubmissions: 0,
            notes: combinedNotes || null,
            tags: [],
        }).returning();

        return {
            success: true,
            message: `Successfully added ${name} (${sid}) to grade ${grade}.`,
            student: { id: row.id, name: row.name, studentId: row.studentId, grade: row.grade, gpa: row.gpa },
        };
    },
});
