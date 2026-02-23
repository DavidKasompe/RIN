# Prompt 07: Scenario Simulation & Predictive Cohort Analysis Mastra Tools

**Role:** You are an expert backend engineer working with the Mastra AI framework, OpenAI function calling, and Drizzle ORM.

**Objective:**
Give the RIN AI agent two advanced analytical capabilities: (1) **Scenario Simulation** — "What if this student's attendance improved by 10%?" showing how the risk score would change, and (2) **Predictive Cohort Analysis** — identifying which entire class groups or grade levels are trending toward collective risk.

---

## Context

- Mastra tools live in `src/mastra/tools/`.
- The risk scoring logic lives in `/api/analyze` — the risk score is calculated using a weighted formula across `attendanceRate`, `gpa`, `assignmentCompletion`, `behaviorReferrals`, `lateSubmissions`.
- Existing tools follow the `createTool` pattern with Zod input/output schemas.
- All new tools must be registered in `src/mastra/agents/rin-agent.ts` AND exposed to C1 in `src/app/api/chat/route.ts` (both `C1_TOOLS` array and `executeMastraTool` toolMap).

---

## Tasks

### 1. `src/mastra/tools/runScenarioSimulationTool.ts`

**Purpose:** Given a student + one or more hypothetical changes to their metrics, recalculate what their risk score would be.

**Input schema:**

```typescript
z.object({
  studentQuery: z.string().describe("Student ID or name"),
  scenarios: z
    .array(
      z.object({
        factor: z.enum([
          "attendanceRate",
          "gpa",
          "assignmentCompletion",
          "behaviorReferrals",
          "lateSubmissions",
        ]),
        change: z
          .number()
          .describe(
            "Absolute change (e.g. +10 for attendance, -0.3 for GPA, -2 for referrals)",
          ),
      }),
    )
    .describe("List of hypothetical changes to simulate"),
});
```

**Logic:**

1. Fetch the student's current metrics from the `students` table.
2. Apply each scenario change: `newValue = currentValue + change`. Clamp: attendance/gpa/completion to [0, 100/4.0/100], referrals/lateSubmissions to ≥ 0.
3. Recalculate risk score using the same formula as `/api/analyze`:
   - `attendanceRisk = max(0, (85 - attendance) * 1.5)`
   - `gpaRisk = max(0, (2.5 - gpa) * 20)`
   - `completionRisk = max(0, (80 - completion) * 1.0)`
   - `behaviorRisk = referrals * 5`
   - `lateRisk = lateSubmissions * 1.5`
   - `rawScore = attendanceRisk + gpaRisk + completionRisk + behaviorRisk + lateRisk`
   - `score = Math.min(100, Math.round(rawScore))`
4. Determine category from score: <30 Low, <55 Moderate, <75 At Risk, ≥75 Critical.

**Output:**

```typescript
{
    studentName: string,
    currentScore: number,
    currentCategory: string,
    simulatedScore: number,
    simulatedCategory: string,
    delta: number,          // simulatedScore - currentScore (negative = improvement)
    scenarioSummary: string, // human-readable e.g. "If attendance improves by 10% and GPA rises by 0.3"
    message: string,
}
```

### 2. `src/mastra/tools/getCohortRiskAnalysisTool.ts`

**Purpose:** Analyze risk patterns across an entire grade level or cohort — identify collective trends and emerging at-risk clusters.

**Input schema:**

```typescript
z.object({
  gradeLevel: z
    .string()
    .optional()
    .describe('Grade level to analyze, e.g. "9" or "10th"'),
  riskThreshold: z
    .number()
    .default(60)
    .describe(
      "Score above which a student is considered at-risk for cohort purposes",
    ),
});
```

**Logic:**

1. Query all students belonging to the requesting user (filter by `userId`).
2. If `gradeLevel` is provided, filter by `grade` field (fuzzy match — `'9'`, `'9th'`, `'Grade 9'` should all work).
3. Compute cohort stats:
   - `totalStudents`, `atRiskCount` (score ≥ threshold), `criticalCount` (score ≥ 75), `avgGpa`, `avgAttendance`, `avgRiskScore`
   - `topRiskFactors`: the 3 most common risk factors across all students (derive from which metrics are below threshold for the most students)
   - `topAtRiskStudents`: top 5 by `lastRiskScore` — return `{ name, riskScore, category }`
4. A simple trend insight string: if >30% of cohort is at-risk, `"ALERT: More than 30% of Grade X students are at or above risk threshold."`.

**Output:**

```typescript
{
    gradeLevel: string | 'All Grades',
    totalStudents: number,
    atRiskCount: number,
    criticalCount: number,
    atRiskPercent: number,
    avgGpa: number,
    avgAttendance: number,
    avgRiskScore: number,
    topRiskFactors: string[],
    topAtRiskStudents: { name: string, riskScore: number, category: string }[],
    insight: string,
    message: string,
}
```

### 3. Register & Expose Both Tools

**`src/mastra/agents/rin-agent.ts`**: import + add to tools list.

**`src/app/api/chat/route.ts` — add to `C1_TOOLS`:**

```javascript
{ type: 'function', function: { name: 'runScenarioSimulation', description: 'Simulate how a student\'s risk score would change if their attendance, GPA, or other factors improved or worsened. Use for "what if" questions.', parameters: { type: 'object', properties: { studentQuery: { type: 'string' }, scenarios: { type: 'array', items: { type: 'object', properties: { factor: { type: 'string' }, change: { type: 'number' } }, required: ['factor', 'change'] } } }, required: ['studentQuery', 'scenarios'] } } },
{ type: 'function', function: { name: 'getCohortRiskAnalysis', description: 'Analyze risk patterns across an entire grade level or cohort of students. Identifies at-risk clusters and collective trends.', parameters: { type: 'object', properties: { gradeLevel: { type: 'string' }, riskThreshold: { type: 'number' } } } } },
```

**`executeMastraTool` toolMap:**

```javascript
runScenarioSimulation: runScenarioSimulationTool,
getCohortRiskAnalysis: getCohortRiskAnalysisTool,
```

---

## Technical Requirements

- The risk score formula **must match** `/api/analyze/route.ts` exactly — read that file first and copy the calculation to avoid drift.
- `getCohortRiskAnalysisTool` must gracefully handle users with 0 students (return a helpful message, not an error).
- `runScenarioSimulationTool` must return a negative `delta` when the student improves (lower risk = better) — the AI should describe it as "improvement".

**Files to create / modify:**

- `src/mastra/tools/runScenarioSimulationTool.ts` — new
- `src/mastra/tools/getCohortRiskAnalysisTool.ts` — new
- `src/mastra/agents/rin-agent.ts` — register tools
- `src/app/api/chat/route.ts` — expose to C1
