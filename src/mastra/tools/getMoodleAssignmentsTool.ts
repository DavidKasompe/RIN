import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { moodleConnections, students } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function getMoodleConfig(studentId: string) {
    if (!db) throw new Error('Database not available');
    const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
    if (!student?.schoolId) throw new Error('Student has no school attached');
    const [conn] = await db.select().from(moodleConnections).where(eq(moodleConnections.schoolId, student.schoolId)).limit(1);
    if (!conn) throw new Error('No Moodle connection found for this school');
    return { url: conn.moodleUrl, token: conn.moodleToken };
}

export const getMoodleAssignmentsTool = createTool({
    id: 'getMoodleAssignments',
    description: 'Fetches pending and submitted assignments for a student from Moodle. Useful for detecting overdue work contributing to risk.',
    inputSchema: z.object({
        studentId: z.string().describe('RIN student ID'),
        moodleUserId: z.number().describe('Moodle user ID'),
        courseIds: z.array(z.number()).optional().describe('Optional: list of course IDs to filter by'),
    }),
    outputSchema: z.object({
        assignments: z.any(),
        message: z.string(),
    }),
    execute: async ({ studentId, moodleUserId, courseIds }) => {
        try {
            const config = await getMoodleConfig(studentId);

            // Fetch assignments for specified courses
            const params = new URLSearchParams({
                wstoken: config.token,
                wsfunction: 'mod_assign_get_assignments',
                moodlewsrestformat: 'json',
            });
            if (courseIds?.length) {
                courseIds.forEach((id, i) => params.set(`courseids[${i}]`, String(id)));
            }

            const res = await fetch(`${config.url}/webservice/rest/server.php?${params}`);
            const data = await res.json();
            if (data?.exception) return { assignments: [], message: `Moodle error: ${data.message}` };

            const assignments = (data.courses ?? []).flatMap((c: any) =>
                (c.assignments ?? []).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    course: c.fullname,
                    dueDate: a.duedate ? new Date(a.duedate * 1000).toISOString() : null,
                    cutoffDate: a.cutoffdate ? new Date(a.cutoffdate * 1000).toISOString() : null,
                }))
            );

            return { assignments, message: `Found ${assignments.length} assignments.` };
        } catch (err: any) {
            return { assignments: [], message: err.message || 'Failed to fetch Moodle assignments.' };
        }
    },
});
