import { Mastra } from '@mastra/core';
import { rinAgent } from './agents/rin-agent';

export const mastra = new Mastra({
    agents: { rinAgent },
});
