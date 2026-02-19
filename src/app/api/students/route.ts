import { NextResponse } from 'next/server';
import { db } from '@/db';
import { students } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// ─── GET /api/students ────────────────────────────────────────────────────────
export async function GET() {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const rows = await db.select().from(students).orderBy(desc(students.lastRiskScore));
    return NextResponse.json(rows);
}

// ─── POST /api/students ───────────────────────────────────────────────────────
export async function POST(req: Request) {
    if (!db) return NextResponse.json({ error: 'DB not configured' }, { status: 503 });
    const body = await req.json();
    const { userId = 'demo-user-seed', ...data } = body;

    const [row] = await db
        .insert(students)
        .values({
            id: data.id ?? `stu-${Date.now()}`,
            userId,
            name: data.name,
            studentId: data.studentId,
            grade: data.grade,
            subject: data.subject ?? null,
            attendanceRate: data.attendanceRate ?? 90,
            gpa: data.gpa ?? 3.0,
            assignmentCompletion: data.assignmentCompletion ?? 85,
            behaviorReferrals: data.behaviorReferrals ?? 0,
            lateSubmissions: data.lateSubmissions ?? 0,
            notes: data.notes ?? null,
            tags: data.tags ?? [],
            lastRiskScore: data.lastRiskScore ?? null,
            lastRiskCategory: data.lastRiskCategory ?? null,
        })
        .returning();
    return NextResponse.json(row, { status: 201 });
}
