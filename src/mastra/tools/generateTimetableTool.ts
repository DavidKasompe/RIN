import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const generateTimetableTool = createTool({
    id: 'generateTimetable',
    description: 'Parses raw text (pasted timetable, uploaded document content) and generates a structured timetable. Returns entries ready to be saved. Call this when a user pastes or uploads a schedule document.',
    inputSchema: z.object({
        cohortId: z.string().describe('RIN cohort ID this timetable belongs to'),
        rawScheduleText: z.string().describe('The raw timetable text to parse'),
        termStart: z.string().optional().describe('Term start date ISO string'),
        termEnd: z.string().optional().describe('Term end date ISO string'),
    }),
    outputSchema: z.object({
        entries: z.array(z.any()),
        message: z.string(),
    }),
    execute: async ({ cohortId, rawScheduleText, termStart, termEnd }) => {
        try {
            const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';
            const res = await fetch(`${baseUrl}/api/timetable/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawScheduleText, cohortId, termStart, termEnd }),
            });
            const data = await res.json();
            if (data.error) return { entries: [], message: `Timetable generation failed: ${data.error}` };
            return {
                entries: data.entries,
                message: `Parsed ${data.entries?.length ?? 0} class sessions from the schedule. Review and confirm to save.`,
            };
        } catch (err: any) {
            return { entries: [], message: err.message || 'Failed to generate timetable.' };
        }
    },
});
