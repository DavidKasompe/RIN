import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { timetableSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ slots: [] });

        const slots = await db.select().from(timetableSlots).where(eq(timetableSlots.schoolId, schoolId));
        return NextResponse.json({ slots });
    } catch (err) {
        console.error('GET /api/timetable/slots error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'Not attached to a school' }, { status: 400 });

        const body = await req.json();
        const { dayOfWeek, startTime, endTime, slotLabel } = body;
        if (dayOfWeek === undefined || !startTime || !endTime) {
            return NextResponse.json({ error: 'dayOfWeek, startTime, and endTime are required' }, { status: 400 });
        }

        const [slot] = await db.insert(timetableSlots).values({
            id: 'ts_' + Math.random().toString(36).substr(2, 9),
            schoolId,
            dayOfWeek,
            startTime,
            endTime,
            slotLabel: slotLabel ?? null,
        }).returning();

        return NextResponse.json({ slot });
    } catch (err) {
        console.error('POST /api/timetable/slots error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
