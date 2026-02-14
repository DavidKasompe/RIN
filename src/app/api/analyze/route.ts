import { NextRequest, NextResponse } from 'next/server';
import { runHF, runHFChat } from '@/lib/hf';
import { buildAnalysisPrompt, buildFollowUpPrompt, buildScenarioPrompt } from '@/lib/prompts';
import { extractJSON } from '@/lib/parser';
import {
  safeParseAnalysis,
  safeParseFollowUp,
  safeParseScenario,
  type AnalysisResponse,
} from '@/lib/schemas';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: ConversationMessage[];
  analysisContext?: {
    summary: string;
    riskScore: number;
    factors: string[];
  };
}

// Keywords that indicate this is a student risk analysis request
const ANALYSIS_KEYWORDS = [
  'analyze', 'assess', 'evaluate', 'review', 'student',
  'attendance', 'score', 'grade', 'performance', 'drop',
  'risk', 'dropout', 'failing', 'struggling', 'absence',
  'behavior', 'engagement', 'participation',
];

const SCENARIO_KEYWORDS = ['simulate', 'scenario', 'what if'];

const FOLLOW_UP_KEYWORDS = [
  'factor', 'detail', 'why', 'explain', 'how',
  'parent', 'summary', 'report', 'letter',
];

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { message, conversationHistory, analysisContext } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const lowerMessage = message.toLowerCase();
    const hasAnalysisContext = !!analysisContext && analysisContext.riskScore > 0;
    const isFirstMessage = !conversationHistory || conversationHistory.length < 2;

    // Detect if this is a structured analysis request or a general question
    const isAnalysisRequest = ANALYSIS_KEYWORDS.some(k => lowerMessage.includes(k));
    const isScenarioRequest = SCENARIO_KEYWORDS.some(k => lowerMessage.includes(k));
    const isFollowUpRequest = hasAnalysisContext && FOLLOW_UP_KEYWORDS.some(k => lowerMessage.includes(k));

    // Route 1: General conversation (NOT about student analysis)
    if (!isAnalysisRequest && !isScenarioRequest && !isFollowUpRequest && (!isFirstMessage || !hasAnalysisContext)) {
      const chatResponse = await runHFChat(message);
      return NextResponse.json({
        type: 'general',
        data: { response: chatResponse },
      });
    }

    // Route 2: Structured analysis pipeline
    let raw: string;
    let responseType: 'analysis' | 'followup' | 'scenario';

    if (isScenarioRequest && hasAnalysisContext) {
      // Scenario simulation
      const factors = analysisContext!.factors.map(f => ({
        name: f,
        impactPercentage: Math.round(100 / analysisContext!.factors.length),
      }));
      const prompt = buildScenarioPrompt(
        analysisContext!.summary,
        analysisContext!.riskScore,
        factors
      );
      raw = await runHF(prompt);
      responseType = 'scenario';
    } else if (isFollowUpRequest && hasAnalysisContext) {
      // Follow-up about existing analysis
      const prompt = buildFollowUpPrompt(message, analysisContext!);
      raw = await runHF(prompt);
      responseType = 'followup';
    } else if (isAnalysisRequest) {
      // New student analysis
      const prompt = buildAnalysisPrompt(message);
      raw = await runHF(prompt);
      responseType = 'analysis';
    } else {
      // Fallback: treat as general chat
      const chatResponse = await runHFChat(message);
      return NextResponse.json({
        type: 'general',
        data: { response: chatResponse },
      });
    }

    // Parse and validate structured responses
    const parsed = extractJSON(raw);

    let validated;
    if (responseType === 'analysis') {
      validated = safeParseAnalysis(parsed);
    } else if (responseType === 'scenario') {
      validated = safeParseScenario(parsed);
    } else {
      validated = safeParseFollowUp(parsed);
    }

    return NextResponse.json({
      type: responseType,
      data: validated,
    });
  } catch (error) {
    console.error('[/api/analyze] Error:', error);

    // If structured parsing fails, try a general chat fallback
    try {
      const body = await req.clone().json();
      const chatResponse = await runHFChat(body.message || 'Hello');
      return NextResponse.json({
        type: 'general',
        data: { response: chatResponse },
      });
    } catch {
      // Final fallback
      const fallback: AnalysisResponse = {
        summary: 'Unable to complete the request at this time. Please try again.',
        risk: { riskScore: 0, category: 'Low Risk', confidence: 0 },
        factors: [{ name: 'Service Issue', impactPercentage: 100, trend: 'neutral', description: 'Temporary issue processing the request' }],
        plainLanguage: 'The request could not be completed. Please try again.',
      };

      return NextResponse.json(
        {
          type: 'analysis',
          data: fallback,
          error: error instanceof Error ? error.message : 'Request failed',
        },
        { status: 200 }
      );
    }
  }
}

