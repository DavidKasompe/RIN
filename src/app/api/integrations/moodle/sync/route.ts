import { NextResponse } from 'next/server';
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
        signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    if (data?.exception) throw new Error(data.message ?? data.exception);
    return data;
}

export async function POST() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'No school' }, { status: 400 });

        // Fetch Moodle connection
        const [conn] = await db
            .select()
            .from(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId))
            .limit(1);

        if (!conn) return NextResponse.json({ error: 'No Moodle connection configured' }, { status: 404 });

        const { moodleUrl, moodleToken } = conn;

        // 1. Validate token & get site info
        await moodleCall(moodleUrl, moodleToken, 'core_webservice_get_site_info');

        // 2. Get all courses
        const courses: any[] = await moodleCall(moodleUrl, moodleToken, 'core_course_get_courses');
        const realCourses = courses.filter((c: any) => c.id > 1); // skip site-level course (id=1)

        let studentsImported = 0;
        let studentsUpdated = 0;
        const seenMoodleIds = new Set<number>();

        // 3. For each course, get enrolled students
        for (const course of realCourses) {
            let enrolledUsers: any[] = [];
            try {
                enrolledUsers = await moodleCall(moodleUrl, moodleToken, 'core_enrol_get_enrolled_users', {
                    courseid: String(course.id),
                });
            } catch {
                continue; // skip courses we can't access
            }

            // Only students (role archetype = student)
            const studentUsers = enrolledUsers.filter((u: any) =>
                u.roles?.some((r: any) => r.shortname === 'student') ?? true
            );

            for (const mu of studentUsers) {
                if (seenMoodleIds.has(mu.id)) {
                    // Already processed this Moodle user — just add course to their list
                    const existing = await db
                        .select()
                        .from(students)
                        .where(
                            and(
                                eq(students.schoolId, schoolId),
                                eq(students.moodleUserId, mu.id)
                            )
                        )
                        .limit(1);
                    if (existing.length > 0) {
                        const courseIds: number[] = existing[0].moodleCourseIds ?? [];
                        if (!courseIds.includes(course.id)) {
                            await db
                                .update(students)
                                .set({ moodleCourseIds: [...courseIds, course.id] })
                                .where(eq(students.id, existing[0].id));
                        }
                    }
                    continue;
                }
                seenMoodleIds.add(mu.id);

                // Check if student already exists in RIN
                const existing = await db
                    .select()
                    .from(students)
                    .where(
                        and(
                            eq(students.schoolId, schoolId),
                            eq(students.moodleUserId, mu.id)
                        )
                    )
                    .limit(1);

                const studentData = {
                    name: mu.fullname || `${mu.firstname ?? ''} ${mu.lastname ?? ''}`.trim(),
                    email: mu.email ?? null,
                    moodleUserId: mu.id,
                    moodleCourseIds: [course.id],
                    updatedAt: new Date(),
                };

                if (existing.length > 0) {
                    await db
                        .update(students)
                        .set(studentData)
                        .where(eq(students.id, existing[0].id));
                    studentsUpdated++;
                } else {
                    const newId = 'stu_' + Math.random().toString(36).substr(2, 9);
                    await db.insert(students).values({
                        id: newId,
                        userId: session.user.id,
                        schoolId,
                        name: studentData.name,
                        email: studentData.email,
                        studentId: `M${mu.id}`,
                        grade: course.shortname ?? 'Unknown',
                        moodleUserId: mu.id,
                        moodleCourseIds: [course.id],
                    });
                    studentsImported++;
                }
            }
        }

        // 4. Stamp lastSyncedAt
        const syncedAt = new Date();
        await db
            .update(moodleConnections)
            .set({ lastSyncedAt: syncedAt })
            .where(eq(moodleConnections.schoolId, schoolId));

        return NextResponse.json({
            success: true,
            studentsImported,
            studentsUpdated,
            coursesScanned: realCourses.length,
            totalStudents: seenMoodleIds.size,
            lastSyncedAt: syncedAt.toISOString(),
        });
    } catch (err: any) {
        console.error('POST /api/integrations/moodle/sync error:', err);
        return NextResponse.json({ error: err.message ?? 'Sync failed' }, { status: 500 });
    }
}
