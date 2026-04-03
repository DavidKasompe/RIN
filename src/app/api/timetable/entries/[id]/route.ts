import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { timetableEntries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'Not attached to a school' }, { status: 400 });

        const body = await req.json();
        const { subject, room, location, classType, roomCapacity, studentCount, recurring, termStart, termEnd } = body;

        await db.update(timetableEntries)
            .set({
                ...(subject !== undefined && { subject }),
                ...(room !== undefined && { room }),
                ...(location !== undefined && { location }),
                ...(classType !== undefined && { classType }),
                ...(roomCapacity !== undefined && { roomCapacity }),
                ...(studentCount !== undefined && { studentCount }),
                ...(recurring !== undefined && { recurring }),
                ...(termStart !== undefined && { termStart: new Date(termStart) }),
                ...(termEnd !== undefined && { termEnd: new Date(termEnd) }),
            })
            .where(and(eq(timetableEntries.id, id), eq(timetableEntries.schoolId, schoolId)));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('PATCH /api/timetable/entries/[id] error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'Not attached to a school' }, { status: 400 });

        await db.delete(timetableEntries)
            .where(and(eq(timetableEntries.id, id), eq(timetableEntries.schoolId, schoolId)));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/timetable/entries/[id] error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
