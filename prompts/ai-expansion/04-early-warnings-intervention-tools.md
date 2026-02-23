# Prompt 04: Mastra Agent — Early Warning Triggers & Intervention Tracking Tools

**Role:** You are an expert backend engineer working with the Mastra AI framework, Drizzle ORM on Neon PostgreSQL, and Next.js API routes.

**Objective:**
Expand the Mastra `rinAgent` with two new capabilities: (1) an **early warning system** that detects when a student crosses a risk threshold and logs an alert, and (2) a proper **intervention tracking tool** that lets the AI log, read, and update intervention records directly from chat.

---

## Context

- Existing Mastra tools are in `src/mastra/tools/`. They follow the `createTool` pattern with Zod schemas and Drizzle ORM queries.
- The Mastra agent is registered in `src/mastra/agents/rin-agent.ts` — add all new tools here.
- The chat route at `src/app/api/chat/route.ts` exposes tools to the C1 LLM manually — you must also add each new tool to `C1_TOOLS` (the array of OpenAI-format tool schemas) AND to `executeMastraTool`'s `toolMap`.
- Existing schema tables: `students`, `analyses`, `calendarEvents`, `studentNotes`. Need new tables listed below.

---

## Tasks

### 1. Schema additions in `src/db/schema.ts`

**`interventions` table:**

```typescript
export const interventions = pgTable("interventions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  counselorId: text("counselor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'meeting' | 'phone_call' | 'email' | 'referral' | 'mentoring'
  notes: text("notes"),
  outcome: text("outcome"), // 'positive' | 'neutral' | 'escalated' | 'pending'
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**`earlyWarnings` table:**

```typescript
export const earlyWarnings = pgTable("early_warnings", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  triggeredBy: text("triggered_by").notNull(), // 'risk_score' | 'attendance' | 'gpa' | 'behavior'
  threshold: real("threshold").notNull(), // the value that triggered the alert
  message: text("message").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

Run `npx drizzle-kit push` after adding.

### 2. New Mastra Tools

**`src/mastra/tools/logInterventionTool.ts`**

- Input schema: `{ studentQuery: string, type: string, notes: string, outcome?: string, followUpDate?: string }`
- Look up the student by name/ID (same pattern as `getStudentProfileTool`).
- Get the current user from session OR use a placeholder `counselorId` since Mastra tools don't have HTTP context — accept `counselorId` as an optional input parameter.
- Insert into `interventions` table.
- Return `{ success: true, interventionId, message }`.

**`src/mastra/tools/getInterventionHistoryTool.ts`**

- Input schema: `{ studentQuery: string }`
- Query all interventions for the matched student, ordered by `createdAt DESC`.
- Return `{ interventions: [...], count: number, message }`.

**`src/mastra/tools/checkEarlyWarningsTool.ts`**

- Input schema: `{ studentQuery?: string }` (optional — if omitted, check ALL students for the current user)
- Logic: query students WHERE:
  - `attendanceRate < 70` → trigger `'attendance'` warning
  - `gpa < 2.0` → trigger `'gpa'` warning
  - `lastRiskScore > 75` → trigger `'risk_score'` warning
  - `behaviorReferrals >= 3` → trigger `'behavior'` warning
- For each triggered condition: upsert into `earlyWarnings` (don't duplicate if already exists and unresolved).
- Return `{ warnings: [{ student, trigger, message }], total: number }`.

### 3. Register tools in `src/mastra/agents/rin-agent.ts`

Import and add `logInterventionTool`, `getInterventionHistoryTool`, `checkEarlyWarningsTool` to the agent's tools list.

### 4. Expose to C1 in `src/app/api/chat/route.ts`

Add to `C1_TOOLS` array:

```javascript
{ type: 'function', function: { name: 'logIntervention', description: 'Log an intervention action taken for a student (meeting, phone call, referral, etc)', parameters: { type: 'object', properties: { studentQuery: { type: 'string' }, type: { type: 'string', enum: ['meeting', 'phone_call', 'email', 'referral', 'mentoring'] }, notes: { type: 'string' }, outcome: { type: 'string' }, followUpDate: { type: 'string' } }, required: ['studentQuery', 'type', 'notes'] } } },
{ type: 'function', function: { name: 'getInterventionHistory', description: 'Get the full intervention history for a student', parameters: { type: 'object', properties: { studentQuery: { type: 'string' } }, required: ['studentQuery'] } } },
{ type: 'function', function: { name: 'checkEarlyWarnings', description: 'Check which students have crossed risk thresholds and need immediate attention', parameters: { type: 'object', properties: { studentQuery: { type: 'string' } } } } },
```

Add to `executeMastraTool` toolMap:

```javascript
logIntervention: logInterventionTool,
getInterventionHistory: getInterventionHistoryTool,
checkEarlyWarnings: checkEarlyWarningsTool,
```

**Files to create / modify:**

- `src/db/schema.ts` — add `interventions` + `earlyWarnings` tables
- `src/mastra/tools/logInterventionTool.ts` — new
- `src/mastra/tools/getInterventionHistoryTool.ts` — new
- `src/mastra/tools/checkEarlyWarningsTool.ts` — new
- `src/mastra/agents/rin-agent.ts` — register tools
- `src/app/api/chat/route.ts` — expose to C1
