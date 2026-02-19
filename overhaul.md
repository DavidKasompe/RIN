# RIN — Overhaul Document
## Responsible Insight Navigator · Product & Technical Revamp

---

## 🚨 What's Broken Today

| Problem | Root Cause |
|---|---|
| No clear user journey | Users land on a chat with no context of what to type |
| No student identity | Every analysis is anonymous — nothing is retained or trackable |
| No direction | The app doesn't tell you *which* students to analyze or *why* |
| Weak AI routing | HuggingFace Mistral-7B is unreliable at structured JSON — fails silently |
| No data management | Students, results, and risk trends disappear with no roster |
| Landing page is hollow | Stats (10,000+ students) are fake; flow has no call-to-action beyond "try it" |
| Settings page says "Grok AI" | Inconsistency — actual model is Mistral via HF |

---

## 🎯 Revamped Product Vision

> **RIN is a classroom-level early warning system for K-12 and university educators.**
> You manage a real roster of students. RIN continuously monitors their data and flags who is at risk, why, and what to do about it — all through a clean, conversational interface backed by structured AI analysis.

### Target Users
- **Classroom teachers** tracking 20–40 students per semester
- **School counselors** monitoring flagged students across multiple classes
- **Academic advisors** at universities tracking cohorts by major/year

### Target Students (Scope)
RIN focuses on **secondary and post-secondary** students (Grades 9–12 and university). Risk indicators are calibrated to:
- Chronic absenteeism (>15% absences = "Moderate Risk" threshold)
- GPA decline across 2+ consecutive grading periods
- Missing assignment streaks (3+ consecutive = warning)
- Behavioral referrals
- Late/failing any core subject

---

## 🏗️ New Architecture

```
┌─────────────────────────────────────────────────────┐
│              RIN Dashboard (Next.js 16)             │
├──────────────┬──────────────┬───────────────────────┤
│  Landing     │  Dashboard   │  Students Table       │
│  Page        │  Chat (AI)   │  (Add / Edit / View)  │
│              │  Overview    │                       │
│              │  Settings    │                       │
├──────────────┴──────────────┴───────────────────────┤
│            Next.js API Routes (server-side)         │
│   /api/analyze      /api/intervention               │
├─────────────────────────────────────────────────────┤
│      Prompt Engineering + Zod Schema Validation     │
│      Student profile injected as RAG context        │
├─────────────────────────────────────────────────────┤
│              OpenAI API (gpt-4o-mini)               │
│         Structured outputs · JSON mode              │
├─────────────────────────────────────────────────────┤
│  localStorage: students[], analyses[], chatSessions[]│
└─────────────────────────────────────────────────────┘
```

---

## 🔄 AI Provider Switch: HuggingFace → OpenAI

### Why Switch
- Mistral-7B via HF Inference frequently violates JSON-only constraints → parse failures
- OpenAI `gpt-4o-mini` supports **native JSON mode** (`response_format: { type: "json_object" }`)
- Dramatically better instruction-following, lower hallucination rate
- Still cost-effective: ~$0.0001 per analysis call

### Implementation
```
npm install openai
```

**`src/lib/ai.ts`** (replaces `hf.ts`)
```ts
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// JSON-strict mode for structured analysis
export async function runAI(prompt: string, systemPrompt: string): Promise<string>

// Free-form chat mode for general Q&A  
export async function runAIChat(messages: ChatMessage[]): Promise<string>
```

**`.env.example`**
```
OPENAI_API_KEY=sk-...
```

---

## 👥 Student Management (Core New Feature)

### Data Model

```ts
interface Student {
  id: string;
  name: string;               // Full name
  studentId: string;          // School ID / roll number
  email?: string;
  grade: string;              // "9" | "10" | "11" | "12" | "Freshman" | etc.
  subject?: string;           // Class/subject the teacher monitors
  
  // Academic indicators
  attendanceRate: number;      // 0–100 (%)
  gpa: number;                 // 0.0–4.0
  assignmentCompletion: number; // 0–100 (%)
  
  // Behavioral indicators  
  behaviorReferrals: number;   // Count this semester
  lateSubmissions: number;     // Count this semester
  
  // Meta
  notes?: string;              // Teacher's free-text notes
  tags?: string[];             // e.g. ["ELL", "IEP", "504"]
  createdAt: number;
  updatedAt: number;
  
  // Auto-computed (from analyses)
  lastRiskScore?: number;
  lastRiskCategory?: string;
  lastAnalyzedAt?: number;
}
```

### `/dashboard/students` — Student Roster Table

**Features:**
- Sortable columns: Name, Grade, Attendance, GPA, Risk Score, Last Analyzed
- Filter bar: by risk category, grade, tags
- Search by name or student ID
- Color-coded risk badge column (auto-updates after each AI analysis)
- **"Analyze" button** per row → opens chat with that student pre-loaded
- **"Add Student" button** → slide-over form
- **Import CSV** → paste or upload a spreadsheet of students
- Empty state with clear onboarding prompt

### Student Slide-Over Form (Add / Edit)
- Name, Student ID, Grade (dropdown), Subject
- Attendance % slider
- GPA input (0.0–4.0)
- Assignment completion % slider
- Behavior referrals (number)
- Late submissions (number)
- Notes (textarea)
- Tags (multi-select: ELL, IEP, 504, At-Risk, Monitored)

---

## 💬 Revamped Dashboard Chat

### Key Change: Student-First Flow

**Before:** User opens a blank chat and describes a student in free text.

**After:**
1. User selects a student from a dropdown (or clicks "Analyze" from the roster)
2. Student profile card is displayed at top of chat — all their data is visible
3. Chat input gives smart prompts: *"Run full risk assessment"*, *"What's changed since last analysis?"*, *"Generate parent report"*
4. AI receives the student's full structured profile as RAG context in every prompt

### RAG Context Injection
Every prompt to OpenAI includes a **system preamble** with the student's data:

```
Student Profile (use this as context for all analysis):
- Name: Jamie Chen
- Grade: 10th Grade
- Attendance Rate: 68% (⚠️ below 75% threshold)
- GPA: 1.8 (↓ from 2.4 last semester)
- Assignment Completion: 54%
- Behavior Referrals: 3 this semester
- Late Submissions: 8 this semester
- Teacher Notes: "Seems withdrawn since January. Parents unresponsive."
- Tags: ELL

Now answer the educator's question or perform the requested analysis.
```

This means:
- No more free-text "describe the student" — the data is already there
- AI responses are grounded in *actual* student records
- Analyses are automatically saved back to the student's profile

---

## 📊 Revamped Overview / Analytics

### Class Dashboard
- **At-Risk Roster** — table of all students with `lastRiskCategory` = "At Risk" or "Critical Risk"
- **Risk Distribution Bar** — real counts from the student roster, not just analyses
- **Top Factors Heatmap** — which risk factors appear most across the class
- **Improvement Tracker** — students whose risk score dropped since last analysis

### Removed
- Fake animated counters (10,000 students, 500 educators, 95% accuracy) — replace with real user data or remove entirely

---

## 🌐 Revamped Landing Page

### New Messaging
**Hero headline:** *"Know which students need help — before it's too late."*  
**Subhead:** *"RIN gives educators a real-time risk dashboard for their class. Add your students, run AI-powered assessments, and get prioritized action plans."*

### New Sections
1. **How It Works** — 3 clear steps:
   - Step 1: Add your students (import CSV or add manually)
   - Step 2: Run AI risk assessments (conversational or one-click)
   - Step 3: Act on prioritized intervention plans
2. **Who It's For** — Teachers, Counselors, Advisors (with personas)
3. **Features Grid** — Student roster, AI chat, intervention plans, parent summaries, export
4. **Demo Video / Screenshot** (placeholder until recorded)

---

## 🗂️ New Page / Route Map

| Route | Page |
|---|---|
| `/` | Landing page (revamped) |
| `/signup` | Sign up / onboarding |
| `/signin` | Sign in |
| `/dashboard` | Chat interface (student-first) |
| `/dashboard/students` | **NEW** — Student roster table |
| `/dashboard/students/[id]` | **NEW** — Individual student profile + analysis history |
| `/dashboard/overview` | Class-wide analytics (real data) |
| `/dashboard/settings` | Profile, API key, data management |

---

## 🔁 User Flow (Intended Journey)

```
Landing → Sign Up → Dashboard
                        ↓
              /dashboard/students  ← START HERE
                Add students manually or import CSV
                        ↓
              Click "Analyze" on any student
                        ↓
              /dashboard (chat)
              Student profile auto-loaded as context
                        ↓
              Click "Run Risk Assessment"
                        ↓
              AI returns structured result:
              • Risk Score + Category
              • Contributing Factors
              • Plain Language Summary
              • Intervention Plan
              • Parent Letter (optional)
                        ↓
              Risk score saved back to student profile
                        ↓
              /dashboard/overview shows class-wide picture
```

---

## ✅ Strong Features Summary

| Feature | Status | Notes |
|---|---|---|
| Student Roster Table | 🆕 New | Sortable, filterable, color-coded risk badges |
| CSV Import | 🆕 New | Paste/upload attendance export from school LMS |
| Student Profile Cards | 🆕 New | Shown in chat; full data visible before analysis |
| RAG Context Injection | 🆕 New | Student data auto-appended to every AI prompt |
| OpenAI (gpt-4o-mini) | 🔄 Switch | JSON mode — no more parse failures |
| One-Click Assessment | 🔄 Improved | Button on student row → instant analysis |
| At-Risk Roster | 🔄 Improved | Real flags from roster, not just analyses |
| Intervention Plans | ✅ Keep | Already works; now grounded in student data |
| Parent Letter Generator | ✅ Keep | Useful — keep + improve formatting |
| Scenario Simulator | ✅ Keep | "What if attendance improves to 85%?" |
| Export Analyses JSON | ✅ Keep | In settings |
| Chat History | ✅ Keep | Sidebar sessions persist |

---

## 🛠️ Implementation Order

1. **Switch to OpenAI** — update `src/lib/ai.ts`, update `analyze/route.ts` and `intervention/route.ts`
2. **Student Store** — `src/lib/studentStore.ts` with CRUD
3. **Students Table Page** — `/dashboard/students` with add/edit form
4. **Student Profile in Chat** — student picker + RAG context injection in prompts
5. **Save risk score back to student** — after analysis, update `lastRiskScore` on the student record
6. **Overview revamp** — derive real stats from student roster
7. **Landing page refresh** — rewrite copy, remove fake stats, update onboarding steps

---

## 🔑 Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...          # Required — OpenAI API key
```

---

## 📝 Notes

- All data remains in **localStorage** for now (no backend required for hackathon)
- The student model is designed to be **directly serializable** for future PostgreSQL migration
- RAG context is string-injected (no vector DB needed at this scale)
- Target: < 200 students per educator session (localStorage is sufficient)
