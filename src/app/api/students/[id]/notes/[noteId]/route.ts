import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { studentNotes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; noteId: string }> }
) {
    try {
        const { noteId } = await params;
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

        const userId = session.user.id;

        // Ensure the note exists and belongs to the requesting user
        const deleteResult = await db.delete(studentNotes)
            .where(
                and(
                    eq(studentNotes.id, noteId),
                    eq(studentNotes.authorId, userId)
                )
            )
            .returning({ deletedId: studentNotes.id });

        if (deleteResult.length === 0) {
            return NextResponse.json({ error: 'Note not found or unauthorized to delete' }, { status: 403 });
        }

        return NextResponse.json({ success: true, deletedId: deleteResult[0].deletedId });
    } catch (err) {
        console.error('[DELETE /api/students/[id]/notes/[noteId]]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
