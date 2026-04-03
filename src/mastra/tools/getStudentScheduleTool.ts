import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { studentTimetables, timetableEntries, timetableSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const getStudentScheduleTool = createTool({
    id: 'getStudentSchedule',
    description: "Retrieves a student's full weekly timetable. Use this when the user asks about a student's schedule or wants to find free time for a meeting.",
    inputSchema: z.object({
        studentId: z.string().describe('RIN student ID'),
    }),
    outputSchema: z.object({
        schedule: z.array(z.any()),
        message: z.string(),
    }),
    execute: async ({ studentId }) => {
        if (!db) return { schedule: [], message: 'Database not available' };
        try {
            const rows = await db
                .select({
                    entry: timetableEntries,
                    slot: timetableSlots,
                    enrolled: studentTimetables.enrolled,
                })
                .from(studentTimetables)
                .leftJoin(timetableEntries, eq(studentTimetables.timetableEntryId, timetableEntries.id))
                .leftJoin(timetableSlots, eq(timetableEntries.slotId, timetableSlots.id))
                .where(eq(studentTimetables.studentId, studentId));

            if (rows.length === 0) {
                return { schedule: [], message: 'No timetable entries found for this student.' };
            }

            const schedule = rows.map(r => ({
                day: r.slot ? DAY_NAMES[r.slot.dayOfWeek] : 'Unknown',
                startTime: r.slot?.startTime,
                endTime: r.slot?.endTime,
                subject: r.entry?.subject,
                room: r.entry?.room,
                classType: r.entry?.classType,
                slotLabel: r.slot?.slotLabel,
            })).sort((a, b) => {
                const dayDiff = DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day);
                if (dayDiff !== 0) return dayDiff;
                return (a.startTime ?? '').localeCompare(b.startTime ?? '');
            });

            return { schedule, message: `Found ${schedule.length} classes in the student's weekly schedule.` };
        } catch (err: any) {
            return { schedule: [], message: err.message || 'Failed to get student schedule.' };
        }
    },
});
