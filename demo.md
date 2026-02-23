# 🎓 RIN: The AI-Powered School Intelligence Platform - Demo Script

Welcome to the demo of RIN! This guide is designed to showcase the platform's ability to transform school data into actionable student interventions.

## 🏫 Scenario Context
*   **School:** "Evergreen Academy" (A high-need vocational high school)
*   **Demo Persona:** Ms. Rivera, the Lead Counselor
*   **Key Challenge:** Grade drops and attendance dips following the mid-term break.

---

## 🛠️ Step 1: Data Setup (The Foundation)
To make RIN feel alive, upload the CSVs and PDFs generated for Evergreen Academy.

1.  **Import Student Roster**: Go to **Students** and upload your `students.csv`.
2.  **Add Transcripts**: Attach the `transcripts.pdf` to students like "Jordan Smith" or "Sarah Jenkins" via the Student Detail Drawer.
3.  **Ensure Env Keys**: Verify `RESEND_API_KEY` and `TWILIO_ACCOUNT_SID` are set in `.env` so notifications actually fire.

---

## 💬 Step 2: The "Magic" AI Chat
*Ms. Rivera starts her day by asking RIN for a pulse check.*

1.  **Context-Aware Query**:
    > *"Which students in Grade 11 have had the biggest attendance drop this month?"*
    *   **Watch for**: RIN calling `getStudentProfile` and `searchStudentNotes` to explain the "Why".
2.  **Qualitative Analysis**:
    > *"Summarize the recent counseling notes for Sarah Jenkins. Is there a pattern?"*
    *   **Watch for**: RIN extracting themes from PDF transcripts and IEP notes.
3.  **Generative UI**:
    > *"Create a risk assessment report for Sarah and set up a slide deck for our meeting with her parents at 4 PM."*
    *   **Watch for**: RIN generating a PDF report and a Slide presentation instantly in the artifacts drawer.

---

## ⚡ Step 3: Visual Workflow Builder
*Ms. Rivera wants to automate the outreach for attendance issues.*

1.  **The Magic Prompt**:
    *   Go to **Workflows**.
    *   In the Magic Prompt bar, type: *"Send an SMS and Email to the parents if a student misses 3 consecutive days of school. Also, add a private note to their profile."*
    *   **Watch for**: The canvas instantly populating with a **Trigger**, **SMS Action**, **Email Action**, and **Add Note Action**.
2.  **The Refinement**:
    *   Click the **SMS** node. Show how easy it is to customize the message: *"Hi {{parentName}}, this is Ms. Rivera. We missed {{studentName}} in class today..."*
3.  **Manual Activation**:
    *   Toggle the workflow to **Active**.

---

## 🔔 Step 4: Smart Notifications
*Showcase the automated "Data Watcher".*

1.  **Simulated Trigger**:
    *   (Internal) Trigger the `/api/cron/workflow-check` endpoint.
2.  **The Result**:
    *   Show the **Workflows > History** tab showing a successful run.
    *   Check the **Student Notes** in a profile to see the automated entry: `[Automated Workflow: Low Attendance Alert] Sent notification to parent.`

---

## 🎁 The "Mic Drop" Moment
Ask the AI:
> *"RIN, what should I focus on first for tomorrow's faculty meeting?"*

RIN will synthesize the risk data, the scheduled parent meetings, and the active automations into a prioritized "To-Do" list for Ms. Rivera.

---

### Demo Tips:
- **Use "Analyze" Buttons**: Click the "Analyze" button next to any flagged student on the Overview page to see RIN deep-dive into that specific student in chat.
- **Glassmorphism**: Point out the premium UI—the shimmer loaders, the slide-out drawers, and the dark-mode aesthetic.
