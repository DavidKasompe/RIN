import { z } from 'zod';

// ── Analysis Response Schema ──────────────────────────────────────

export const FactorSchema = z.object({
  name: z.string(),
  impactPercentage: z.number().min(0).max(100),
  trend: z.enum(['up', 'down', 'neutral']),
  description: z.string(),
});

export const RiskSchema = z.object({
  riskScore: z.number().min(0).max(100),
  category: z.enum(['Low Risk', 'Moderate Risk', 'At Risk', 'Critical Risk']),
  confidence: z.number().min(0).max(100),
});

export const AnalysisResponseSchema = z.object({
  summary: z.string(),
  risk: RiskSchema,
  factors: z.array(FactorSchema).min(1),
  plainLanguage: z.string(),
});

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

// ── Intervention Response Schema ──────────────────────────────────

export const InterventionSchema = z.object({
  title: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
  description: z.string(),
  actionSteps: z.array(z.string()).min(1),
  expectedImpact: z.string(),
});

export const InterventionResponseSchema = z.object({
  interventions: z.array(InterventionSchema).min(1),
  parentSummary: z.string(),
});

export type InterventionResponse = z.infer<typeof InterventionResponseSchema>;

// ── Follow-Up Response Schema ─────────────────────────────────────

export const FollowUpResponseSchema = z.object({
  response: z.string(),
  type: z.enum(['explanation', 'suggestion', 'scenario', 'report', 'general']),
});

export type FollowUpResponse = z.infer<typeof FollowUpResponseSchema>;

// ── Scenario Response Schema ──────────────────────────────────────

export const ScenarioSchema = z.object({
  title: z.string(),
  changes: z.string(),
  predictedRiskScore: z.number().min(0).max(100),
  impact: z.number(),
  likelihood: z.enum(['High', 'Medium', 'Low']),
});

export const ScenarioResponseSchema = z.object({
  scenarios: z.array(ScenarioSchema).min(1),
  keyInsight: z.string(),
});

export type ScenarioResponse = z.infer<typeof ScenarioResponseSchema>;

// ── Safe Parse Helpers ────────────────────────────────────────────

export function safeParseAnalysis(raw: unknown): AnalysisResponse {
  const result = AnalysisResponseSchema.safeParse(raw);
  if (!result.success) {
    console.error('Zod validation failed:', result.error.format());
    throw new Error(`Invalid analysis response: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
}

export function safeParseIntervention(raw: unknown): InterventionResponse {
  const result = InterventionResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid intervention response: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
}

export function safeParseFollowUp(raw: unknown): FollowUpResponse {
  const result = FollowUpResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid follow-up response: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
}

export function safeParseScenario(raw: unknown): ScenarioResponse {
  const result = ScenarioResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid scenario response: ${result.error.issues.map(i => i.message).join(', ')}`);
  }
  return result.data;
}
