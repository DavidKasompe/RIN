'use server';

import { db } from '@/db';
import { schools, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getTeamDetailsAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || !session.user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!db) {
            return { success: false, error: 'Database connection failed' };
        }

        // 1. Find the current user to get their schoolId
        const currentUserReq = await db.select().from(users).where(eq(users.id, session.user.id));
        if (currentUserReq.length === 0) return { success: false, error: 'User not found' };

        const currentUser = currentUserReq[0];
        if (!currentUser.schoolId) {
            return { success: false, error: 'No school attached' };
        }

        // 2. Find the school details
        const schoolReq = await db.select().from(schools).where(eq(schools.id, currentUser.schoolId));
        if (schoolReq.length === 0) return { success: false, error: 'School not found' };
        const school = schoolReq[0];

        // 3. Find all users in this school
        const members = await db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        }).from(users).where(eq(users.schoolId, school.id));

        return {
            success: true,
            school: {
                name: school.name,
                inviteCode: school.inviteCode,
                createdAt: school.createdAt.toISOString(),
            },
            members
        };

    } catch (error) {
        console.error('Error fetching team:', error);
        return { success: false, error: 'Failed to fetch team details.' };
    }
}
