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


## 4. Advanced AI Agent Analytics & Tracking

To make the platform a "living and breathing" system, the AI needs tools to actively track, simulate, and predict student outcomes.

**Requirements:**
- **Early warning triggers**: The AI should be able to scan real-time data and flag students crossing risk thresholds automatically.
- **Intervention tracking**: Create tools for the AI to log actions taken, by whom, and monitor the effectiveness of these interventions over time.
- **Student result trend viewer**: Enable the AI to analyze and visualize a student's grade trajectory, not just static snapshots.
- **Notes & Annotations**: Update the student view to allow educators to add complaints, comments, or behavioral keywords. Ensure the AI indexes and factors these into its risk analysis.
- **Scenario simulation**: Implement a tool allowing the AI to answer "What if?" questions (e.g., "What if attendance improves by 10%?").
- **Predictive cohort analysis**: Create tools for the AI to identify which entire class groups or cohorts are trending toward risk.