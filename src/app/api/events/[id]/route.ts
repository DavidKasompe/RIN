import { NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ─── PATCH /api/events/[id] ───────────────────────────────────────────────────
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;
    const body = await req.json();
    const [row] = await db
        .update(calendarEvents)
        .set({ ...body, date: body.date ? new Date(body.date) : undefined })
        .where(eq(calendarEvents.id, id))
        .returning();
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(row);
}

// ─── DELETE /api/events/[id] ──────────────────────────────────────────────────
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    return NextResponse.json({ ok: true });
}
