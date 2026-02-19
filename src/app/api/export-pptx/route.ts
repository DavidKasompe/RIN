import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { exportParams } = await req.json() as { exportParams: string };

    try {
        const pptxResponse = await fetch('https://api.thesys.dev/v1/artifact/pptx/export', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.THESYS_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exportParams }),
        });

        if (!pptxResponse.ok) {
            throw new Error(`Failed to export PPTX: ${pptxResponse.statusText}`);
        }

        return new NextResponse(pptxResponse.body, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': 'attachment; filename="rin-presentation.pptx"',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
