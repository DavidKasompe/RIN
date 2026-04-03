import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { timetableEntries, timetableSlots, studentTimetables } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const checkSlotAvailabilityTool = createTool({
    id: 'checkSlotAvailability',
    description: 'Checks whether a student or cohort is free at a given day and time. Use before scheduling an intervention meeting to avoid conflicts.',
    inputSchema: z.object({
        cohortId: z.string().optional().describe('RIN cohort ID to check'),
        studentId: z.string().optional().describe('RIN student ID to check'),
        dayOfWeek: z.number().min(0).max(4).describe('0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday'),
        startTime: z.string().describe('Start time in HH:MM format'),
        endTime: z.string().describe('End time in HH:MM format'),
    }),
    outputSchema: z.object({
        available: z.boolean(),
        conflicts: z.array(z.any()),
        message: z.string(),
    }),
    execute: async ({ cohortId, studentId, dayOfWeek, startTime, endTime }) => {
        if (!db) return { available: false, conflicts: [], message: 'Database not available' };
        try {
            // Get all slots on this day
            const slots = await db
                .select()
                .from(timetableSlots)
                .where(eq(timetableSlots.dayOfWeek, dayOfWeek));

            // Find overlapping slots
            const overlapping = slots.filter(slot => {
                // Times overlap if start < other.end AND end > other.start
                return startTime < slot.endTime && endTime > slot.startTime;
            });

            if (overlapping.length === 0) {
                return { available: true, conflicts: [], message: `No classes scheduled at this time — slot is free.` };
            }

            const conflicts: any[] = [];

            for (const slot of overlapping) {
                if (cohortId) {
                    const entries = await db
                        .select()
                        .from(timetableEntries)
                        .where(and(eq(timetableEntries.slotId, slot.id), eq(timetableEntries.cohortId, cohortId)));
                    conflicts.push(...entries.map(e => ({ ...e, slotLabel: slot.slotLabel })));
                }
                if (studentId) {
                    const stEntries = await db
                        .select({ entry: timetableEntries })
                        .from(studentTimetables)
                        .leftJoin(timetableEntries, eq(studentTimetables.timetableEntryId, timetableEntries.id))
                        .where(and(eq(studentTimetables.studentId, studentId), eq(timetableEntries.slotId, slot.id)));
                    conflicts.push(...stEntries.map(e => ({ ...e.entry, slotLabel: slot.slotLabel })));
                }
            }

            if (conflicts.length === 0) {
                return { available: true, conflicts: [], message: 'No conflicts found — slot is free.' };
            }

            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            return {
                available: false,
                conflicts,
                message: `${conflicts.length} conflict(s) found on ${days[dayOfWeek]} between ${startTime}–${endTime}: ${conflicts.map(c => c.subject).join(', ')}.`,
            };
        } catch (err: any) {
            return { available: false, conflicts: [], message: err.message || 'Failed to check availability.' };
        }
    },
});
