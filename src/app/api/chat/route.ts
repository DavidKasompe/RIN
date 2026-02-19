import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { transformStream } from '@crayonai/stream';
import { makeC1Response } from '@thesysai/genui-sdk/server';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const client = new OpenAI({
    apiKey: process.env.THESYS_API_KEY,
    baseURL: 'https://api.thesys.dev/v1/embed',
});

const SYSTEM_PROMPT = `You are RIN, an AI-powered student dropout risk intelligence assistant for educators.

You help educators:
- Analyze student dropout risk from descriptions of attendance, grades, behavior, socioeconomic factors, and engagement
- Generate intervention plans and strategies
- Draft parent-facing summaries and letters
- Simulate improvement scenarios
- Answer questions about educational best practices

When analyzing student risk, present your response using rich visual components:
- Use stat cards or highlight boxes to show the risk score prominently
- Use a structured table to list contributing risk factors with impact percentages
- Use a numbered list or timeline for intervention steps
- Use a callout or info box for the plain-language summary

For intervention plans, use a prioritized list with Clear High / Medium / Low priority badges.
For parent summaries, use a clean document-style layout.
For scenario simulations, use a comparison table or chart.

Always be empathetic, evidence-based, and action-oriented. Avoid stigmatizing language.
When uncertain, suggest the educator consult a school counselor or support specialist.`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            messages: ChatCompletionMessageParam[];
            threadId?: string;
        };

        const { messages } = body;

        if (!messages?.length) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        const c1Response = makeC1Response();

        // Emit C1's native think indicator while we wait for the LLM
        c1Response.writeThinkItem({
            title: 'Analyzing student data…',
            description: 'RIN is reviewing the available information and preparing a response.',
        });

        // Kick off the LLM stream (non-blocking)
        (async () => {
            try {
                const llmStream = await client.chat.completions.create({
                    model: 'c1/anthropic/claude-sonnet-4/v-20251230',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages,
                    ],
                    stream: true,
                });

                transformStream(
                    llmStream,
                    (chunk) => {
                        const delta = chunk.choices[0]?.delta?.content;
                        if (delta) c1Response.writeContent(delta);
                        return delta ?? null;
                    },
                    {
                        onEnd: () => {
                            c1Response.end();
                        },
                    }
                );
            } catch (err) {
                console.error('[/api/chat] LLM stream error:', err);
                c1Response.writeContent('\n\nSorry, something went wrong generating the response. Please try again.');
                c1Response.end();
            }
        })();

        return new NextResponse(c1Response.responseStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[/api/chat] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
