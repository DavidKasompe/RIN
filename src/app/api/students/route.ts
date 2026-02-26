import { NextResponse } from 'next/server';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// ─── GET /api/students ────────────────────────────────────────────────────────
export async function GET() {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { users } = await import('@/db/schema');
    const [currentUser] = await db.select().from(users).where(eq(users.id, session.user.id));
    
    if (!currentUser?.schoolId) {
        return NextResponse.json([]); // No workspace, no students
    }

    const rows = await db.select().from(students)
        .where(eq(students.schoolId, currentUser.schoolId))
        .orderBy(desc(students.lastRiskScore));
        
    return NextResponse.json(rows);
}

// ─── POST /api/students ───────────────────────────────────────────────────────
export async function POST(req: Request) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    const { auth } = await import('@/lib/auth');
    const { headers } = await import('next/headers');
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { users } = await import('@/db/schema');
    const [currentUser] = await db.select().from(users).where(eq(users.id, session.user.id));

    const [row] = await db
        .insert(students)
        .values({
            id: body.id ?? `stu-${Date.now()}`,
            userId: session.user.id,
            schoolId: currentUser?.schoolId || null,
            name: body.name,
            studentId: body.studentId,
            grade: body.grade,
            subject: body.subject ?? null,
            parentName: body.parentName ?? null,
            parentEmail: body.parentEmail ?? null,
            parentPhone: body.parentPhone ?? null,
            attendanceRate: body.attendanceRate ?? 90,
            gpa: body.gpa ?? 3.0,
            assignmentCompletion: body.assignmentCompletion ?? 85,
            behaviorReferrals: body.behaviorReferrals ?? 0,
            lateSubmissions: body.lateSubmissions ?? 0,
            notes: body.notes ?? null,
            tags: body.tags ?? [],
            lastRiskScore: body.lastRiskScore ?? null,
            lastRiskCategory: body.lastRiskCategory ?? null,
        })
        .returning();
    return NextResponse.json(row, { status: 201 });
}
