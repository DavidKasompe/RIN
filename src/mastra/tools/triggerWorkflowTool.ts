import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '@/db';
import { workflows } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { executeWorkflow } from '@/lib/workflow-engine/executor';

export const triggerWorkflowTool = createTool({
    id: 'triggerWorkflow',
    name: 'Trigger Workflow',
    description: 'Triggers a predefined workflow by name or ID. Use this when the user asks to start an automation sequence, send notifications, or run a class-wide scan.',
    inputSchema: z.object({
        workflowIdOrName: z.string().describe('The ID or exact name of the workflow to run.'),
        triggerData: z.record(z.any()).describe('Optional data to pass to the workflow trigger (e.g., studentId, riskScore).'),
    }),
    execute: async ({ context }) => {
        const { workflowIdOrName, triggerData } = context;

        try {
            // Find the workflow by ID or name
            const wfResult = await db.select().from(workflows).where(eq(workflows.id, workflowIdOrName));
            let wf = wfResult[0];

            if (!wf) {
                // Try by name
                const wfByName = await db.select().from(workflows).where(eq(workflows.name, workflowIdOrName));
                wf = wfByName[0];
            }

            if (!wf) {
                return { success: false, error: `Workflow "${workflowIdOrName}" not found.` };
            }

            if (!wf.active) {
                return { success: false, error: `Workflow "${wf.name}" is currently deactivated.` };
            }

            // Execute the workflow
            const result = await executeWorkflow({
                nodes: wf.nodes as any,
                edges: wf.edges as any,
                triggerInput: triggerData,
                workflowId: wf.id,
            });

            return {
                success: result.success,
                message: result.success ? `Successfully started workflow "${wf.name}".` : `Failed to run workflow "${wf.name}".`,
                details: result
            };

        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },
});
