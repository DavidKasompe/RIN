import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { timetableEntries, timetableSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ entries: [] });

        const entries = await db
            .select({
                entry: timetableEntries,
                slot: timetableSlots,
            })
            .from(timetableEntries)
            .leftJoin(timetableSlots, eq(timetableEntries.slotId, timetableSlots.id))
            .where(eq(timetableEntries.schoolId, schoolId));

        return NextResponse.json({ entries });
    } catch (err) {
        console.error('GET /api/timetable/entries error:', err);
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
        const { slotId, subject, cohortId, programId, teacherId, room, location, classType, roomCapacity, studentCount, recurring, termStart, termEnd } = body;

        if (!slotId || !subject) {
            return NextResponse.json({ error: 'slotId and subject are required' }, { status: 400 });
        }

        const [entry] = await db.insert(timetableEntries).values({
            id: 'te_' + Math.random().toString(36).substr(2, 9),
            schoolId,
            slotId,
            subject,
            cohortId: cohortId ?? null,
            programId: programId ?? null,
            teacherId: teacherId ?? null,
            room: room ?? null,
            location: location ?? null,
            classType: classType ?? null,
            roomCapacity: roomCapacity ?? null,
            studentCount: studentCount ?? null,
            recurring: recurring ?? true,
            termStart: termStart ? new Date(termStart) : null,
            termEnd: termEnd ? new Date(termEnd) : null,
        }).returning();

        return NextResponse.json({ entry });
    } catch (err) {
        console.error('POST /api/timetable/entries error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
