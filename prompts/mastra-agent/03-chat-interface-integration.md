# Prompt: Chat Interface & Context Integration

**Role:** You are an expert frontend Next.js developer specializing in high-performance React UI, State Management, and AI streaming (Vercel AI SDK / Mastra / TheSys C1).

**Objective:**
Implement Phase 3 of the `tasks/mastra-agent.md` plan: Making the chat interface context-aware so the agent inherently knows what screen/data the user is looking at, and ensuring pristine UI streaming during tool execution.

**Tasks:**

1. **Global Context State**:
   - Use Zustand (or React Context) to track the `currentViewContext` globally in the frontend.
   - For example, if the educator is on `/dashboard/students/123`, the state should broadcast `{ type: 'student_profile', studentId: '123' }`.
2. **API Route Update (`/api/chat/route.ts`)**:
   - Modify the chat endpoint to accept `currentViewContext` from the frontend payload.
   - Dynamically inject this context into the Mastra agent's system prompt (e.g., `"STUDENT CONTEXT: The user is currently viewing the profile of student ID 123. Prioritize this student in implicit queries."`).
3. **C1 Component Native Streaming**:
   - **CRITICAL:** Ensure that when the `rinAgent` triggers a backend tool call (like `getStudentProfileTool`), the backend emits a UI indicator back to the client.
   - Specifically, use the `@thesysai/genui-sdk` / `@crayonai/stream` construct to emit a native "Thinking" or "Executing" pulse so the user sees a beautiful loading state (e.g., "Searching database for Marcus...").
   - _Follow the rule from `context/ai-integration.md`: Do not call `writeThinkItem` multiple times concurrently in a loop to avoid numbered list rendering bugs._

**Technical Requirements:**

- The state updates should be reactive and smooth; changing pages in the sidebar should seamlessly update the chat context variable.
- Mastra tool call event streams must map correctly to the Next.js `Transfer-Encoding: chunked` response stream.
