import { mastra } from '@/mastra';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const { messages, studentContext } = await req.json();

    const agent = mastra.getAgent('rinAgent');

    // Prepend system context for the student
    const systemContent = studentContext
        ? `STUDENT CONTEXT:\n${JSON.stringify(studentContext, null, 2)}\n\nYou are analyzing this specific student. Use their data in all responses.`
        : `You are RIN, an AI-powered early warning system for K-12 educators. Help the teacher understand and support their students.`;

    const allMessages = [
        { role: 'system' as const, content: systemContent },
        ...messages,
    ];

    // Mastra v1: agent.stream() returns a MastraModelOutput — pipe its textStream
    const result = await agent.stream(allMessages);

    // textStream is an AsyncIterable<string>
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result.textStream) {
                    controller.enqueue(encoder.encode(chunk));
                }
                controller.close();
            } catch (err) {
                controller.error(err);
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
        },
    });
}
