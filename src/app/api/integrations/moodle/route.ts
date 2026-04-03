import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { moodleConnections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET — fetch this school's Moodle connection status
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ connected: false });

        const [conn] = await db
            .select()
            .from(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId))
            .limit(1);

        if (!conn) return NextResponse.json({ connected: false });

        return NextResponse.json({
            connected: true,
            moodleUrl: conn.moodleUrl,
            lastSyncedAt: conn.lastSyncedAt,
        });
    } catch (err) {
        console.error('GET /api/integrations/moodle error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — save / update a Moodle connection
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId) return NextResponse.json({ error: 'No school attached to account' }, { status: 400 });
        if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });

        const body = await req.json();
        const { moodleUrl, moodleToken } = body;

        if (!moodleUrl?.trim() || !moodleToken?.trim()) {
            return NextResponse.json({ error: 'Moodle URL and token are required' }, { status: 400 });
        }

        // Validate the token by hitting the Moodle API
        const testParams = new URLSearchParams({
            wstoken: moodleToken,
            wsfunction: 'core_webservice_get_site_info',
            moodlewsrestformat: 'json',
        });

        let siteInfo: any = null;
        try {
            const testRes = await fetch(`${moodleUrl.replace(/\/$/, '')}/webservice/rest/server.php?${testParams}`);
            siteInfo = await testRes.json();
            if (siteInfo?.exception) {
                return NextResponse.json({ error: `Moodle rejected the token: ${siteInfo.message}` }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ error: 'Could not reach the Moodle URL. Check it is correct and accessible.' }, { status: 400 });
        }

        // Upsert connection
        const existing = await db
            .select()
            .from(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId))
            .limit(1);

        if (existing.length > 0) {
            await db
                .update(moodleConnections)
                .set({ moodleUrl: moodleUrl.replace(/\/$/, ''), moodleToken })
                .where(eq(moodleConnections.schoolId, schoolId));
        } else {
            await db.insert(moodleConnections).values({
                id: 'mc_' + Math.random().toString(36).substr(2, 9),
                schoolId,
                userId: session.user.id,
                moodleUrl: moodleUrl.replace(/\/$/, ''),
                moodleToken,
            });
        }

        return NextResponse.json({ success: true, siteName: siteInfo?.sitename });
    } catch (err) {
        console.error('POST /api/integrations/moodle error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// DELETE — disconnect Moodle
export async function DELETE() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'Not connected' }, { status: 400 });

        await db
            .delete(moodleConnections)
            .where(eq(moodleConnections.schoolId, schoolId));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('DELETE /api/integrations/moodle error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
