import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const client = new OpenAI({
    apiKey: process.env.THESYS_API_KEY,
    baseURL: 'https://api.thesys.dev/v1/artifact',
});

const ARTIFACT_SYSTEM_PROMPT = `You are RIN, an AI student dropout risk intelligence system. 
Generate detailed, data-rich reports using tables, charts, and structured sections.
Use professional educational language. Include evidence-based recommendations.`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            prompt: string;
            type?: 'report' | 'slides';
            artifactId?: string;
            existingContent?: string;
        };

        const { prompt, type = 'report', artifactId, existingContent } = body;

        if (!prompt?.trim()) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: ARTIFACT_SYSTEM_PROMPT },
        ];

        // If editing an existing artifact, include it in context
        if (existingContent) {
            messages.push({ role: 'assistant', content: existingContent });
        }

        messages.push({ role: 'user', content: prompt });

        const id = artifactId || uuidv4();

        const artifact = await client.chat.completions.create({
            model: 'c1/artifact/v-20251030',
            messages,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metadata: { thesys: JSON.stringify({ c1_artifact_type: type, id }) } as any,
        });

        const content = artifact.choices[0]?.message?.content;
        return NextResponse.json({ content, artifactId: id });
    } catch (error) {
        console.error('[/api/artifact] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate artifact' },
            { status: 500 }
        );
    }
}
