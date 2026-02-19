import { NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarEvents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// ─── GET /api/events ─────────────────────────────────────────────────────────
export async function GET() {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const rows = await db.select().from(calendarEvents).orderBy(desc(calendarEvents.date));
    return NextResponse.json(rows);
}

// ─── POST /api/events ────────────────────────────────────────────────────────
export async function POST(req: Request) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    const { userId = 'demo-user-seed', ...data } = body;

    const [row] = await db
        .insert(calendarEvents)
        .values({
            id: data.id ?? `ev-${Date.now()}`,
            userId,
            title: data.title,
            type: data.type ?? 'meeting',
            date: new Date(data.date),
            studentId: data.studentId ?? null,
            notes: data.notes ?? null,
        })
        .returning();
    return NextResponse.json(row, { status: 201 });
}
