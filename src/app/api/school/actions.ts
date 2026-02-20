'use server';

import { db } from '@/db';
import { schools, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function createSchoolAction(schoolName: string) {
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
        }).returning();

        // 2. Attach the user to the school and set role to admin
        await db.update(users)
            .set({ schoolId: newSchool.id, role: 'administrator' })
            .where(eq(users.id, session.user.id));

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

        return { success: true, school: targetSchool };
    } catch (error) {
        console.error('Error joining school:', error);
        return { success: false, error: 'Failed to join school.' };
    }
}
