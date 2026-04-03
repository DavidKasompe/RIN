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

export const getMoodleStudentGradesTool = createTool({
    id: 'getMoodleStudentGrades',
    description: 'Fetches all Moodle grade items for a student across their enrolled courses. Use this when you need up-to-date academic performance from Moodle.',
    inputSchema: z.object({
        studentId: z.string().describe('RIN student ID'),
        moodleUserId: z.number().describe('Moodle user ID (stored on the student record)'),
        courseId: z.number().optional().describe('Optional: filter by a specific Moodle course ID'),
    }),
    outputSchema: z.object({
        grades: z.any(),
        message: z.string(),
    }),
    execute: async ({ studentId, moodleUserId, courseId }) => {
        try {
            const config = await getMoodleConfig(studentId);
            const params = new URLSearchParams({
                wstoken: config.token,
                wsfunction: 'gradereport_user_get_grade_items',
                moodlewsrestformat: 'json',
                userid: String(moodleUserId),
                ...(courseId ? { courseid: String(courseId) } : {}),
            });
            const res = await fetch(`${config.url}/webservice/rest/server.php?${params}`);
            const data = await res.json();
            if (data?.exception) return { grades: [], message: `Moodle error: ${data.message}` };
            return {
                grades: data.usergrades?.[0]?.gradeitems ?? [],
                message: 'Successfully fetched Moodle grades.',
            };
        } catch (err: any) {
            return { grades: [], message: err.message || 'Failed to fetch Moodle grades.' };
        }
    },
});
