import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { Composio } from '@composio/core';

// ─── PATCH /api/events/[id] ───────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;
    const body = await req.json();

    const isGoogleEvent = !id.startsWith('ev-');
    let localRow = null;

    if (!isGoogleEvent) {
        const [row] = await db
            .update(calendarEvents)
            .set({ ...body, date: body.date ? new Date(body.date) : undefined })
            .where(eq(calendarEvents.id, id))
            .returning();
        if (!row) return NextResponse.json({ error: 'Not found locally' }, { status: 404 });
        localRow = row;
    }

    // Try Google Calendar SYNC
    const authSession = await auth.api.getSession({ headers: req.headers });
    const userId = authSession?.user?.id;
    if (userId && process.env.COMPOSIO_API_KEY) {
        try {
            const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
            if (isGoogleEvent) {
                // It's a google event, patch it directly
                await composio.tools.execute('GOOGLECALENDAR_PATCH_EVENT', {
                    userId,
                    arguments: {
                        event_id: id,
                        calendar_id: 'primary',
                        ...(body.title && { summary: body.title }),
                        ...(body.notes && { description: body.notes }),
                        ...(body.date && { start_time: new Date(body.date).toISOString() })
                    }
                });
            }
        } catch (e: any) {
            console.log("Composio: Failed to patch Google Calendar event.", e.message);
        }
    }

    return NextResponse.json(localRow || { id, ...body });
}

// ─── DELETE /api/events/[id] ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { id } = await params;

    const isGoogleEvent = !id.startsWith('ev-');

    if (!isGoogleEvent) {
        await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    }

    const authSession = await auth.api.getSession({ headers: req.headers });
    const userId = authSession?.user?.id;
    if (userId && process.env.COMPOSIO_API_KEY) {
        try {
            const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
            if (isGoogleEvent) {
                await composio.tools.execute('GOOGLECALENDAR_DELETE_EVENT', {
                    userId,
                    arguments: {
                        event_id: id,
                        calendar_id: 'primary'
                    }
                });
            }
        } catch (e: any) {
            console.log("Composio: Failed to delete Google Calendar event.", e.message);
        }
    }

    return NextResponse.json({ ok: true });
}

