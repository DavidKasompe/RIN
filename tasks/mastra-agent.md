# Mastra Agent Buildout: Backend & UI Integration
**Assignee:** David

## Objective
Enhance the current `rinAgent` (Mastra) to be fully agentic by equipping it with tools to query the database, perform Retrieval-Augmented Generation (RAG) on student records/documents, and seamlessly tie its context into our chat interface. The goal is for the agent to have full lifecycle context of the data across all screens.

## Phase 1: Database Tools Integration
The agent needs read access to our core tables (Students, Assessments, Interventions, Attendance, etc.) via Drizzle ORM to answer queries accurately without hallucinating.

- [x] **Create Student Query Tool**:
  - Build a Mastra Tool (e.g., `getStudentProfileTool`) that takes a `studentId` or name and returns full demographic, attendance, and risk score data.
- [x] **Create Academic/Assessment Tools**:
  - Build a tool to fetch GPA, standardized test scores, and recent grades (`getStudentAcademicsTool`).
- [x] **Create Intervention Tools**:
  - Build a tool to fetch a student's intervention history and current active plans.
- [x] **Register Tools**:
  - Add all created tools to the `rinAgent` configuration in `src/mastra/agents/rin-agent.ts`.

## Phase 2: RAG Pipeline Setup
To provide deep qualitative context (e.g., counselor notes, IEP documents, disciplinary reports), we need a RAG implementation.

- [x] **Embeddings Generation**:
  - Set up an ingestion pipeline (or use Mastra's built-in RAG/vector capabilities if available, or a solution like Pinecone/pgvector) to chunk and embed unstructured student notes.
- [x] **Create RAG Search Tool**:
  - Build a `searchStudentNotesTool` that takes a semantic query (e.g., "Why has Jimmy's attendance dropped?") and retrieves relevant embedded qualitative records.
- [x] **Context Injection**:
  - Ensure the RAG tool results are piped cleanly back into the agent's context window.

## Phase 3: Chat Interface Integration
The frontend chat (`src/app/dashboard/page.tsx`) needs to pass screen-specific context to the agent so it knows what the user is currently looking at.

- [x] **Global Context State**:
  - Implement a mechanism (Zustand or Context API) to track the user's "current view" (e.g., viewing a specific student's profile, a roster, or the settings page).
- [x] **API Route Update**:
  - Update the `/api/chat` route to accept `currentViewContext` along with the standard messages array.
- [x] **Prompt Engineering**:
  - Update the `rinAgent` system prompt to dynamically incorporate the user's current context (e.g., "The user is currently viewing the profile of Student: John Doe...").
- [x] **C1 Component Streaming**:
  - Ensure the Mastra agent's tool-call streaming works flawlessly with the existing `@thesysai/genui-sdk` `C1Component` in the UI, rendering tool execution states beautifully in the chat.

## Phase 4: Artifact Persistence & UI Drawer (NEW)
Currently, C1 Artifacts (Reports and Slides) are only available for a one-time local download. We need to persist these so they are accessible across sessions.

- [ ] **Database & Storage Schema**:
  - Create a new Drizzle table `artifacts` (id, title, type: 'pdf'|'pptx', url, userId, createdAt).
  - Provision a Supabase Storage bucket (e.g., `user_artifacts`) to store the generated files.
- [ ] **Update Export Routes**:
  - Update `/api/export-pdf` and `/api/export-pptx` to upload the generated buffer to Supabase Storage before returning it. 
  - Save the resulting public/signed URL to the new `artifacts` database table linked to the current user.
- [ ] **Overview Page Drawer UI**:
  - Create a generic large side-drawer (Sheet component) accessible from the main dashboard/overview page.
  - Implement two tabs inside the Drawer: **Slides** and **Reports**.
  - Fetch the user's saved artifacts from the DB and render them as cards in the respective tabs, allowing the user to click to re-download or preview them.

### Prompts for David (Copy/Paste these into Copilot/AI to speed up development):
**Prompt 1 (Database & Storage)**:
> "Create a new Drizzle schema table called 'artifacts' with fields: id (uuid), title (text), type (text: enum of 'pdf' or 'pptx'), publicUrl (text), userId (reference to users.id), and createdAt. Afterwards, write a helper function `uploadToSupabaseStorage(buffer: Buffer, filename: string)` using the `@supabase/supabase-js` client to upload to a public bucket named 'user_artifacts' and return the public URL."

**Prompt 2 (Export Routes)**:
> "Update the `/api/export-pdf` and `/api/export-pptx` route handlers. After generating the file buffer, call the `uploadToSupabaseStorage` helper. Once uploaded, insert a new record into the `artifacts` Drizzle table with the returned public URL and the current authenticated user's ID. Return the public URL in the JSON response."

**Prompt 3 (Drawer UI)**:
> "Create a new component `ArtifactsDrawer.tsx`. It should use radix-ui/react-dialog or a similar sliding Sheet drawer component. It needs a trigger button 'View Saved Reports'. Inside the drawer, create two tabs: 'Reports' (filters for .pdf) and 'Slides' (filters for .pptx). Fetch the data from the 'artifacts' table and render them as a grid of styled cards. Each card should have the title, date, and a 'Download/Preview' button linking to the publicUrl. Render this drawer on the `/dashboard` overview page."

## Acceptance Criteria
- [x] The agent can successfully fetch real data from the database.
- [x] The agent can retrieve qualitative notes using RAG.
- [x] The chat interface securely passes the current active student context to the backend.
- [ ] **Artifacts generated via AI are instantly saved and appear in the Overview page's "Slides/Reports" Drawer.**
