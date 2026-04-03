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

export const getMoodleAttendanceTool = createTool({
    id: 'getMoodleAttendance',
    description: 'Fetches session-level attendance records from Moodle for a student. Requires the Moodle Attendance plugin to be installed on the instance.',
    inputSchema: z.object({
        studentId: z.string().describe('RIN student ID'),
        moodleUserId: z.number().describe('Moodle user ID'),
        sessionId: z.number().optional().describe('Optional: specific attendance session ID'),
    }),
    outputSchema: z.object({
        attendance: z.any(),
        message: z.string(),
    }),
    execute: async ({ studentId, moodleUserId, sessionId }) => {
        try {
            const config = await getMoodleConfig(studentId);
            const params = new URLSearchParams({
                wstoken: config.token,
                wsfunction: 'mod_attendance_get_session_attendance',
                moodlewsrestformat: 'json',
                sessionid: String(sessionId ?? 0),
            });
            const res = await fetch(`${config.url}/webservice/rest/server.php?${params}`);
            const data = await res.json();
            if (data?.exception) return { attendance: [], message: `Moodle error: ${data.message}` };
            return { attendance: data, message: 'Attendance data fetched.' };
        } catch (err: any) {
            return { attendance: [], message: err.message || 'Failed to fetch attendance.' };
        }
    },
});
