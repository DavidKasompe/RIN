import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { moodleConnections, students } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper: call any Moodle REST API function
async function moodleCall(url: string, token: string, fn: string, params: Record<string, string> = {}) {
    const p = new URLSearchParams({ wstoken: token, wsfunction: fn, moodlewsrestformat: 'json', ...params });
    const res = await fetch(`${url}/webservice/rest/server.php?${p}`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.exception) throw new Error(data.message || fn + ' error');
    return data;
}

// GET /api/integrations/moodle/student?studentId=stu_xxx
// Returns grades + assignments for a specific student from Moodle
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'No school attached' }, { status: 400 });

        const studentId = req.nextUrl.searchParams.get('studentId');
        if (!studentId) return NextResponse.json({ error: 'studentId is required' }, { status: 400 });

        // Load the student
        const [student] = await db
            .select()
            .from(students)
            .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId)))
            .limit(1);

        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        if (!student.moodleUserId) {
            return NextResponse.json({ linked: false, message: 'This student has no Moodle account linked.' });
        }

        // Load Moodle credentials
        const [conn] = await db
            .select()
            .from(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId))
            .limit(1);

        if (!conn) return NextResponse.json({ error: 'No Moodle connection for this school.' }, { status: 404 });

        const { moodleUrl: url, moodleToken: token } = conn;
        const moodleUserId = student.moodleUserId;
        const courseIds: number[] = (student.moodleCourseIds as number[]) ?? [];

        // ── Fetch grades ──────────────────────────────────────────────────────
        const gradesByCourse: Record<string, any[]> = {};
        if (courseIds.length > 0) {
            for (const courseId of courseIds) {
                try {
                    const gradeData = await moodleCall(url, token, 'gradereport_user_get_grade_items', {
                        userid: String(moodleUserId),
                        courseid: String(courseId),
                    });
                    const items = gradeData?.usergrades?.[0]?.gradeitems ?? [];
                    const courseName = gradeData?.usergrades?.[0]?.coursefullname ?? `Course ${courseId}`;
                    if (items.length > 0) {
                        gradesByCourse[courseName] = items.map((g: any) => ({
                            itemname: g.itemname ?? 'Overall',
                            graderaw: g.graderaw ?? null,
                            grademax: g.grademax ?? null,
                            gradeformatted: g.gradeformatted ?? '—',
                            feedback: g.feedback ?? null,
                            percentageformatted: g.percentageformatted ?? null,
                        }));
                    }
                } catch {
                    continue;
                }
            }
        } else {
            // No specific courseIds saved — try global grade report
            try {
                const gradeData = await moodleCall(url, token, 'gradereport_user_get_grade_items', {
                    userid: String(moodleUserId),
                });
                for (const ug of gradeData?.usergrades ?? []) {
                    gradesByCourse[ug.coursefullname ?? 'Unknown'] = (ug.gradeitems ?? []).map((g: any) => ({
                        itemname: g.itemname ?? 'Overall',
                        graderaw: g.graderaw ?? null,
                        grademax: g.grademax ?? null,
                        gradeformatted: g.gradeformatted ?? '—',
                        feedback: g.feedback ?? null,
                        percentageformatted: g.percentageformatted ?? null,
                    }));
                }
            } catch {
                // grades unavailable
            }
        }

        // ── Fetch assignments ─────────────────────────────────────────────────
        let assignments: any[] = [];
        try {
            const assignParams: Record<string, string> = {};
            courseIds.forEach((id, i) => { assignParams[`courseids[${i}]`] = String(id); });
            const assignData = await moodleCall(url, token, 'mod_assign_get_assignments', assignParams);
            assignments = (assignData?.courses ?? []).flatMap((c: any) =>
                (c.assignments ?? []).map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    course: c.fullname,
                    dueDate: a.duedate ? new Date(a.duedate * 1000).toISOString() : null,
                    cutoffDate: a.cutoffdate ? new Date(a.cutoffdate * 1000).toISOString() : null,
                    maxGrade: a.grade ?? null,
                }))
            );

            // For each assignment, get this student's submission status
            for (const assign of assignments) {
                try {
                    const subData = await moodleCall(url, token, 'mod_assign_get_submission_status', {
                        assignid: String(assign.id),
                        userid: String(moodleUserId),
                    });
                    const sub = subData?.lastattempt?.submission;
                    const grade = subData?.feedback?.grade;
                    assign.submissionStatus = sub?.status ?? 'notsubmitted';
                    assign.timeSubmitted = sub?.timecreated
                        ? new Date(sub.timecreated * 1000).toISOString()
                        : null;
                    assign.grade = grade?.grade ? parseFloat(grade.grade).toFixed(1) : null;
                } catch {
                    assign.submissionStatus = 'unknown';
                }
            }
        } catch {
            // assignments unavailable
        }

        return NextResponse.json({
            linked: true,
            moodleUserId,
            studentName: student.name,
            grades: gradesByCourse,
            assignments,
            lastSyncedAt: conn.lastSyncedAt?.toISOString() ?? null,
        });
    } catch (err: any) {
        console.error('GET /api/integrations/moodle/student error:', err);
        return NextResponse.json({ error: err.message || 'Failed to fetch Moodle data.' }, { status: 500 });
    }
}
