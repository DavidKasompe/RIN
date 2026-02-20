# RIN Platform — Integration Research & Expansion Roadmap

> **Document purpose:** A comprehensive research paper and product vision outlining what RIN *is*, what educators *actually want*, and a full roadmap of integrations and features to build the best student early-warning platform ever shipped.

---

## Table of Contents

1. [What We've Built So Far](#1-what-weve-built-so-far)
2. [What Educators Actually Want — Market Research](#2-what-educators-actually-want--market-research)
3. [Integration Roadmap](#3-integration-roadmap)
   - [3.1 Google Calendar Sync](#31-google-calendar-sync)
   - [3.2 Parent Notification System (Email + SMS)](#32-parent-notification-system-email--sms)
   - [3.3 Notion Integration](#33-notion-integration)
   - [3.4 Google Classroom / LMS Sync](#34-google-classroom--lms-sync)
   - [3.5 Student Results Viewer](#35-student-results-viewer)
   - [3.6 Twilio SMS Alerts](#36-twilio-sms-alerts)
4. [AI Agent Expansion](#4-ai-agent-expansion)
   - [4.1 Mastra Agent Tools to Build](#41-mastra-agent-tools-to-build)
   - [4.2 Autonomous Workflow Engine](#42-autonomous-workflow-engine)
5. [New Pages & Features to Build](#5-new-pages--features-to-build)
6. [Database Schema Expansions Needed](#6-database-schema-expansions-needed)
7. [Tech Choices & APIs](#7-tech-choices--apis)
8. [Compliance & Privacy](#8-compliance--privacy)
9. [Priority Build Order](#9-priority-build-order)

---

## 1. What We've Built So Far

| Layer | What Exists |
|---|---|
| **Auth** | Better Auth — login/register/session |
| **Database** | Neon PostgreSQL + Drizzle ORM — students, attendance, events, academic records |
| **AI Chat** | Thesys C1 (`/api/chat`) — streaming generative UI chat for risk analysis |
| **AI Analysis** | OpenAI `gpt-4o-mini` (`/api/analyze`) — structured dropout risk scoring |
| **Mastra Agent** | `rin-agent.ts` — RIN AI agent skeleton running on Mastra framework |
| **Dashboard Pages** | Overview · Students · Student Detail · Calendar · Workflows · Settings |
| **Export** | Artifact PDF/PPTX export via Thesys C1 artifact API |

**What we're missing that every serious platform has:** calendar sync, parent comms, grade/results import, LMS bridge, automated alert workflows, and report generation.

---

## 2. What Educators Actually Want — Market Research

Based on analysis of leading EdTech platforms (Classter, eduCLIMBER, openSIS, SchoolInsight, Illuminate, SEAtS Software, ClassDojo, PowerSchool) and 2024 educator surveys, K-12 educators consistently want:

### 🔴 Tier 1 — "We won't use the platform without this"
- **Real-time attendance tracking** with automatic absence notifications to parents
- **Grade/result import** from their gradebook — they won't retype data into another system
- **Parent communication** — email (and SMS for urgent alerts) tied to student events
- **Single sign-on** — Google Workspace or Microsoft SSO, not another password
- **Early warning triggers** — automated alerts when a student crosses a risk threshold

### 🟡 Tier 2 — "This would make us loyal users"
- **Calendar sync** — their intervention meetings and events sync both ways with Google Calendar
- **Intervention tracking** — log what action was taken, by whom, on what date, and was it effective
- **Student result trend viewer** — see a student's grade trajectory over time (not just snapshots)
- **Exportable reports** — one-click professional PDF reports for parent-teacher conferences
- **Caseload management** — a counselor's personal list of students they're monitoring
- **Notes & annotations** — per-student case notes with timestamps

### 🟢 Tier 3 — "Wow factor — would genuinely excite us"
- **AI-generated parent letters** — draft a parent-facing letter customized to the student's situation
- **Scenario simulation** — "What if this student improves attendance by 10%?" risk trajectory
- **Notion sync** — push student reports/plans to the school's Notion workspace
- **Voice briefing** — "Good morning, here are your 3 highest-risk students today" (text-to-speech)
- **Predictive cohort analysis** — which whole class groups are trending toward risk?
- **PLC (Professional Learning Community) support** — share anonymized patterns across teacher teams

### Competitive Landscape

| Platform | Strength | Gap we fill |
|---|---|---|
| **Google Classroom** | Assignment/grade workflow | Zero risk intelligence |
| **PowerSchool** | Deep SIS, attendance | No AI, clunky UX, expensive |
| **eduCLIMBER** | Early warning triggers | No AI chat, no generative UI |
| **ClassDojo** | Parent comms | K-5 focused, no analytics engine |
| **Illuminate** | Analytics dashboards | No conversational AI layer |
| **RIN** | **AI chat + risk scoring + visual reports** | Missing comms, calendar, grade import |

---

## 3. Integration Roadmap

---

### 3.1 Google Calendar Sync

**Why:** Educators live in Google Calendar. Intervention meetings, parent calls, IEP dates, and school events need to flow both directions — what we create in RIN should appear on the teacher's calendar, and school events on their calendar should appear in RIN.

**How it works (technical):**

```
Teacher OAuth2 → Google Account → googleapis calendar.events.list/insert
                                              ↕
                                    RIN events table (Neon DB)
                                              ↕
                                    RIN Calendar page (bi-directional sync)
```

**Implementation Plan:**
1. Add `google-auth-library` + `googleapis` — `npm install googleapis`
2. Add OAuth2 scopes to Better Auth Google provider:
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/calendar.readonly`
3. Store `access_token` + `refresh_token` in the `accounts` table (Better Auth already has this structure)
4. New API routes:
   - `POST /api/calendar/sync` — pull events from Google → RIN
   - `POST /api/calendar/push` — push RIN events → Google Calendar
   - `DELETE /api/calendar/event/[id]` — delete from both sides
5. New env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Schema addition:**
```sql
-- Add google_event_id to events table for bidirectional tracking
ALTER TABLE events ADD COLUMN google_event_id TEXT;
ALTER TABLE events ADD COLUMN synced_at TIMESTAMP;
```

**Key considerations:**
- Use **service account** for school-wide calendars (master schedule)
- Use **OAuth2 per teacher** for personal calendar sync
- Implement **webhook** via `google.calendar.events.watch()` to receive real-time push notifications when external events change

---

### 3.2 Parent Notification System (Email + SMS)

**Why:** The #1 feature requested by school administrators. When a student crosses a risk threshold, parents need to know. Manually emailing parents doesn't scale. This needs to be automated AND auditable (schools need a record of all parent communications for compliance).

**Email → Resend API**

Resend is the modern, developer-first transactional email API. Free tier includes 3,000 emails/month which covers most school cohorts.

```bash
npm install resend react-email
```

**What to build:**
- `src/lib/email.ts` — Resend client singleton
- `src/emails/ParentAlert.tsx` — React Email template for risk alerts
- `src/emails/WeeklyReport.tsx` — React Email template for weekly student summary
- `src/emails/InterventionLog.tsx` — email copy of what was logged in RIN
- `POST /api/notify/parent` — trigger individual parent email
- `POST /api/notify/batch` — send weekly digest to all parents with at-risk children

**Email types to implement:**

| Email Type | Trigger | Recipient |
|---|---|---|
| **Risk Alert** | Student risk score crosses threshold (e.g. ≥70%) | Parent/Guardian |
| **Absence Alert** | 3+ consecutive unexcused absences logged | Parent/Guardian |
| **Weekly Summary** | Every Friday, cron job | All enrolled parents |
| **Intervention Notice** | Counselor logs an intervention | Parent/Guardian + copy to teacher |
| **Progress Update** | Student risk improves significantly | Parent/Guardian (positive news!) |
| **Calendar Reminder** | 24h before intervention meeting | Teacher + Parent |

**SMS → Twilio (for urgent alerts only)**

Email has low open rates for urgent situations. SMS open rate is 98% within 3 minutes.

```bash
npm install twilio
```

- Store parent phone numbers in the `parents` table (new schema)
- Only send SMS for: attendance alerts, high-risk escalations (risk > 85%), day-of meeting reminders
- Use Twilio Messaging Service for compliance (STOP/HELP handling built in)

**New environment variables:**
```
RESEND_API_KEY=re_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

---

### 3.3 Notion Integration

**Why:** Many educators and school counselors already use Notion as their personal knowledge base. They want to push student case notes, intervention plans, and meeting summaries from RIN into their Notion workspace automatically after the AI generates them.

**Technical approach:**
- `@notionhq/client` — official Notion SDK
- Educator connects their Notion via an integration token stored in their settings
- Notion database structure we create:
  - **Student Profiles DB** — one row per student, linked to all activity
  - **Intervention Log DB** — each intervention as a Notion page with rich text
  - **Weekly Reports DB** — AI-generated weekly summary pushed as a Notion page

**What we push to Notion:**
- After every intervention logged in RIN → create a Notion page in the educator's Intervention Log DB
- After AI generates a student report → push it as a formatted Notion page
- Before a parent meeting → create a Notion agenda page pre-populated by AI

**Implementation:**
```bash
npm install @notionhq/client
```

New route: `POST /api/integrations/notion/push` — takes a student ID + content type, creates the Notion page

New settings section: **Integrations** tab in Settings with:
- Notion API token input
- Notion database picker (fetch their databases via API)
- Toggle: "Auto-push interventions to Notion" Y/N

---

### 3.4 Google Classroom / LMS Sync

**Why:** Educators don't want to manually enter grades into RIN. Their grades live in Google Classroom or Canvas. We need to pull grade data automatically so our risk model runs on real, up-to-date academic data.

**Google Classroom API:**
```bash
npm install googleapis  # already installed for Calendar
```

Scopes needed:
- `https://www.googleapis.com/auth/classroom.courses.readonly`
- `https://www.googleapis.com/auth/classroom.coursework.students.readonly`
- `https://www.googleapis.com/auth/classroom.rosters.readonly`

**What to pull:**
- Course list → match to RIN's class/cohort structure
- Student roster → match students by email to RIN students
- Assignment submissions → calculate completion rate (missing assignments = risk factor)
- Grade data → sync to `academic_records` table in Neon

**Moodle LMS API:**
- REST API via `core_webservice_*` and `tool_mobile_*` functions
- Auth via Moodle Web Services Token (generated per user/admin)
- Pull: course enrollments, gradebook grades, assignment completions, and user activity logs

**Sync frequency:**
- **Nightly cron** at 2am for grade pulls (low urgency, high data volume)
- **Immediate sync** when counselor clicks "Refresh student data" on student detail page

**Data transformation pipeline:**
```
Google Classroom Grade → normalize to 0-100 scale → store in academic_records
Missing assignment count → factor into risk model → trigger re-analysis
```

---

### 3.5 Student Results Viewer

**Why:** Educators need to see a student's academic trajectory, not just the current snapshot. A student with a 2.1 GPA but trending upward is VERY different from a student with a 2.1 GPA trending downward.

**What to build:**

**A. Grade Trend Chart (per subject)**
- Line chart: GPA over time by semester/term
- Subject-level breakdown (Math vs. English vs. Science)
- Color bands: green (on track) / amber (watch) / red (at-risk)

**B. Assignment Completion Heatmap**
- GitHub-style contribution heatmap of assignment submissions
- Cells = individual assignments, color = grade/completion status
- Immediately shows streaks of missing work

**C. Comparative Analytics**
- "This student's attendance rank vs. class average"
- "This student's GPA percentile in their grade cohort"
- Anonymous — show distribution, not individual peers' names (FERPA compliance)

**D. Predictive Trend Line**
- Extend the AI's risk assessment: "Based on current trajectory, predicted GPA at end of semester: 1.6"
- Confidence interval bands on the projection line

**New page:** `/dashboard/students/[id]/results` — dedicated results/academic view, linked from student detail

---

### 3.6 Twilio SMS Alerts

See §3.2 — SMS is covered in the parent notification section. Additional use case: **two-way SMS** for parent confirmation:

```
RIN → Parent: "Jordan's attendance has dropped to 62%. Reply YES to confirm receipt 
               or CALL to request a callback."
Parent → RIN (Twilio webhook): stores the reply in the communication_log table
```

This creates an **audit trail** of parent contact — legally required in many school districts.

---

### 3.7 Team & School Procurement Model (Pricing Strategy)

**Why:** To maximize adoption, RIN is moving away from per-seat (per-teacher) pricing toward a flat **"Per-School" Team model** ($249/school/mo), with a frictionless 7-day free trial.

**How this impacts the product roadmap:**
1. **Self-Serve Onboarding:** Any individual educator can start a 7-day free trial (no credit card required) and immediately see value.
2. **Viral Internal Expansion:** "Team" features must be front-and-center. Once a teacher sees value, they must be able to invite their principal or grade-level team with one click.
3. **Shared Caseloads (RBAC):** We need Role-Based Access Control allowing:
   * **Administrators** to see school-wide analytics and manage billing.
   * **Counselors/Teachers** to share specific student data with each other (e.g., the 9th-grade intervention team).
4. **Data Portability Strategy:** During the 7-day trial, the goal is for educators to upload 10-20 "at-risk" students via CSV. If they churn, they keep their exported PDFs. If they stay, they convert to the $249/mo flat fee and invite the rest of the school staff for free.

By making the software $249 *flat* per school for unlimited educators, we remove the friction of per-seat budget approvals, allowing schools to scale usage overnight.

---

## 4. AI Agent Expansion

Our Mastra-based `rin-agent.ts` is currently a skeleton. Here's how to make it genuinely intelligent with **tool use** via OpenAI function calling.

---

### 4.1 Mastra Agent Tools to Build

Each tool is a function the AI agent can call autonomously based on the conversation.

#### Tool 1: `getStudentProfile`
```typescript
// Agent calls this when asked about a specific student
{
  name: 'getStudentProfile',
  description: 'Fetch full student data including attendance, GPA, behavior, and risk score',
  parameters: { studentId: string }
  // Calls our DB → returns structured student object
}
```

#### Tool 2: `calculateRiskScore`
```typescript
// Agent re-calculates risk on demand with fresh data
{
  name: 'calculateRiskScore',
  description: 'Run the dropout risk model for a student with current data',
  parameters: { studentId: string, includeFactors: boolean }
  // Returns: score, confidence, top 3 risk factors
}
```

#### Tool 3: `draftParentLetter`
```typescript
// Agent generates a professional parent-facing letter
{
  name: 'draftParentLetter',
  description: 'Generate a professional parent notification letter for a student',
  parameters: { 
    studentId: string, 
    tone: 'urgent' | 'informational' | 'positive',
    includeMeetingRequest: boolean
  }
  // Returns: formatted letter text ready for email
}
```

#### Tool 4: `logIntervention`
```typescript
// Agent logs a counselor action to the DB
{
  name: 'logIntervention',
  description: 'Record an intervention that was performed for a student',
  parameters: {
    studentId: string,
    type: 'meeting' | 'phone_call' | 'email' | 'referral' | 'mentoring',
    notes: string,
    outcome: string
  }
  // Writes to interventions table, timestamps, returns confirmation
}
```

#### Tool 5: `getClassCohortRisk`
```typescript
// Agent analyzes entire classroom or grade level
{
  name: 'getClassCohortRisk',
  description: 'Analyze dropout risk patterns across a class or grade cohort',
  parameters: { gradeLevel?: number, teacherId?: string, classId?: string }
  // Returns: count at each risk tier, top 5 at-risk students (anonymizable)
}
```

#### Tool 6: `scheduleIntervention`
```typescript
// Agent creates a calendar event for an intervention meeting
{
  name: 'scheduleIntervention',
  description: 'Schedule a parent-teacher intervention meeting and create calendar event',
  parameters: {
    studentId: string,
    proposedDate: string,
    attendees: string[], // email addresses
    pushToGoogle: boolean
  }
  // Creates event in DB + optionally pushes to Google Calendar
}
```

#### Tool 7: `sendParentNotification`
```typescript
// Agent sends email/SMS to parent on behalf of counselor
{
  name: 'sendParentNotification',  
  description: 'Send a notification email or SMS to a student\'s parent',
  parameters: {
    studentId: string,
    channel: 'email' | 'sms',
    subject: string,
    body: string,
    urgent: boolean
  }
  // Calls Resend + Twilio, logs to communication_log
}
```

#### Tool 8: `runScenarioSimulation`
```typescript
// Agent runs what-if projections
{
  name: 'runScenarioSimulation',
  description: 'Simulate how a student\'s risk score would change under different conditions',
  parameters: {
    studentId: string,
    scenarios: Array<{ factor: string, change: number }>
    // e.g. [{ factor: 'attendance', change: +15 }, { factor: 'gpa', change: +0.3 }]
  }
  // Returns: current risk, projected risk per scenario, delta explanation
}
```

#### Tool 9: `queryStudentDatabase`
```typescript
// Agent answers natural-language questions about the student body
{
  name: 'queryStudentDatabase',
  description: 'Query the student database with natural language filters',
  parameters: {
    filter: string  // e.g. "students with attendance below 70% and GPA below 2.0"
  }
  // Translates to SQL via AI, executes safely, returns results
}
```

#### Tool 10: `generateWeeklyReport`
```typescript
// Agent generates the school's weekly risk digest
{
  name: 'generateWeeklyReport',
  description: 'Generate a weekly risk report for the entire school or a counselor\'s caseload',
  parameters: {
    scope: 'school' | 'caseload',
    counselorId?: string,
    format: 'email' | 'pdf' | 'notion'
  }
  // Returns structured report + can trigger email/PDF generation
}
```

---

### 4.2 Autonomous Workflow Engine

The **Workflows** page currently shows static workflow cards. Turn it into a real rule engine:

**Workflow structure:**
```
IF [trigger condition] THEN [action] EVERY [frequency]
```

**Example workflows educators can create:**

| Trigger | Action | Frequency |
|---|---|---|
| Student attendance < 70% | Send parent email alert | Daily |
| Risk score crosses 75% | Notify assigned counselor | Immediately |
| Student misses 3 consecutive days | Create calendar intervention event | Immediately |
| GPA drops > 0.5 points in one week | Flag for counselor review | Weekly |
| No interventions logged in 14 days for high-risk student | Remind counselor | Weekly |
| Student risk drops below 40% (improving) | Send positive parent email | Weekly |

**Implementation:** Use Mastra's workflow system or build a simple rule evaluator:
- `workflows` table in DB: stores the rule config as JSON
- Neon scheduled functions or Vercel Cron jobs run the rule engine nightly
- When triggered, calls the appropriate Mastra agent tool

---

## 5. New Pages & Features to Build

### Dashboard Pages Needed

| Page | Priority | Description |
|---|---|---|
| `/dashboard/students/[id]/results` | 🔴 High | Grade trends, assignment heatmap, subject breakdown, predictive trend line |
| `/dashboard/students/[id]/communications` | 🔴 High | Full log of every parent email/SMS sent, with timestamps and replies |
| `/dashboard/students/[id]/interventions` | 🔴 High | Chronological intervention log with outcome tracking |
| `/dashboard/parents` | 🟡 Medium | Parent directory — contact info, preferred language, last contacted date |
| `/dashboard/reports` | 🟡 Medium | Saved AI-generated reports, PDF exports, shareable links |
| `/dashboard/cohorts` | 🟡 Medium | Class/grade-level analytics — identify at-risk clusters |
| `/dashboard/integrations` | 🟡 Medium | Connect Google, Notion, Canvas — integration management UI |
| `/dashboard/caseload` | 🟢 Nice | Counselor's personal watchlist of assigned students |
| `/dashboard/analytics` | 🟢 Nice | School-wide dashboards — risk distribution, trend over time |

### Student Detail Page Expansions

The current `/dashboard/students/[id]` page needs:
- **Tab system** — Overview · Academic · Attendance · Interventions · Communications · Notes
- **Risk history chart** — how has the student's risk score changed over time?
- **"Quick Actions" bar** — Email parent / Log intervention / Schedule meeting / Generate report (all callable by AI agent tools)
- **Case notes panel** — rich text notes with timestamp, author, visibility (private/shared)
- **Flags & tags** — "IEP", "ELL", "504 Plan", "Food Insecure" — context the AI should factor in

---

## 6. Database Schema Expansions Needed

```sql
-- Parents / Guardians
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,  -- E.164 format for Twilio
  preferred_channel TEXT DEFAULT 'email',  -- 'email' | 'sms'
  preferred_language TEXT DEFAULT 'en',
  relationship TEXT  -- 'mother' | 'father' | 'guardian' | 'other'
);

-- Communication Log (every email/SMS sent)
CREATE TABLE communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  parent_id UUID REFERENCES parents(id),
  channel TEXT NOT NULL,  -- 'email' | 'sms'
  direction TEXT NOT NULL,  -- 'outbound' | 'inbound'
  subject TEXT,
  body TEXT NOT NULL,
  external_id TEXT,  -- Resend message ID or Twilio SID
  status TEXT DEFAULT 'sent',  -- 'sent' | 'delivered' | 'failed' | 'replied'
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_by UUID REFERENCES user(id)
);

-- Interventions
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  counselor_id UUID REFERENCES user(id),
  type TEXT NOT NULL,  -- 'meeting' | 'phone_call' | 'email' | 'referral' | 'mentoring'
  date DATE NOT NULL,
  notes TEXT,
  outcome TEXT,  -- 'positive' | 'neutral' | 'escalated' | 'pending'
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Risk Score History (track changes over time)
CREATE TABLE risk_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  factors JSONB,  -- top 3 contributing factors at this point in time
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Workflows (rule engine)
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES user(id),
  trigger_config JSONB NOT NULL,  -- { field, operator, value }
  action_config JSONB NOT NULL,   -- { type, params }
  frequency TEXT,  -- 'immediate' | 'daily' | 'weekly'
  active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMP,
  run_count INTEGER DEFAULT 0
);

-- Google Calendar sync tracking
ALTER TABLE events ADD COLUMN google_event_id TEXT;
ALTER TABLE events ADD COLUMN sync_source TEXT DEFAULT 'rin';  -- 'rin' | 'google'

-- Case notes
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  author_id UUID REFERENCES user(id),
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'private',  -- 'private' | 'team' | 'school'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Integration credentials (per user)
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id),
  provider TEXT NOT NULL,  -- 'google_calendar' | 'notion' | 'canvas' | 'classroom'
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  config JSONB,  -- provider-specific config (e.g. notion DB IDs)
  active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Tech Choices & APIs

| Integration | Package | Notes |
|---|---|---|
| **Google Calendar** | `googleapis` | OAuth2 + Service Account |
| **Google Classroom** | `googleapis` | Same Google OAuth2 client |
| **Email (Transactional)** | `resend` + `react-email` | 3k free/month, React template system |
| **SMS** | `twilio` | Messaging Service for compliance |
| **Notion** | `@notionhq/client` | Official SDK |
| **Canvas LMS** | REST API (fetch) | School provides API token |
| **Cron Jobs** | Vercel Cron + Neon Functions | For workflow engine + nightly sync |
| **PDF Reports** | Thesys C1 artifact API (already built) | Or `@react-pdf/renderer` for custom |
| **Charts** | `recharts` or `victory` | Grade trends, cohort distribution |
| **Rich Text Notes** | `@tiptap/react` (already in genui-sdk) | Case notes editor |

---

## 8. Compliance & Privacy

Every feature we build must comply with:

### FERPA (Family Educational Rights and Privacy Act)
- Student data can ONLY be shared with: the student, their parents (if minor), school officials with legitimate educational interest
- Parent must opt-in to receive digital communications
- All communications must be logged and auditable
- **Implementation:** `communication_log` table captures everything; never share student PII in external systems without explicit consent

### COPPA (Children's Online Privacy Protection Act)
- Students under 13: parents must consent before we collect any data
- No behavioral advertising using student data
- **Implementation:** Add `parental_consent` field to students table; gate all AI features behind consent check

### Data minimization
- Only collect what we need for the risk model
- Audit fields: who accessed student data, when, and why

### Notification opt-out
- Every email must include unsubscribe link (Resend handles this)
- Every SMS must handle STOP keyword (Twilio handles this)
- Store opt-out state in `parents` table

---

## 9. Priority Build Order

### Phase 1 — Core Communication (Build Next, ~2 weeks)
1. ✅ `parents` table + schema migration
2. ✅ `communication_log` table + schema migration
3. ✅ `interventions` table + schema migration
4. ✅ Resend integration — `src/lib/email.ts` + email templates
5. ✅ Parent directory page (`/dashboard/parents`)
6. ✅ "Email Parent" button on student detail → calls `/api/notify/parent`
7. ✅ Intervention log page + form on student detail

### Phase 2 — Google Calendar Sync (~1 week)
1. ✅ Add Google Calendar scopes to Better Auth
2. ✅ `googleapis` calendar sync routes
3. ✅ Calendar page shows Google events + RIN events unified
4. ✅ Create intervention meeting → push to Google Calendar

### Phase 3 — Academic Results & Grade Import (~1.5 weeks)
1. ✅ `risk_history` table for trend tracking
2. ✅ Student results tab with trend charts (`recharts`)
3. ✅ Google Classroom grade pull route + nightly cron
4. ✅ Assignment completion heatmap component
5. ✅ Predictive trend line on results page

### Phase 4 — AI Agent Tools (~1 week)
1. ✅ Wire Mastra agent with all 10 tools (§4.1)
2. ✅ Test tool calling in the C1Chat interface
3. ✅ Autonomous workflow engine — rule trigger → Mastra tool call

### Phase 5 — Notion + Advanced Features (~1 week)
1. ✅ Notion integration settings + token storage
2. ✅ Push intervention plans to Notion
3. ✅ School analytics / cohort page

### Phase 6 — SMS + Polish (~3 days)
1. ✅ Twilio integration for urgent alerts
2. ✅ Two-way SMS webhook + replies logged
3. ✅ Weekly digest cron email
4. ✅ Caseload management page

---

> **Total estimated scope:** ~6–8 weeks of focused development to go from current state to a genuinely production-ready platform that would stand up next to PowerSchool or Illuminate in a school procurement review.

> **What makes RIN different:** Every competitor listed above has dashboards and data. *None of them* have a conversational AI that can take action — draft letters, log interventions, schedule meetings, run simulations — all in natural language. That's our moat. Build the integrations. Let the AI drive them.
