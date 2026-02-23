import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { students, analyses } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: studentId } = await params;
    
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

        // Query the student to confirm they exist and to get the snapshot metrics
        const [student] = await db.select().from(students).where(eq(students.id, studentId));
        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Query the analyses table for historical risk scores
        const historicalAnalyses = await db
            .select()
            .from(analyses)
            .where(eq(analyses.studentId, studentId))
            .orderBy(asc(analyses.createdAt));

        const riskHistory = historicalAnalyses.map(a => ({
            score: a.riskScore,
            category: a.category,
            createdAt: a.createdAt,
            factors: a.factors
        }));

        // Provide the current snapshot
        const snapshot = {
            gpa: student.gpa,
            attendanceRate: student.attendanceRate,
            assignmentCompletion: student.assignmentCompletion,
            behaviorReferrals: student.behaviorReferrals,
            lateSubmissions: student.lateSubmissions
        };

        return NextResponse.json({ 
            riskHistory, 
            snapshot 
        });

    } catch (err) {
        console.error('[GET /api/students/[id]/results]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
