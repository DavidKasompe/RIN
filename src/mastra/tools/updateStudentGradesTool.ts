import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students } from '@/db/schema';
import { ilike, or, eq } from 'drizzle-orm';

export const updateStudentGradesTool = createTool({
    id: 'updateStudentGrades',
    description: 'Update a student\'s academic records — GPA, attendance rate, assignment completion, late submissions, or behavior referrals. Use when teachers report new grades, updated attendance, or academic changes.',
    inputSchema: z.object({
        studentQuery: z.string().describe('The name or student ID to search for'),
        gpa: z.number().optional().describe('New GPA value (0-4.0)'),
        attendanceRate: z.number().optional().describe('New attendance rate percentage (0-100)'),
        assignmentCompletion: z.number().optional().describe('New assignment completion percentage (0-100)'),
        lateSubmissions: z.number().optional().describe('Updated late submission count'),
        behaviorReferrals: z.number().optional().describe('Updated behavior referral count'),
        notes: z.string().optional().describe('Additional notes to append'),
    }),
    execute: async ({ studentQuery, gpa, attendanceRate, assignmentCompletion, lateSubmissions, behaviorReferrals, notes }) => {
        if (!db) return { success: false, message: 'Database disconnected' };

        // Find student by fuzzy name/ID match
        const [student] = await db.select().from(students).where(
            or(
                ilike(students.name, `%${studentQuery}%`),
                ilike(students.studentId, `%${studentQuery}%`)
            )
        );

        if (!student) {
            return { success: false, message: `Could not find student matching "${studentQuery}". Please check the name or ID.` };
        }

        // Build update object with only provided fields
        const updates: Record<string, any> = { updatedAt: new Date() };
        const changes: string[] = [];

        if (gpa !== undefined) { updates.gpa = gpa; changes.push(`GPA → ${gpa}`); }
        if (attendanceRate !== undefined) { updates.attendanceRate = attendanceRate; changes.push(`Attendance → ${attendanceRate}%`); }
        if (assignmentCompletion !== undefined) { updates.assignmentCompletion = assignmentCompletion; changes.push(`Assignments → ${assignmentCompletion}%`); }
        if (lateSubmissions !== undefined) { updates.lateSubmissions = lateSubmissions; changes.push(`Late Submissions → ${lateSubmissions}`); }
        if (behaviorReferrals !== undefined) { updates.behaviorReferrals = behaviorReferrals; changes.push(`Behavior Referrals → ${behaviorReferrals}`); }
        if (notes) {
            updates.notes = student.notes ? `${student.notes}\n${notes}` : notes;
            changes.push('Notes updated');
        }

        if (changes.length === 0) {
            return { success: false, message: 'No fields provided to update. Specify at least one of: gpa, attendanceRate, assignmentCompletion, lateSubmissions, behaviorReferrals, or notes.' };
        }

        await db.update(students).set(updates).where(eq(students.id, student.id));

        return {
            success: true,
            message: `Updated ${student.name}'s records: ${changes.join(', ')}.`,
            studentName: student.name,
            changes,
        };
    },
});
