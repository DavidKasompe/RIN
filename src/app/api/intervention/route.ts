import { NextRequest, NextResponse } from 'next/server';
import { runHF } from '@/lib/hf';
import { buildInterventionPrompt } from '@/lib/prompts';
import { extractJSON } from '@/lib/parser';
import { safeParseIntervention } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const { summary, riskScore } = await req.json();

    if (!summary || riskScore === undefined) {
      return NextResponse.json(
        { error: 'Summary and riskScore are required' },
        { status: 400 }
      );
    }

    const prompt = buildInterventionPrompt(summary, riskScore);
    const raw = await runHF(prompt);
    const parsed = extractJSON(raw);
    const validated = safeParseIntervention(parsed);

    return NextResponse.json({
      type: 'intervention',
      data: validated,
    });
  } catch (error) {
    console.error('[/api/intervention] Error:', error);

    return NextResponse.json(
      {
        type: 'intervention',
        data: {
          interventions: [
            {
              title: 'Schedule a Meeting',
              priority: 'High' as const,
              description: 'Meet with the student to discuss their situation.',
              actionSteps: ['Schedule a private, supportive conversation', 'Listen to the student\'s concerns', 'Co-create an improvement plan'],
              expectedImpact: 'Early identification of barriers and increased student trust.',
            },
          ],
          parentSummary: 'We recommend scheduling a meeting to discuss your child\'s progress and support strategies.',
        },
        error: error instanceof Error ? error.message : 'Intervention generation failed',
      },
      { status: 200 }
    );
  }
}
