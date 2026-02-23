import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { studentDocuments, studentNotes, students } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { uploadToSupabaseStorage } from '@/lib/supabase-storage';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(['.pdf', '.docx', '.txt']);
const MIME_MAP: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
};

function ext(filename: string) {
    return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

async function extractText(buffer: Buffer, filename: string): Promise<string> {
    const extension = ext(filename);
    if (extension === '.txt') return buffer.toString('utf-8');
    if (extension === '.pdf') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        return data.text ?? '';
    }
    if (extension === '.docx') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value ?? '';
    }
    return '';
}

async function embedAndStore(
    text: string,
    studentId: string,
    authorId: string,
    docId: string,
) {
    // Split into ≤500-word chunks
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 500) {
        chunks.push(words.slice(i, i + 500).join(' '));
    }
    // Fire-and-forget — swallow errors
    (async () => {
        try {
            const OpenAI = (await import('openai')).default;
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            for (const chunk of chunks) {
                const embRes = await openai.embeddings.create({ model: 'text-embedding-3-small', input: chunk });
                const embedding = embRes.data[0].embedding;
                await db!.insert(studentNotes).values({
                    id: crypto.randomUUID(),
                    studentId,
                    authorId,
                    content: chunk,
                    type: 'document',
                    sourceDocId: docId,
                    embedding,
                });
            }
        } catch (err) {
            console.error('[student-docs] Embedding failed:', err);
        }
    })();
}

// GET — list documents for a student
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = await params;
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!db) return NextResponse.json({ documents: [] });

        const docs = await db
            .select()
            .from(studentDocuments)
            .where(and(
                eq(studentDocuments.studentId, studentId),
                eq(studentDocuments.uploadedBy, session.user.id),
            ))
            .orderBy(desc(studentDocuments.createdAt));

        return NextResponse.json({ documents: docs });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// POST — upload a document for a student
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = await params;
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!db) return NextResponse.json({ error: 'Database not available' }, { status: 503 });

        // Verify student exists
        const [student] = await db.select().from(students).where(eq(students.id, studentId));
        if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const filename = file.name;
        const extension = ext(filename);
        if (!ALLOWED.has(extension)) {
            return NextResponse.json({ error: `Unsupported file type. Upload PDF, DOCX, or TXT.` }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File too large. Max 10 MB.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const text = await extractText(buffer, filename);

        // Upload to Supabase
        const docId = crypto.randomUUID();
        const storageKey = `student-docs/${studentId}/${docId}-${filename.replace(/[^a-z0-9.-]/gi, '_')}`;
        const publicUrl = await uploadToSupabaseStorage(buffer, storageKey, MIME_MAP[extension] ?? 'application/octet-stream');

        // Insert record
        await db.insert(studentDocuments).values({
            id: docId,
            studentId,
            uploadedBy: session.user.id,
            filename,
            storageKey,
            publicUrl,
            type: extension.slice(1),
            sizeBytes: file.size,
        });

        // Embed text into RAG (async, non-blocking)
        if (text.trim()) {
            embedAndStore(text, studentId, session.user.id, docId);
        }

        return NextResponse.json({
            document: { id: docId, filename, publicUrl, sizeBytes: file.size, createdAt: new Date().toISOString() },
        });
    } catch (err) {
        console.error('[student-docs POST]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
