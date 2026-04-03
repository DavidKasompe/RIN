import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { moodleConnections, students } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ─── Helper: call a Moodle web service function ───────────────────────────────
async function moodleCall(
    url: string,
    token: string,
    fn: string,
    params: Record<string, string> = {}
) {
    const p = new URLSearchParams({
        wstoken: token,
        wsfunction: fn,
        moodlewsrestformat: 'json',
        ...params,
    });
    const res = await fetch(`${url}/webservice/rest/server.php?${p}`, {
        signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`Moodle HTTP ${res.status} for ${fn}`);
    const data = await res.json();
    if (data?.exception) throw new Error(data.message || `${fn} returned an error`);
    return data;
}

// ─── POST /api/integrations/moodle/sync ──────────────────────────────────────
// Pulls all courses + enrolled students from Moodle and upserts them into RIN.
export async function POST() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'No school attached to account' }, { status: 400 });

        // 1. Load saved Moodle credentials
        const [conn] = await db
            .select()
            .from(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId))
            .limit(1);

        if (!conn) {
            return NextResponse.json(
                { error: 'No Moodle connection found. Connect your Moodle instance first.' },
                { status: 404 }
            );
        }

        const { moodleUrl: url, moodleToken: token } = conn;

        // 2. Validate token + get the admin user's Moodle ID
        let adminMoodleUserId: number;
        let siteName: string;
        try {
            const siteInfo = await moodleCall(url, token, 'core_webservice_get_site_info');
            adminMoodleUserId = siteInfo.userid;
            siteName = siteInfo.sitename ?? url;
        } catch (err: any) {
            return NextResponse.json(
                { error: `Could not connect to Moodle: ${err.message}` },
                { status: 400 }
            );
        }

        // 3. Fetch all courses
        let courses: any[] = [];
        try {
            // core_course_get_courses with no IDs returns all courses (requires manager/admin)
            const allCourses = await moodleCall(url, token, 'core_course_get_courses');
            courses = Array.isArray(allCourses)
                ? allCourses.filter((c: any) => c.id !== 1 && c.fullname) // skip site course
                : [];
        } catch {
            // Fallback: only courses the token user is enrolled in
            try {
                const userCourses = await moodleCall(url, token, 'core_enrol_get_users_courses', {
                    userid: String(adminMoodleUserId),
                });
                courses = Array.isArray(userCourses) ? userCourses : [];
            } catch (err: any) {
                return NextResponse.json(
                    { error: `Could not fetch courses from Moodle: ${err.message}` },
                    { status: 400 }
                );
            }
        }

        if (courses.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No courses found in your Moodle instance.',
                studentsImported: 0,
                studentsUpdated: 0,
                coursesScanned: 0,
                lastSyncedAt: new Date().toISOString(),
            });
        }

        // 4. For every course, collect enrolled students
        // Key = moodleUserId, value = student data (merge courseIds across courses)
        const studentMap = new Map<number, {
            moodleUserId: number;
            fullName: string;
            email: string;
            courseIds: number[];
            courseNames: string[];
        }>();

        let coursesScanned = 0;
        for (const course of courses) {
            try {
                const enrolled = await moodleCall(url, token, 'core_enrol_get_enrolled_users', {
                    courseid: String(course.id),
                });
                if (!Array.isArray(enrolled)) continue;
                coursesScanned++;

                for (const user of enrolled) {
                    // Skip the admin / token owner
                    if (user.id === adminMoodleUserId) continue;

                    // Role check: keep only student-role users
                    // If Moodle doesn't return roles, include everyone (be permissive)
                    const roles: string[] = (user.roles ?? []).map((r: any) =>
                        (r.shortname ?? '').toLowerCase()
                    );
                    const isLikelyStudent =
                        roles.length === 0 ||
                        roles.some(r => ['student', 'editingstudent', 'student1'].includes(r));
                    if (!isLikelyStudent) continue;

                    if (studentMap.has(user.id)) {
                        const entry = studentMap.get(user.id)!;
                        if (!entry.courseIds.includes(course.id)) {
                            entry.courseIds.push(course.id);
                            entry.courseNames.push(course.fullname);
                        }
                    } else {
                        studentMap.set(user.id, {
                            moodleUserId: user.id,
                            fullName: user.fullname || `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
                            email: user.email ?? '',
                            courseIds: [course.id],
                            courseNames: [course.fullname],
                        });
                    }
                }
            } catch {
                // Permission errors on individual courses — skip silently
                continue;
            }
        }

        // 5. Upsert each student into the RIN DB
        let studentsImported = 0;
        let studentsUpdated = 0;

        for (const s of studentMap.values()) {
            try {
                const existing = await db
                    .select()
                    .from(students)
                    .where(
                        and(
                            eq(students.schoolId, schoolId),
                            eq(students.moodleUserId, s.moodleUserId)
                        )
                    )
                    .limit(1);

                if (existing.length > 0) {
                    // Update name, email (if we now have one), and course list
                    await db
                        .update(students)
                        .set({
                            name: s.fullName,
                            ...(s.email ? { email: s.email } : {}),
                            moodleCourseIds: s.courseIds,
                            updatedAt: new Date(),
                        })
                        .where(eq(students.id, existing[0].id));
                    studentsUpdated++;
                } else {
                    const newId = 'stu_' + Math.random().toString(36).substr(2, 9);
                    await db.insert(students).values({
                        id: newId,
                        userId: session.user.id,
                        schoolId,
                        name: s.fullName,
                        studentId: `MDL-${s.moodleUserId}`,
                        email: s.email || null,
                        grade: 'University',
                        institutionType: 'university',
                        moodleUserId: s.moodleUserId,
                        moodleCourseIds: s.courseIds,
                        enrollmentStatus: 'active',
                    });
                    studentsImported++;
                }
            } catch {
                continue;
            }
        }

        // 6. Stamp lastSyncedAt on the connection record
        const syncedAt = new Date();
        await db
            .update(moodleConnections)
            .set({ lastSyncedAt: syncedAt })
            .where(eq(moodleConnections.schoolId, schoolId));

        return NextResponse.json({
            success: true,
            siteName,
            message: `Sync complete — ${studentsImported} students imported, ${studentsUpdated} updated across ${coursesScanned} course${coursesScanned !== 1 ? 's' : ''}.`,
            studentsImported,
            studentsUpdated,
            coursesScanned,
            totalStudents: studentMap.size,
            lastSyncedAt: syncedAt.toISOString(),
        });
    } catch (err: any) {
        console.error('POST /api/integrations/moodle/sync error:', err);
        return NextResponse.json(
            { error: err.message || 'Sync failed. Please check your Moodle credentials.' },
            { status: 500 }
        );
    }
}
