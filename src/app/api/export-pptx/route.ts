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
        // 1. Fetch PPTX from Thesys artifact export API
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

        // 2. Buffer the response
        const buffer = Buffer.from(await pptxResponse.arrayBuffer());

        const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        // 3. Try to persist — upload to Supabase + save to DB (non-blocking on failure)
        try {
            const safeTitle = (title ?? 'rin-presentation').replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
            const filename = `${crypto.randomUUID()}-${safeTitle}.pptx`;

            const publicUrl = await uploadToSupabaseStorage(buffer, filename, PPTX_MIME);

            // Get authenticated user
            const session = await auth.api.getSession({ headers: req.headers });
            const userId = session?.user?.id;

            if (db && userId) {
                await db.insert(artifacts).values({
                    id: crypto.randomUUID(),
                    userId,
                    title: title ?? 'Untitled Presentation',
                    type: 'pptx',
                    publicUrl,
                });
            }

            // Return the public URL — frontend opens it in a new tab
            return NextResponse.json({ publicUrl });
        } catch (persistError) {
            // Persist failed — fall back to streaming the buffer directly
            console.error('[export-pptx] Persist failed, falling back to direct download:', persistError);
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': PPTX_MIME,
                    'Content-Disposition': `attachment; filename="${(title ?? 'rin-presentation').replace(/[^a-z0-9-_]/gi, '-')}.pptx"`,
                },
            });
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
