import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { workflows } from '@/db/schema';

export const requestAutomationTool = createTool({
    id: 'requestAutomation',
    name: 'Request Automation',
    description: 'Use this tool when a teacher asks for a NEW smart notification or automation in chat (e.g. "Remind me if Sarah misses class tomorrow"). It creates a draft workflow they can enable.',
    inputSchema: z.object({
        name: z.string().describe('A short, descriptive name for the requested automation.'),
        description: z.string().describe('What the automation is supposed to do.'),
        triggerType: z.string().describe('The type of event that triggers this (e.g., "Student Event", "Cron Schedule")'),
        actionType: z.string().describe('The resulting action (e.g., "Send SMS", "Send Email", "Flag Review")'),
        config: z.record(z.any()).describe('Initial configuration parameters derived from the chat.'),
    }),
    execute: async ({ context }) => {
        const { name, description, triggerType, actionType, config } = context;

        try {
            // Generate a primitive React Flow structure to match the request
            const defaultNodes = [
                {
                    id: '1',
                    type: 'trigger',
                    position: { x: 50, y: 50 },
                    data: { label: triggerType, config: config }
                },
                {
                    id: '2',
                    type: 'action',
                    position: { x: 50, y: 150 },
                    data: { label: actionType, config: config }
                }
            ];

            const defaultEdges = [
                { id: 'e1-2', source: '1', target: '2' }
            ];

            const [newWf] = await db.insert(workflows).values({
                id: `wf_draft_${Date.now()}`,
                name: `${name} (AI Draft)`,
                description: description,
                active: false,
                nodes: defaultNodes,
                edges: defaultEdges
            }).returning();

            return {
                success: true,
                message: `Created a draft workflow called "${newWf.name}". The teacher can activate it in the Workflows tab.`,
                workflowId: newWf.id
            };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
});
