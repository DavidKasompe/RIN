'use server';

import { db } from '@/db';
import { schools, users, userSchools } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'RIN-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createSchoolAction(schoolName: string, institutionType: 'k12' | 'university' = 'k12') {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!db) {
            return { success: false, error: 'Database connection failed' };
        }

        const schoolId = 'sch_' + Math.random().toString(36).substr(2, 9);
        const inviteCode = generateInviteCode();

        // 1. Create the school
        const [newSchool] = await db.insert(schools).values({
            id: schoolId,
            name: schoolName,
            inviteCode: inviteCode,
            institutionType: institutionType,
        }).returning();

        // 2. Attach the user to the school and set role to admin
        await db.update(users)
            .set({ schoolId: newSchool.id, role: 'administrator' })
            .where(eq(users.id, session.user.id));

        // 3. Mark the user as a member of this workspace
        await db.insert(userSchools).values({
            id: 'us_' + Math.random().toString(36).substr(2, 9),
            userId: session.user.id,
            schoolId: newSchool.id,
            role: 'administrator'
        });

        return { success: true, school: newSchool };
    } catch (error) {
        console.error('Error creating school:', error);
        return { success: false, error: 'Failed to create school.' };
    }
}

export async function joinSchoolAction(inviteCode: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!db) {
            return { success: false, error: 'Database connection failed' };
        }

        // 1. Find the school by invite code
        const schoolQuery = await db.select().from(schools).where(eq(schools.inviteCode, inviteCode.toUpperCase()));

        if (schoolQuery.length === 0) {
            return { success: false, error: 'Invalid invite code.' };
        }

        const targetSchool = schoolQuery[0];

        // 2. Attach the user to the school
        await db.update(users)
            .set({ schoolId: targetSchool.id })
            .where(eq(users.id, session.user.id));

        // 3. Ensure they are in userSchools (upsert or ignore)
        const existingMembership = await db.select().from(userSchools)
            .where(and(
                eq(userSchools.userId, session.user.id),
                eq(userSchools.schoolId, targetSchool.id)
            ));

        if (existingMembership.length === 0) {
            await db.insert(userSchools).values({
                id: 'us_' + Math.random().toString(36).substr(2, 9),
                userId: session.user.id,
                schoolId: targetSchool.id,
                role: 'educator'
            });
        }

        return { success: true, school: targetSchool };
    } catch (error) {
        console.error('Error joining school:', error);
        return { success: false, error: 'Failed to join school.' };
    }
}

export async function switchWorkspaceAction(schoolId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!db) {
            return { success: false, error: 'Database connection failed' };
        }

        // Verify the user is actually a member of this school
        const membership = await db.select().from(userSchools).where(
            and(
                eq(userSchools.userId, session.user.id),
                eq(userSchools.schoolId, schoolId)
            )
        );

        if (membership.length === 0) {
            return { success: false, error: 'You are not a member of this workspace.' };
        }

        // Update active schoolId
        await db.update(users)
            .set({ schoolId: schoolId })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error('Error switching workspace:', error);
        return { success: false, error: 'Failed to switch workspace.' };
    }
}
