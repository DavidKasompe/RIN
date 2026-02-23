import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { calendarEvents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { Composio } from '@composio/core';

// ─── GET /api/events ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });

    // 1. Fetch local DB events
    const rows = await db.select().from(calendarEvents).orderBy(desc(calendarEvents.date));

    // 2. Fetch Google Calendar events if connected via Composio
    try {
        const authSession = await auth.api.getSession({ headers: req.headers });
        const userId = authSession?.user?.id;

        if (userId && process.env.COMPOSIO_API_KEY) {
            const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

            try {
                // Execute Google Calendar list action
                const result = await composio.tools.execute('GOOGLECALENDAR_FIND_EVENT', {
                    userId,
                    arguments: {
                        timeMin: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), // Last 1 month
                        max_results: 50 // Limit to avoid massive payloads
                    }
                });

                if (result.successful && result.data && Array.isArray(result.data.items)) {
                    // Map Google Calendar events to UI format
                    const googleEvents = result.data.items.map((item: any) => ({
                        id: item.id,
                        title: item.summary || 'Busy',
                        type: 'meeting',
                        // Google Calendar has standard date/dateTime formats
                        date: item.start?.dateTime || item.start?.date || new Date().toISOString(),
                        notes: item.description || ''
                    }));

                    // Filter out Google events that might be exactly matching our DB IDs if we synced them
                    const dbIds = new Set(rows.map(r => r.id));
                    const newGoogleEvents = googleEvents.filter((ge: any) => !dbIds.has(ge.id));

                    return NextResponse.json([...rows, ...newGoogleEvents]);
                }
            } catch (e: any) {
                // User likely hasn't connected Google Calendar yet or token expired; degrade gracefully
                console.log("Composio: Google Calendar not connected or failed to fetch", e.message);
            }
        }
    } catch (e) {
        console.error("Error fetching google calendar events:", e);
    }

    return NextResponse.json(rows);
}

// ─── POST /api/events ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();

    const authSession = await auth.api.getSession({ headers: req.headers });
    const userId = authSession?.user?.id || body.userId || 'demo-user-seed';
    const { ...data } = body;

    // 1. Save to local DB
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

    // 2. Sync to Google Calendar if connected
    if (userId !== 'demo-user-seed' && process.env.COMPOSIO_API_KEY) {
        try {
            const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
            await composio.tools.execute('GOOGLECALENDAR_CREATE_EVENT', {
                userId,
                arguments: {
                    summary: data.title,
                    description: data.notes || '(Synced from RIN Dashboard)',
                    start_datetime: new Date(data.date).toISOString(),
                    event_duration_hour: 1, // Default to 1-hour meetings
                    event_duration_minutes: 0,
                    create_meeting_room: true // Automatically create Google Meet link
                }
            });
        } catch (e: any) {
            console.log("Composio: Failed to push to Google Calendar (maybe not connected).", e.message);
        }
    }

    return NextResponse.json(row, { status: 201 });
}

// ─── DELETE and PATCH handling would go here, omitting for brevity (UI deletion triggers /events/:id)

