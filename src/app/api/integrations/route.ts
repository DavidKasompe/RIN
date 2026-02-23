import { NextRequest, NextResponse } from 'next/server';
import { Composio } from '@composio/core';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    if (!process.env.COMPOSIO_API_KEY) {
        return NextResponse.json({ available: false, items: [] });
    }

    try {
        let authSession: any = null;
        try {
            authSession = await auth.api.getSession({ headers: req.headers });
        } catch (e: any) {
            console.warn("Auth session fetch error (DB Timeout)", e.message);
        }
        const userId = authSession?.user?.id || 'anonymous_educator';

        let schoolId = 'no_school';
        if (userId !== 'anonymous_educator' && db) {
            try {
                const currentUserReq = await db.select().from(users).where(eq(users.id, userId));
                if (currentUserReq.length > 0 && currentUserReq[0].schoolId) {
                    schoolId = currentUserReq[0].schoolId;
                }
            } catch (e) {
                console.error("DB fetch error in integrations GET", e);
            }
        }

        const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
        const userSession = await composio.create(userId);
        const schoolSession = await composio.create(schoolId);

        // Fetch toolkits for both entities
        const [userToolkits, schoolToolkits] = await Promise.all([
            userSession.toolkits(),
            schoolSession.toolkits()
        ]);

        const workspaceTools = ['googleclassroom', 'canvas', 'moodle', 'powerschool'];

        // Return simplified payload mapping toolkits to their correct entity statuses
        const items = userToolkits.items.map(t => {
            const isWorkspace = workspaceTools.includes(t.slug);
            const activeToolkit = isWorkspace
                ? schoolToolkits.items.find((st: any) => st.slug === t.slug)
                : t;

            return {
                slug: t.slug,
                name: t.name,
                icon: t.logo || '',
                isConnected: !!activeToolkit?.connection?.isActive,
                connectedAccountId: activeToolkit?.connection?.connectedAccount?.id || null
            };
        });

        return NextResponse.json({ available: true, items });
    } catch (error: any) {
        console.error('[/api/integrations] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!process.env.COMPOSIO_API_KEY) {
        return NextResponse.json({ error: 'Composio not configured' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { toolkitSlug, redirectUrl } = body;

        if (!toolkitSlug) {
            return NextResponse.json({ error: 'toolkitSlug is required' }, { status: 400 });
        }

        let authSession: any = null;
        try {
            authSession = await auth.api.getSession({ headers: req.headers });
        } catch (e: any) {
            console.warn("Auth session fetch error (DB Timeout) on POST", e.message);
        }
        const userId = authSession?.user?.id || 'anonymous_educator';

        let schoolId = 'no_school';
        if (userId !== 'anonymous_educator' && db) {
            try {
                const currentUserReq = await db.select().from(users).where(eq(users.id, userId));
                if (currentUserReq.length > 0 && currentUserReq[0].schoolId) {
                    schoolId = currentUserReq[0].schoolId;
                }
            } catch (e) {
                console.error("DB fetch error in integrations POST", e);
            }
        }

        const workspaceTools = ['googleclassroom', 'canvas', 'moodle', 'powerschool'];
        const entityId = workspaceTools.includes(toolkitSlug) ? schoolId : userId;

        const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
        const session = await composio.create(entityId);

        // Generate a connection request using the appropriate entity
        const connectionRequest = await session.authorize(toolkitSlug, {
            callbackUrl: redirectUrl || req.headers.get('origin') + '/dashboard/integrations'
        });

        return NextResponse.json({ url: connectionRequest.redirectUrl });
    } catch (error: any) {
        console.error('[/api/integrations/connect] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─── DELETE /api/integrations — disconnect a connected account ───────────────
export async function DELETE(req: NextRequest) {
    if (!process.env.COMPOSIO_API_KEY) {
        return NextResponse.json({ error: 'Composio not configured' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { connectedAccountId } = body;

        if (!connectedAccountId) {
            return NextResponse.json({ error: 'connectedAccountId is required' }, { status: 400 });
        }

        const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
        await composio.connectedAccounts.delete(connectedAccountId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[/api/integrations/disconnect] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
