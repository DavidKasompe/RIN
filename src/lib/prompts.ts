/**
 * Structured prompt templates for RIN AI.
 * Each prompt forces strict JSON output to work with HF models
 * that don't have native JSON mode.
 */

export function buildAnalysisPrompt(input: string): string {
  return `Analyze the following student case and return ONLY valid JSON.

Student Case:
${input}

Return in this EXACT JSON format (no other text):

{
  "summary": "A clear 2-3 sentence analysis of the student's situation",
  "risk": {
    "riskScore": <number 0-100>,
    "category": "<one of: Low Risk | Moderate Risk | At Risk | Critical Risk>",
    "confidence": <number 60-99>
  },
  "factors": [
    {
      "name": "<factor name>",
      "impactPercentage": <number 1-100>,
      "trend": "<one of: up | down | neutral>",
      "description": "<one sentence explanation>"
    }
  ],
  "plainLanguage": "A paragraph explaining the assessment in simple, non-technical language suitable for educators"
}

Rules:
- riskScore: 0 = no risk, 100 = maximum risk
- Include 3-6 factors, sorted by impactPercentage descending
- impactPercentage values should sum to approximately 100
- confidence reflects how much data was provided (more detail = higher confidence)
- Do not include any text outside the JSON object`;
}

export function buildInterventionPrompt(summary: string, riskScore: number): string {
  return `Based on this student risk analysis, suggest interventions.

Analysis Summary: ${summary}
Risk Score: ${riskScore}/100

Return ONLY valid JSON in this EXACT format:

{
  "interventions": [
    {
      "title": "<intervention name>",
      "priority": "<one of: High | Medium | Low>",
      "description": "<one sentence description>",
      "actionSteps": ["<step 1>", "<step 2>", "<step 3>"],
      "expectedImpact": "<one sentence about expected outcome>"
    }
  ],
  "parentSummary": "A brief, empathetic paragraph suitable for sharing with parents/guardians"
}

Rules:
- Include 3-5 interventions sorted by priority (High first)
- Action steps should be specific and actionable
- Do not include any text outside the JSON object`;
}

export function buildFollowUpPrompt(
  input: string,
  context: { summary: string; riskScore: number; factors: string[] }
): string {
  return `You previously analyzed a student and found:
- Summary: ${context.summary}
- Risk Score: ${context.riskScore}/100
- Key Factors: ${context.factors.join(', ')}

The educator asks: "${input}"

Return ONLY valid JSON in this EXACT format:

{
  "response": "<your detailed response to the educator's question>",
  "type": "<one of: explanation | suggestion | scenario | report | general>"
}

Rules:
- Respond helpfully and specifically to the question
- Reference the student's actual data when relevant
- Do not include any text outside the JSON object`;
}

export function buildScenarioPrompt(
  summary: string,
  riskScore: number,
  factors: { name: string; impactPercentage: number }[]
): string {
  return `Based on this student analysis:
- Summary: ${summary}
- Current Risk Score: ${riskScore}/100
- Factors: ${JSON.stringify(factors)}

Generate improvement scenarios showing how changes would affect the risk score.

Return ONLY valid JSON in this EXACT format:

{
  "scenarios": [
    {
      "title": "<scenario description>",
      "changes": "<what improves>",
      "predictedRiskScore": <number 0-100>,
      "impact": <negative number showing reduction>,
      "likelihood": "<one of: High | Medium | Low>"
    }
  ],
  "keyInsight": "<one sentence about the most impactful lever>"
}

Rules:
- Include 3-4 scenarios from most impactful to least
- predictedRiskScore must be lower than ${riskScore}
- Do not include any text outside the JSON object`;
}
