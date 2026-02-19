import { NextResponse } from 'next/server';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ─── GET /api/students/[id] ───────────────────────────────────────────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;
    const [row] = await db.select().from(students).where(eq(students.id, id));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
}

// ─── PATCH /api/students/[id] ─────────────────────────────────────────────────
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;
    const body = await req.json();

    const [row] = await db
        .update(students)
        .set({
            ...body,
            updatedAt: new Date(),
        })
        .where(eq(students.id, id))
        .returning();

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
}

// ─── DELETE /api/students/[id] ────────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;
    await db.delete(students).where(eq(students.id, id));
    return NextResponse.json({ ok: true });
}
