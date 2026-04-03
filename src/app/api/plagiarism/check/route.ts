import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { plagiarismResults, students } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
}

async function embedText(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // cap to avoid token limits
    });
    return response.data[0].embedding;
}

// POST /api/plagiarism/check
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ error: 'No school or DB' }, { status: 400 });

        const body = await req.json();
        const { studentId, assignmentId, submissionId, submissionText } = body;

        if (!studentId || !assignmentId || !submissionText) {
            return NextResponse.json({ error: 'studentId, assignmentId, and submissionText are required' }, { status: 400 });
        }

        // 1. Embed the new submission
        const newEmbedding = await embedText(submissionText);

        // 2. Fetch all existing results for this assignmentId to compare against
        const peers = await db
            .select()
            .from(plagiarismResults)
            .where(
                and(
                    eq(plagiarismResults.schoolId, schoolId),
                    eq(plagiarismResults.assignmentId, assignmentId),
                    ne(plagiarismResults.studentId, studentId)
                )
            );

        // 3. Compute cosine similarity vs. each peer
        const THRESHOLD = 0.85;
        const matchedSources: { source: string; score: number; excerpt: string }[] = [];
        let maxScore = 0;

        for (const peer of peers) {
            // We stored submissions — re-embed the peer text to compare
            // (In a real prod system you'd store embeddings; for Phase 1 this is acceptable)
            const peerEmb = await embedText(peer.submissionText);
            const score = cosineSimilarity(newEmbedding, peerEmb);
            if (score > maxScore) maxScore = score;
            if (score >= THRESHOLD) {
                matchedSources.push({
                    source: `Peer submission (student ${peer.studentId})`,
                    score: Math.round(score * 100) / 100,
                    excerpt: peer.submissionText.slice(0, 200),
                });
            }
        }

        const flagged = maxScore >= THRESHOLD;
        const flagReason = flagged ? 'peer_similarity' : null;

        // 4. Check for self-plagiarism (same student, different assignment)
        const selfPrev = await db
            .select()
            .from(plagiarismResults)
            .where(
                and(
                    eq(plagiarismResults.studentId, studentId),
                    ne(plagiarismResults.assignmentId, assignmentId)
                )
            );

        for (const prev of selfPrev) {
            const prevEmb = await embedText(prev.submissionText);
            const score = cosineSimilarity(newEmbedding, prevEmb);
            if (score >= THRESHOLD) {
                matchedSources.push({
                    source: `Previous submission (assignment ${prev.assignmentId})`,
                    score: Math.round(score * 100) / 100,
                    excerpt: prev.submissionText.slice(0, 200),
                });
            }
        }

        // 5. Upsert result
        const existingResult = await db
            .select()
            .from(plagiarismResults)
            .where(
                and(
                    eq(plagiarismResults.studentId, studentId),
                    eq(plagiarismResults.assignmentId, assignmentId)
                )
            )
            .limit(1);

        const resultId = existingResult.length > 0
            ? existingResult[0].id
            : 'plg_' + Math.random().toString(36).substr(2, 9);

        const resultPayload = {
            schoolId,
            studentId,
            assignmentId,
            submissionId: submissionId ?? assignmentId,
            submissionText,
            similarityScore: maxScore,
            flagged,
            flagReason,
            matchedSources,
            status: flagged ? 'flagged' : 'clean',
            checkedAt: new Date(),
        };

        if (existingResult.length > 0) {
            await db.update(plagiarismResults).set(resultPayload).where(eq(plagiarismResults.id, resultId));
        } else {
            await db.insert(plagiarismResults).values({ id: resultId, ...resultPayload });
        }

        return NextResponse.json({
            similarityScore: maxScore,
            flagged,
            flagReason,
            matchedSources,
            status: flagged ? 'flagged' : 'clean',
        });
    } catch (err) {
        console.error('POST /api/plagiarism/check error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET /api/plagiarism/check?studentId=xxx
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const schoolId = (session.user as any).schoolId;
        if (!schoolId || !db) return NextResponse.json({ results: [] });

        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });

        const results = await db
            .select()
            .from(plagiarismResults)
            .where(
                and(
                    eq(plagiarismResults.studentId, studentId),
                    eq(plagiarismResults.schoolId, schoolId)
                )
            )
            .orderBy(plagiarismResults.checkedAt);

        return NextResponse.json({ results });
    } catch (err) {
        console.error('GET /api/plagiarism/check error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// PATCH /api/plagiarism/check — update status (dismiss/escalate/reviewed)
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

        const { resultId, status } = await req.json();
        const validStatuses = ['pending', 'clean', 'flagged', 'reviewed', 'dismissed'];
        if (!resultId || !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid resultId or status' }, { status: 400 });
        }

        await db
            .update(plagiarismResults)
            .set({ status, reviewedBy: session.user.id, reviewedAt: new Date() })
            .where(eq(plagiarismResults.id, resultId));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('PATCH /api/plagiarism/check error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
