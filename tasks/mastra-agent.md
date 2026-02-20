# Mastra Agent Buildout: Backend & UI Integration
**Assignee:** David

## Objective
Enhance the current `rinAgent` (Mastra) to be fully agentic by equipping it with tools to query the database, perform Retrieval-Augmented Generation (RAG) on student records/documents, and seamlessly tie its context into our chat interface. The goal is for the agent to have full lifecycle context of the data across all screens.

## Phase 1: Database Tools Integration
The agent needs read access to our core tables (Students, Assessments, Interventions, Attendance, etc.) via Drizzle ORM to answer queries accurately without hallucinating.

- [ ] **Create Student Query Tool**:
  - Build a Mastra Tool (e.g., `getStudentProfileTool`) that takes a `studentId` or name and returns full demographic, attendance, and risk score data.
- [ ] **Create Academic/Assessment Tools**:
  - Build a tool to fetch GPA, standardized test scores, and recent grades (`getStudentAcademicsTool`).
- [ ] **Create Intervention Tools**:
  - Build a tool to fetch a student's intervention history and current active plans.
- [ ] **Register Tools**:
  - Add all created tools to the `rinAgent` configuration in `src/mastra/agents/rin-agent.ts`.

## Phase 2: RAG Pipeline Setup
To provide deep qualitative context (e.g., counselor notes, IEP documents, disciplinary reports), we need a RAG implementation.

- [ ] **Embeddings Generation**:
  - Set up an ingestion pipeline (or use Mastra's built-in RAG/vector capabilities if available, or a solution like Pinecone/pgvector) to chunk and embed unstructured student notes.
- [ ] **Create RAG Search Tool**:
  - Build a `searchStudentNotesTool` that takes a semantic query (e.g., "Why has Jimmy's attendance dropped?") and retrieves relevant embedded qualitative records.
- [ ] **Context Injection**:
  - Ensure the RAG tool results are piped cleanly back into the agent's context window.

## Phase 3: Chat Interface Integration
The frontend chat (`src/app/dashboard/page.tsx`) needs to pass screen-specific context to the agent so it knows what the user is currently looking at.

- [ ] **Global Context State**:
  - Implement a mechanism (Zustand or Context API) to track the user's "current view" (e.g., viewing a specific student's profile, a roster, or the settings page).
- [ ] **API Route Update**:
  - Update the `/api/chat` route to accept `currentViewContext` along with the standard messages array.
- [ ] **Prompt Engineering**:
  - Update the `rinAgent` system prompt to dynamically incorporate the user's current context (e.g., "The user is currently viewing the profile of Student: John Doe...").
- [ ] **C1 Component Streaming**:
  - Ensure the Mastra agent's tool-call streaming works flawlessly with the existing `@thesysai/genui-sdk` `C1Component` in the UI, rendering tool execution states (e.g., "Searching database for John Doe...") beautifully in the chat.

## Acceptance Criteria
- [ ] The agent can successfully fetch real data from the database when asked a question like "What is Marcus's current risk score?"
- [ ] The agent can retrieve qualitative notes using RAG when asked subjective questions.
- [ ] The chat interface securely passes the current active student ID to the backend, so the agent understands implicit queries like "Summarize their recent scores."
