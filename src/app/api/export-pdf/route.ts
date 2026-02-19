import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { exportParams } = await req.json() as { exportParams: string };

    try {
        const pdfResponse = await fetch('https://api.thesys.dev/v1/artifact/pdf/export', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.THESYS_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ exportParams }),
        });

        if (!pdfResponse.ok) {
            throw new Error(`Failed to export PDF: ${pdfResponse.statusText}`);
        }

        return new NextResponse(pdfResponse.body, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="rin-report.pdf"',
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
