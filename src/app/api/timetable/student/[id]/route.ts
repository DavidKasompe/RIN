import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { studentTimetables, timetableEntries, timetableSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!db) return NextResponse.json({ schedule: [] });

        const schedule = await db
            .select({
                entry: timetableEntries,
                slot: timetableSlots,
                enrolled: studentTimetables.enrolled,
            })
            .from(studentTimetables)
            .leftJoin(timetableEntries, eq(studentTimetables.timetableEntryId, timetableEntries.id))
            .leftJoin(timetableSlots, eq(timetableEntries.slotId, timetableSlots.id))
            .where(eq(studentTimetables.studentId, id));

        return NextResponse.json({ schedule });
    } catch (err) {
        console.error('GET /api/timetable/student/[id] error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
