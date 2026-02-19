import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis, runChat } from '@/lib/ai';
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

const ANALYSIS_KEYWORDS = [
  'analyze', 'assess', 'evaluate', 'review', 'student',
  'attendance', 'score', 'grade', 'performance', 'drop',
  'risk', 'dropout', 'failing', 'struggling', 'absence',
  'behavior', 'engagement', 'participation',
];

const SCENARIO_KEYWORDS = ['simulate', 'scenario', 'what if'];
const FOLLOW_UP_KEYWORDS = ['factor', 'detail', 'why', 'explain', 'how', 'parent', 'summary', 'report', 'letter'];

const GENERAL_SYSTEM_PROMPT = `You are RIN, an intelligent AI assistant for educators. Help with student risk assessment, educational planning, curriculum design, teaching strategies, and general educator questions.

Be knowledgeable, helpful, and supportive. Never use emojis. Respond with clear, well-structured markdown.`;

const STRUCTURED_SYSTEM_PROMPT = `You are RIN, an AI student dropout risk assessment system for educators. Always respond ONLY with valid JSON. Never include markdown, code fences, or any text outside the JSON object. Your output must be directly parseable by JSON.parse().`;

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { message, conversationHistory, analysisContext } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();
    const hasAnalysisContext = !!analysisContext && analysisContext.riskScore > 0;
    const isFirstMessage = !conversationHistory || conversationHistory.length < 2;

    const isAnalysisRequest = ANALYSIS_KEYWORDS.some(k => lowerMessage.includes(k));
    const isScenarioRequest = SCENARIO_KEYWORDS.some(k => lowerMessage.includes(k));
    const isFollowUpRequest = hasAnalysisContext && FOLLOW_UP_KEYWORDS.some(k => lowerMessage.includes(k));

    // Route 1: General conversation
    if (!isAnalysisRequest && !isScenarioRequest && !isFollowUpRequest && (!isFirstMessage || !hasAnalysisContext)) {
      const chatResponse = await runChat([
        { role: 'system', content: GENERAL_SYSTEM_PROMPT },
        ...((conversationHistory ?? []).slice(-6)),
        { role: 'user', content: message },
      ]);
      return NextResponse.json({ type: 'general', data: { response: chatResponse } });
    }

    // Route 2: Structured analysis pipeline
    let raw: string;
    let responseType: 'analysis' | 'followup' | 'scenario';

    if (isScenarioRequest && hasAnalysisContext) {
      const factors = analysisContext!.factors.map(f => ({
        name: f,
        impactPercentage: Math.round(100 / analysisContext!.factors.length),
      }));
      const prompt = buildScenarioPrompt(analysisContext!.summary, analysisContext!.riskScore, factors);
      raw = await runAnalysis(STRUCTURED_SYSTEM_PROMPT, prompt);
      responseType = 'scenario';
    } else if (isFollowUpRequest && hasAnalysisContext) {
      const prompt = buildFollowUpPrompt(message, analysisContext!);
      raw = await runAnalysis(STRUCTURED_SYSTEM_PROMPT, prompt);
      responseType = 'followup';
    } else if (isAnalysisRequest) {
      const prompt = buildAnalysisPrompt(message);
      raw = await runAnalysis(STRUCTURED_SYSTEM_PROMPT, prompt);
      responseType = 'analysis';
    } else {
      const chatResponse = await runChat([
        { role: 'system', content: GENERAL_SYSTEM_PROMPT },
        { role: 'user', content: message },
      ]);
      return NextResponse.json({ type: 'general', data: { response: chatResponse } });
    }

    const parsed = extractJSON(raw);
    let validated;
    if (responseType === 'analysis') validated = safeParseAnalysis(parsed);
    else if (responseType === 'scenario') validated = safeParseScenario(parsed);
    else validated = safeParseFollowUp(parsed);

    return NextResponse.json({ type: responseType, data: validated });
  } catch (error) {
    console.error('[/api/analyze] Error:', error);
    const fallback: AnalysisResponse = {
      summary: 'Unable to complete the request at this time. Please try again.',
      risk: { riskScore: 0, category: 'Low Risk', confidence: 0 },
      factors: [{ name: 'Service Issue', impactPercentage: 100, trend: 'neutral', description: 'Temporary issue processing the request' }],
      plainLanguage: 'The request could not be completed. Please try again.',
    };
    return NextResponse.json({ type: 'analysis', data: fallback, error: error instanceof Error ? error.message : 'Request failed' }, { status: 200 });
  }
}
