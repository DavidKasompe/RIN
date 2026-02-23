# Prompt 05: Student Result Trend Viewer

**Role:** You are an expert Next.js frontend engineer specialising in data visualisation with `recharts` and inline CSS React components.

**Objective:**
Build a **Results tab** on the Student Detail page (`/dashboard/students/[id]`) showing the student's academic trajectory — GPA trend over time, assignment completion heatmap, and a simple predictive trend line. Data currently lives as static snapshots in the `students` table; this prompt focuses on visualising existing data plus a `risk_history` table for trend tracking.

---

## Context

- Student detail page is `src/app/dashboard/students/[id]/page.tsx`. After Prompt 02 it will have a tab system (Overview · Documents). This prompt adds a **Results** tab as the third tab.
- `recharts` is already installed and used on the Overview page.
- The `analyses` table stores historical risk scores (one row per AI analysis run). Use it for the risk score trend — it has `riskScore`, `createdAt`, `factors`, `summary`.
- The current student view already shows the last 4 weeks of risk as **generated mock data** — the Results tab replaces this with real data from the `analyses` table.
- Design: same inline CSS, white card panels (`borderRadius: 14, border: '1px solid rgba(35,6,3,0.07)', padding: '24px'`).

---

## Tasks

### 1. API: `GET /api/students/[id]/results`

Create `src/app/api/students/[id]/results/route.ts`:

- Auth-guard + verify student belongs to user.
- Query `analyses` table for all rows with this `studentId`, ordered by `createdAt ASC`. Return: `{ riskHistory: [{ score, category, createdAt, factors }] }`.
- Also return current snapshot from `students` table: `{ gpa, attendanceRate, assignmentCompletion, behaviorReferrals, lateSubmissions }`.

### 2. Results Tab UI in `src/app/dashboard/students/[id]/page.tsx`

Add **"Results"** as the third tab (after Overview · Documents from Prompt 02).

**Section A — Risk Score History Chart**

- `LineChart` (recharts) with real data from `riskHistory`.
- X-axis: formatted date (`MMM dd`). Y-axis: 0–100.
- A **reference line** at y=75 in red (`stroke: '#C0392B'`) labelled `"High Risk"`.
- If fewer than 2 data points: show `"Run more AI analyses to see trends. Click 'Analyze in Chat' to get started."`.

**Section B — Key Metrics Snapshot (4 metric cards in a row)**

- Attendance, GPA, Assignment Completion, Behavior Referrals — same `<Metric>` component style already in the file.
- Add a small trend indicator: compare current value to the previous analysis value (if available). Show ▲ green or ▼ red arrow with the delta.

**Section C — Assignment Completion Heatmap**

- A simple **7×N grid** (7 days wide, N weeks tall) where each cell represents one day of the school year.
- Cell color: `#27AE60` (completed), `#E67E22` (late), `#C0392B` (missing), `rgba(35,6,3,0.05)` (no data).
- Since we don't have daily assignment records yet, generate a **plausible mock** based on `assignmentCompletion` percentage — distribute completions/lates/misses proportionally. Add a `// TODO: replace with real assignment records when available` comment.
- Legend: 4 color chips labeled Completed / Late / Missing / No data.

**Section D — Predictive Trend Line**

- Below the risk history chart, add a 2-sentence AI-generated prediction:
  ```
  Based on current trajectory, {student.name}'s risk score is projected to
  reach {predictedScore} by end of semester.
  ```
- Calculate `predictedScore` client-side: linear regression on the last 3 risk scores (or just last score ±5% if fewer than 3). Round to integer. Clamp 0–100.
- Style it as a callout box: `backgroundColor: riskScore > 75 ? 'rgba(192,57,43,0.06)' : 'rgba(39,174,96,0.06)'`, matching border color with left accent stripe.

---

## Technical Requirements

- Fetch `/api/students/[id]/results` inside the `useEffect` when the Results tab is first activated (lazy load — not on mount).
- Show a skeleton/loading state for each section while data loads.
- All chart fonts: `Inter, system-ui, sans-serif`, size 11-12px.
- The heatmap cells must be `16x16px` squares with `2px` gap and `border-radius: 3px`.

**Files to create / modify:**

- `src/app/api/students/[id]/results/route.ts` — new
- `src/app/dashboard/students/[id]/page.tsx` — add Results tab
