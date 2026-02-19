import OpenAI from 'openai';

// ─── Client ──────────────────────────────────────────────────────────────────
function getClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-...') {
        throw new Error('OPENAI_API_KEY is not set. Add it to .env.local.');
    }
    return new OpenAI({ apiKey });
}

// ─── Structured Analysis (JSON mode) ─────────────────────────────────────────
export async function runAnalysis(
    systemPrompt: string,
    userPrompt: string,
): Promise<string> {
    const client = getClient();
    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
    });
    return response.choices[0].message.content ?? '{}';
}

// ─── Free-form Chat (streaming-compatible) ────────────────────────────────────
export async function runChat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
): Promise<string> {
    const client = getClient();
    const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.6,
    });
    return response.choices[0].message.content ?? '';
}

// ─── Student System Prompt Builder ───────────────────────────────────────────
export interface StudentContext {
    name: string;
    grade: string;
    attendanceRate: number;
    gpa: number;
    assignmentCompletion: number;
    behaviorReferrals: number;
    lateSubmissions: number;
    notes?: string;
    tags?: string[];
    lastRiskScore?: number;
    lastRiskCategory?: string;
}

export function buildStudentSystemPrompt(student: StudentContext, ragContext?: string): string {
    const riskWarnings: string[] = [];
    if (student.attendanceRate < 75) riskWarnings.push('attendance below 75% threshold');
    if (student.gpa < 2.0) riskWarnings.push('GPA below 2.0');
    if (student.assignmentCompletion < 60) riskWarnings.push('assignment completion below 60%');
    if (student.behaviorReferrals >= 3) riskWarnings.push('3+ behavioral referrals this semester');

    return `You are RIN, an AI-powered early warning system for K-12 educators.

STUDENT PROFILE — use this as context for all analysis:
- Name: ${student.name}
- Grade: ${student.grade}
- Attendance Rate: ${student.attendanceRate}%${student.attendanceRate < 75 ? ' (WARNING: below 75% threshold)' : ''}
- GPA: ${student.gpa}${student.gpa < 2.0 ? ' (WARNING: below 2.0)' : ''}
- Assignment Completion: ${student.assignmentCompletion}%${student.assignmentCompletion < 60 ? ' (WARNING: below 60%)' : ''}
- Behavior Referrals: ${student.behaviorReferrals} this semester${student.behaviorReferrals >= 3 ? ' (WARNING: high)' : ''}
- Late Submissions: ${student.lateSubmissions} this semester
${student.notes ? `- Teacher Notes: "${student.notes}"` : ''}
${student.tags?.length ? `- Tags: ${student.tags.join(', ')}` : ''}
${student.lastRiskScore !== undefined ? `- Previous Risk Score: ${student.lastRiskScore} (${student.lastRiskCategory})` : ''}
${riskWarnings.length > 0 ? `\nActive Risk Indicators: ${riskWarnings.join('; ')}` : ''}
${ragContext ? `\nRelevant Past Context:\n${ragContext}` : ''}

Respond as a professional educational AI assistant. Be specific, evidence-based, and use the student data above. Never use emojis. Never fabricate data.`;
}
