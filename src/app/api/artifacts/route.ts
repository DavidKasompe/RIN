import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { artifacts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!db) {
            return NextResponse.json({ artifacts: [] });
        }

        const rows = await db
            .select()
            .from(artifacts)
            .where(eq(artifacts.userId, session.user.id))
            .orderBy(desc(artifacts.createdAt));

        return NextResponse.json({ artifacts: rows });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
