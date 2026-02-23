import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
    apiKey: process.env.THESYS_API_KEY, // We can reuse the Thesys key for general OpenAI calls if it supports gpt-4o, otherwise fallback.
    baseURL: 'https://api.thesys.dev/v1/embed/', // Assuming the embed proxy allows standard structured outputs
});

const WorkflowNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.object({
        label: z.string(),
        description: z.string().optional(),
        config: z.record(z.any()).optional(),
        type: z.string().optional(),
    }),
});

const WorkflowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
});

const WorkflowResponseSchema = z.object({
    name: z.string(),
    description: z.string(),
    nodes: z.array(WorkflowNodeSchema),
    edges: z.array(WorkflowEdgeSchema),
});

const SYSTEM_PROMPT = `You are a visual workflow builder AI. Your job is to convert the user's natural language request into a valid JSON array of React Flow nodes and edges.

AVAILABLE NODE TYPES:
1. trigger: The starting point. 
   - Types: 'Webhook Event', 'Cron Schedule', 'Student Event'
2. action: Built-in notification actions.
   - Types: 'Send Email' (config: { to, subject, body }), 'Send SMS' (config: { to, message }), 'Add Student Note'
3. integration: External integration actions (connected via Composio).
   - Types:
     - 'Slack Message' (config: { channel, message }) — post to a Slack channel
     - 'Gmail Send' (config: { to, subject, body }) — send email via Gmail
     - 'Calendar Event' (config: { title, attendees }) — create a Google Calendar event  
     - 'Notion Page' (config: { pageTitle, content }) — create a Notion page
     - 'Sheets Row' (config: { spreadsheetId, range, values }) — append a row to Google Sheets
     - 'Drive Upload' (config: { fileName, folder }) — upload a file to Google Drive
4. agent: An AI step.
   - Types: 'AI Analysis'
5. condition: A rule to evaluate (JS expression).
   - Requires config: { expression }

RULES:
- Always start with exactly ONE trigger node.
- Nodes flow from top to bottom (y positions should increase by roughly 100 for each step).
- Use standard JS template syntax {{@nodeId.field}} in configs to reference previous node outputs. Example: {{@node_1.studentName}}.
- Position x should center around 250, y should start at 50 and increment.
- Ensure all sources and targets in edges correspond to valid node IDs.
- Give nodes unique IDs like 'node_1', 'node_2'.
- Prefer integration actions over built-in ones when appropriate (e.g., use 'Gmail Send' instead of 'Send Email' if the user asks to email from their account).
- Return ONLY valid JSON in the format { "name": "...", "description": "...", "nodes": [...], "edges": [...] } with no markdown wrappers.`;

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "c1/anthropic/claude-sonnet-4/v-20251230", // Using available model
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
        });

        const rawText = completion.choices[0].message.content || '{}';
        const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const workflowData = JSON.parse(cleanedText);

        return NextResponse.json(workflowData);

    } catch (error: any) {
        console.error("[Generate Workflow API] Error:", error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
