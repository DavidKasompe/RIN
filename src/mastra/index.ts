import { Mastra } from '@mastra/core';
import { rinAgent } from './agents/rin-agent';

export * from './tools/triggerWorkflowTool';
export * from './tools/requestAutomationTool';

export const mastra = new Mastra({
    agents: { rinAgent },
});

