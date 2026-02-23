import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { studentDocuments, studentNotes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; docId: string }> }
) {
    const { id: studentId, docId } = await params;
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

        // Fetch doc — verify ownership
        const [doc] = await db
            .select()
            .from(studentDocuments)
            .where(and(
                eq(studentDocuments.id, docId),
                eq(studentDocuments.studentId, studentId),
                eq(studentDocuments.uploadedBy, session.user.id),
            ));

        if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

        // Delete from Supabase Storage
        const supabase = getSupabaseAdmin();
        await supabase.storage.from('user_artifacts').remove([doc.storageKey]);

        // Delete RAG note chunks linked to this document
        await db.delete(studentNotes).where(
            and(
                eq(studentNotes.studentId, studentId),
                eq(studentNotes.sourceDocId, docId),
            )
        );

        // Delete the document record
        await db.delete(studentDocuments).where(eq(studentDocuments.id, docId));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[student-docs DELETE]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
