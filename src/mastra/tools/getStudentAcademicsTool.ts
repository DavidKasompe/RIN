import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

export const getStudentAcademicsTool = createTool({
    id: 'getStudentAcademics',
    description: 'Fetch a student\'s GPA, automated assignment completion status, and late submission counts from the database.',
    inputSchema: z.object({
        query: z.string().describe('The student ID or name to search for (e.g., "STU-123" or "Marcus").'),
    }),
    outputSchema: z.object({
        academics: z.any().optional(),
        message: z.string(),
    }),
    execute: async ({ query }) => {
        if (!db) return { message: "Database connection not initialized." };
        try {
            const results = await db
                .select({
                    name: students.name,
                    studentId: students.studentId,
                    gpa: students.gpa,
                    attendanceRate: students.attendanceRate,
                    assignmentCompletion: students.assignmentCompletion,
                    lateSubmissions: students.lateSubmissions,
                })
                .from(students)
                .where(
                    or(
                        eq(students.studentId, query),
                        ilike(students.name, `%${query}%`)
                    )
                );

            if (results.length === 0) {
                return { message: `No student found matching "${query}".` };
            }

            return {
                academics: results[0],
                message: 'Successfully retrieved academic data.',
            };
        } catch (error) {
            console.error('getStudentAcademicsTool error:', error);
            return { message: 'Error fetching academic data from the database.' };
        }
    },
});
