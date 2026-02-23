# AI Expansion & Dashboard Intelligence (Assigned to: David)

Based on the [integration roadmap](../integrations.md) and our vision to make the dashboard significantly smarter across every screen, please implement the following AI features and UI enhancements.

## 1. AI Chat File Attachments & Transcript Analysis

The chat interface currently supports text prompts, but educators need to be able to upload raw files (e.g., transcripts, disciplinary reports) for real-time analysis by the AI.

**Requirements:**
- Enable a "file attachment" button (paperclip icon) in the C1 Chat input box.
- Support uploading PDFs, DOCX, and TXT files.
- The AI should securely read and parse these attached documents within the context of the active chat conversation.
- This allows basic, real-time file analysis for "anything really" (e.g., "Summarize the key issues in this attached transcript for Jordan").

## 2. Student Detail Document/Transcript Management

Similar to how the Overview page has an Artifacts Drawer for generated reports, individual student profiles need a place to manage uploaded documents.

**Requirements:**
- Create a document management view (either a tab or a drawer) within the Student Detail page (`/dashboard/students/[id]`).
- Educators should be able to upload historical transcripts, IEPs, or other relevant records directly to a student's profile.
- The AI agent should be "helped" by these uploaded files during real-time student tracking and analysis (e.g., the RAG pipeline should incorporate these documents when the AI is asked to "Calculate risk score" or "Draft a parent letter").

## 3. Deep-Linking: Overview Alerts to Contextual AI Chat

The Overview page highlights "flagged" or "at-risk" students. Currently, clicking "Analyze" or acting on a flagged student requires navigating to the chat and manually typing a prompt. We need to streamline this.

**Requirements:**
- Implement simple action buttons (e.g., "Analyze") on the Overview page next to flagged students.
- When an educator clicks "Analyze" for a specific student, they should be immediately redirected to the Chat interface.
- Crucially, the chat input should be **pre-populated** with the correct, contextualized prompt (e.g., "Analyze the recent drop in attendance for Sarah Jenkins and suggest an intervention plan"), and the chat should ideally **start automatically** or be ready for immediate submission.
- Ensure this seamless pattern (UI Action -> Context-Aware Chat Prompt) is applied consistently, not just on the Overview page, but also from the main Students list where applicable.


---- CREATE TOOLS FOR THE AGENT THAT WILL BE ABLE TO EXTRACT Transcripts and basically achieving a living and breathing platform, review integrations.md in the troot to understand this moore:

- **Early warning triggers** — automated alerts when a student crosses a risk threshold

- **Intervention tracking** — log what action was taken, by whom, on what date, and was it effective
- **Student result trend viewer** — see a student's grade trajectory over time (not just snapshots)
- **Notes & annotations** — per-student case notes with timestamps, update student view to include way to add complains, comments, keyword on behavior etc

- **Scenario simulation** — "What if this student improves attendance by 10%?" risk trajectory
- **Predictive cohort analysis** — which whole class groups are trending toward risk?


--- so create breakdown tasks for me so that this makes a bit more sense we break it down and finish this