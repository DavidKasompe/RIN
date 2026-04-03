import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { moodleConnections, students } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function moodleCall(baseUrl: string, token: string, fn: string, params: Record<string, string> = {}) {
    const p = new URLSearchParams({
        wstoken: token,
        wsfunction: fn,
        moodlewsrestformat: 'json',
        ...params,
    });
    const res = await fetch(`${baseUrl}/webservice/rest/server.php?${p}`, {
        signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (data?.exception) throw new Error(data.message ?? data.exception);
    return data;
}

// GET /api/integrations/moodle/student?studentId=stu_xxx
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ linked: false });

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });

        // Get student record
        const [student] = await db
            .select()
            .from(students)
            .where(and(eq(students.id, studentId), eq(students.schoolId, schoolId)))
            .limit(1);

        if (!student?.moodleUserId) return NextResponse.json({ linked: false });

        // Get Moodle connection
        const [conn] = await db
            .select()
            .from(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId))
            .limit(1);

        if (!conn) return NextResponse.json({ linked: false });

        const { moodleUrl, moodleToken, lastSyncedAt } = conn;
        const courseIds: number[] = student.moodleCourseIds ?? [];

        // Fetch grades and assignments for each enrolled course
        const grades: Record<string, any[]> = {};
        const assignments: any[] = [];

        for (const courseId of courseIds) {
            // Grades
            try {
                const gradeData = await moodleCall(moodleUrl, moodleToken, 'gradereport_user_get_grade_items', {
                    courseid: String(courseId),
                    userid: String(student.moodleUserId),
                });
                const items = gradeData?.usergrades?.[0]?.gradeitems ?? [];
                if (items.length > 0) {
                    // Try to get course name
                    let courseName = `Course ${courseId}`;
                    try {
                        const [courseInfo] = (await moodleCall(moodleUrl, moodleToken, 'core_course_get_courses', {
                            'options[ids][0]': String(courseId),
                        })) ?? [];
                        if (courseInfo?.fullname) courseName = courseInfo.fullname;
                    } catch { /* ignore */ }
                    grades[courseName] = items.map((item: any) => ({
                        itemname: item.itemname ?? item.itemtype,
                        grade: item.graderaw,
                        gradeMin: item.grademin,
                        gradeMax: item.grademax,
                        percentageFormatted: item.percentageformatted,
                        feedback: item.feedback,
                    }));
                }
            } catch { /* skip grade errors */ }

            // Assignments
            try {
                const assignData = await moodleCall(moodleUrl, moodleToken, 'mod_assign_get_assignments', {
                    'courseids[0]': String(courseId),
                });
                const courseAssignments = assignData?.courses?.[0]?.assignments ?? [];

                for (const assign of courseAssignments) {
                    let submissionStatus: string | null = null;
                    let submittedOn: string | null = null;
                    let gradeValue: number | null = null;

                    try {
                        const subData = await moodleCall(moodleUrl, moodleToken, 'mod_assign_get_submission_status', {
                            assignid: String(assign.id),
                            userid: String(student.moodleUserId),
                        });
                        const sub = subData?.lastattempt?.submission;
                        submissionStatus = sub?.status ?? null;
                        if (sub?.timemodified) {
                            submittedOn = new Date(sub.timemodified * 1000).toISOString();
                        }
                        gradeValue = subData?.feedback?.grade?.grade ?? null;
                    } catch { /* skip */ }

                    assignments.push({
                        id: assign.id,
                        name: assign.name,
                        courseId,
                        dueDate: assign.duedate ? new Date(assign.duedate * 1000).toISOString() : null,
                        submissionStatus,
                        submittedOn,
                        grade: gradeValue,
                    });
                }
            } catch { /* skip assignment errors */ }
        }

        return NextResponse.json({
            linked: true,
            moodleUserId: student.moodleUserId,
            grades,
            assignments,
            lastSyncedAt: lastSyncedAt?.toISOString() ?? null,
        });
    } catch (err: any) {
        console.error('GET /api/integrations/moodle/student error:', err);
        return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 });
    }
}
