import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const checkPlagiarismTool = createTool({
    id: 'checkPlagiarism',
    description: 'Check a student submission for plagiarism against peer submissions and the student\'s own previous work using semantic similarity. Returns a similarity score and flags if above threshold.',
    inputSchema: z.object({
        studentId: z.string().describe('RIN student ID'),
        assignmentId: z.string().describe('Moodle assignment ID'),
        submissionText: z.string().describe('The full text of the student\'s submission'),
    }),
    outputSchema: z.object({
        similarityScore: z.number().optional(),
        flagged: z.boolean().optional(),
        flagReason: z.string().optional().nullable(),
        matchedSources: z.array(z.any()).optional(),
        status: z.string().optional(),
        message: z.string(),
    }),
    execute: async ({ studentId, assignmentId, submissionText }) => {
        try {
            const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';
            const res = await fetch(`${baseUrl}/api/plagiarism/check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, assignmentId, submissionText }),
            });
            const data = await res.json();
            if (data.error) return { message: `Plagiarism check failed: ${data.error}` };
            return {
                similarityScore: data.similarityScore,
                flagged: data.flagged,
                flagReason: data.flagReason,
                matchedSources: data.matchedSources,
                status: data.status,
                message: data.flagged
                    ? `Submission flagged: ${Math.round(data.similarityScore * 100)}% similarity (${data.flagReason}).`
                    : `Submission is clean (${Math.round(data.similarityScore * 100)}% max similarity).`,
            };
        } catch (err: any) {
            return { message: err.message || 'Failed to run plagiarism check.' };
        }
    },
});
