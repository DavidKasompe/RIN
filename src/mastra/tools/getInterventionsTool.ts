import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { students, analyses, calendarEvents } from '@/db/schema';
import { eq, or, ilike, desc } from 'drizzle-orm';

export const getInterventionsTool = createTool({
    id: 'getInterventions',
    description: 'Fetch a student\'s intervention history, behavioral events, scheduling meetings, and their active action plan.',
    inputSchema: z.object({
        query: z.string().describe('The student ID or name to search for (e.g., "STU-123" or "Marcus").'),
    }),
    outputSchema: z.object({
        activePlan: z.string().optional(),
        events: z.array(z.any()).optional(),
        behaviorReferrals: z.number().optional(),
        message: z.string(),
    }),
    execute: async ({ query }) => {
        if (!db) return { message: "Database connection not initialized." };
        try {
            // 1. Find the student
            const studentResults = await db
                .select({ id: students.id, name: students.name, behaviorReferrals: students.behaviorReferrals })
                .from(students)
                .where(
                    or(
                        eq(students.studentId, query),
                        ilike(students.name, `%${query}%`)
                    )
                );

            if (studentResults.length === 0) {
                return { message: `No student found matching "${query}".` };
            }
            
            const studentId = studentResults[0].id;
            const behaviorReferrals = studentResults[0].behaviorReferrals;

            // 2. Fetch latest analysis for active intervention plan
            const latestAnalysisLists = await db
                .select({ interventionPlan: analyses.interventionPlan })
                .from(analyses)
                .where(eq(analyses.studentId, studentId))
                .orderBy(desc(analyses.createdAt))
                .limit(1);
            
            const activePlan = latestAnalysisLists.length > 0 ? latestAnalysisLists[0].interventionPlan || undefined : undefined;

            // 3. Fetch calendar events to see scheduled or past interventions
            const events = await db
                .select()
                .from(calendarEvents)
                .where(eq(calendarEvents.studentId, studentId))
                .orderBy(desc(calendarEvents.date));

            return {
                activePlan,
                events,
                behaviorReferrals,
                message: 'Successfully retrieved intervention history and active plan.',
            };
        } catch (error) {
            console.error('getInterventionsTool error:', error);
            return { message: 'Error fetching intervention data from the database.' };
        }
    },
});
