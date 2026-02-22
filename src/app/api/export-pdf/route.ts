import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { artifacts } from '@/db/schema';
import { uploadToSupabaseStorage } from '@/lib/supabase-storage';

export async function POST(req: NextRequest) {
    const { exportParams, title } = await req.json() as {
        exportParams: string;
        title?: string;
    };

    try {
        // 1. Fetch PDF from Thesys artifact export API
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

        // 2. Buffer the response
        const buffer = Buffer.from(await pdfResponse.arrayBuffer());

        // 3. Try to persist — upload to Supabase + save to DB (non-blocking on failure)
        try {
            const safeTitle = (title ?? 'rin-report').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
            const filename = `${crypto.randomUUID()}-${safeTitle}.pdf`;

            const publicUrl = await uploadToSupabaseStorage(buffer, filename, 'application/pdf');

            // Get authenticated user
            const session = await auth.api.getSession({ headers: req.headers });
            const userId = session?.user?.id;

            if (db && userId) {
                await db.insert(artifacts).values({
                    id: crypto.randomUUID(),
                    userId,
                    title: title ?? 'Untitled Report',
                    type: 'pdf',
                    publicUrl,
                });
            }

            // Return the public URL — frontend opens it in a new tab
            return NextResponse.json({ publicUrl });
        } catch (persistError) {
            // Persist failed — fall back to streaming the buffer directly
            console.error('[export-pdf] Persist failed, falling back to direct download:', persistError);
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${(title ?? 'rin-report').replace(/[^a-z0-9-_]/gi, '-')}.pdf"`,
                },
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
