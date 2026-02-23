import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { studentNotes } from '@/db/schema';
import { eq, or, and, desc } from 'drizzle-orm';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

    const userId = session.user.id;

    // Return notes for this student where visibility = team OR authorId = current user
    const notes = await db.select({
      id: studentNotes.id,
      content: studentNotes.content,
      type: studentNotes.type,
      tags: studentNotes.tags,
      visibility: studentNotes.visibility,
      createdAt: studentNotes.createdAt,
      authorId: studentNotes.authorId,
    })
      .from(studentNotes)
      .where(
        and(
          eq(studentNotes.studentId, studentId),
          or(
            eq(studentNotes.visibility, 'team'),
            eq(studentNotes.authorId, userId)
          )
        )
      )
      .orderBy(desc(studentNotes.createdAt));

    return NextResponse.json({ notes });
  } catch (err) {
    console.error('[GET /api/students/[id]/notes]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const database = db;
    if (!database) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

    const body = await req.json();
    const { content, type, tags, visibility } = body;

    if (!content || !type || !visibility) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = session.user.id;
    const noteId = crypto.randomUUID();

    // Insert note
    await database.insert(studentNotes).values({
      id: noteId,
      studentId: studentId,
      authorId: userId,
      content,
      type,
      tags: tags || [],
      visibility,
    });

    // Fire and forget embedding generation
    embed({
      model: openai.embedding('text-embedding-3-small'),
      value: content,
    }).then(async ({ embedding }) => {
      try {
        await database.update(studentNotes)
          .set({ embedding })
          .where(eq(studentNotes.id, noteId));
      } catch (embErr) {
        console.error(`Failed to save embedding for note ${noteId}:`, embErr);
      }
    }).catch(embErr => {
      console.error(`Failed to generate embedding for note ${noteId}:`, embErr);
    });

    // Return created record (sans embedding obviously)
    return NextResponse.json({
      note: {
        id: noteId,
        studentId,
        authorId: userId,
        content,
        type,
        tags: tags || [],
        visibility,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[POST /api/students/[id]/notes]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
