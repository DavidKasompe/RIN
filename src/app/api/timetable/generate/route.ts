import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// POST /api/timetable/generate
// Body: { rawScheduleText: string, cohortId?: string }
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { rawScheduleText, cohortId } = await req.json();
        if (!rawScheduleText?.trim()) {
            return NextResponse.json({ error: 'rawScheduleText is required' }, { status: 400 });
        }

        const prompt = `You are a timetable parser. Given the raw schedule text below, extract all class sessions and return a JSON array.

Each object in the array must have:
- dayOfWeek: number (0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday)
- startTime: string "HH:MM"
- endTime: string "HH:MM"
- subject: string
- room: string or null
- classType: "lecture" | "lab" | "tutorial" | "seminar" | "practical" | null
- roomCapacity: number or null (if mentioned)
- studentCount: number or null (if mentioned)
- slotLabel: string or null (e.g. "Period 1", "Morning Session")

Return ONLY valid JSON array with no markdown or extra text.

Raw schedule:
${rawScheduleText}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
        });

        const raw = completion.choices[0].message.content ?? '[]';
        const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());

        return NextResponse.json({ entries: parsed, cohortId: cohortId ?? null });
    } catch (err) {
        console.error('POST /api/timetable/generate error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
