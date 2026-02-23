import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(['.pdf', '.docx', '.txt']);

function ext(filename: string) {
    return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

async function extractText(buffer: Buffer, filename: string): Promise<string> {
    const extension = ext(filename);

    if (extension === '.txt') {
        return buffer.toString('utf-8');
    }

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

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const filename = file.name;
        const extension = ext(filename);

        if (!ALLOWED.has(extension)) {
            return NextResponse.json(
                { error: `Unsupported file type "${extension}". Please upload a PDF, DOCX, or TXT file.` },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File is too large. Maximum size is 5 MB.' },
                { status: 413 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const text = await extractText(buffer, filename);

        if (!text.trim()) {
            return NextResponse.json(
                { error: 'Could not extract text from this file. The file may be empty or image-only.' },
                { status: 422 }
            );
        }

        return NextResponse.json({
            text,
            filename,
            size: file.size,
        });
    } catch (error) {
        console.error('[/api/upload-document]', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
