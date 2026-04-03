import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { moodleConnections, students } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const syncMoodleStudentTool = createTool({
    id: 'syncMoodleStudent',
    description: 'Syncs a Moodle user into the RIN students table, linking their moodle_user_id. Creates the student if they do not exist yet.',
    inputSchema: z.object({
        schoolId: z.string().describe('RIN school ID'),
        userId: z.string().describe('RIN user (educator) ID performing the sync'),
        moodleUserId: z.number().describe('Moodle user ID'),
        fullName: z.string().describe('Student full name from Moodle'),
        email: z.string().optional().describe('Student email from Moodle'),
        courseIds: z.array(z.number()).optional().describe('Moodle course IDs the student is enrolled in'),
    }),
    outputSchema: z.object({
        studentId: z.string().optional(),
        message: z.string(),
    }),
    execute: async ({ schoolId, userId, moodleUserId, fullName, email, courseIds }) => {
        if (!db) return { message: 'Database not available' };
        try {
            // Check if student already exists for this school with this moodleUserId
            const existing = await db
                .select()
                .from(students)
                .where(
                    and(
                        eq(students.schoolId, schoolId),
                        eq(students.moodleUserId, moodleUserId)
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                // Update course IDs
                await db
                    .update(students)
                    .set({ moodleCourseIds: courseIds ?? [], updatedAt: new Date() })
                    .where(eq(students.id, existing[0].id));
                return { studentId: existing[0].id, message: `Student "${fullName}" already exists — updated Moodle course IDs.` };
            }

            // Insert new student from Moodle data
            const newId = 'stu_' + Math.random().toString(36).substr(2, 9);
            await db.insert(students).values({
                id: newId,
                userId,
                schoolId,
                name: fullName,
                studentId: `MOODLE-${moodleUserId}`,
                email: email ?? null,
                grade: 'University',
                moodleUserId,
                moodleCourseIds: courseIds ?? [],
                institutionType: 'university',
            });

            return { studentId: newId, message: `Student "${fullName}" imported from Moodle.` };
        } catch (err: any) {
            return { message: err.message || 'Failed to sync Moodle student.' };
        }
    },
});
