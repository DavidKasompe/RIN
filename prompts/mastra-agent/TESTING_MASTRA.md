# Testing the Mastra Agent Integration 🧪

This guide outlines how to fully test the new autonomous features of the `rinAgent`. Now that the agent is natively connected to the database (Drizzle ORM) and the Chat UI is context-aware via Zustand, you can try out powerful capabilities.

## 1. Testing Database Tools

The agent now has read-access to Neon via three specific Drizzle Tools:

- `getStudentProfileTool`
- `getStudentAcademicsTool`
- `getInterventionsTool`

**How to test:**

1. Open the Chat Interface (`/dashboard`)
2. Ask: _"What is Marcus's current risk score?"_
3. Ask: _"Can you tell me about STU-123's academic performance and GPA?"_
4. Ask: _"Does Marcus have any active intervention plans?"_

**Expected Behavior:** You should see the C1 UI briefly pulse "Analyzing student data…" as Mastra fires the tools under the hood, hits your Postgres DB, and streams back the exact score recorded in the database—with zero hallucinations.

---

## 2. Testing the RAG Pipeline (Qualitative Notes)

We introduced `pgvector` to store vector embeddings for unstructured counselor notes, disciplinary reports, and IEP summaries.

**How to test:**

1. First, ensure you have sample qualitative text populated in the newly created `student_notes` table (you can manually add a row via a Postgres client or Drizzle Studio).
2. Ask: _"Why has Marcus's attendance dropped recently?"_ or _"What do the counselor notes say about STU-123's behavioral issues?"_

**Expected Behavior:** The agent will trigger `searchStudentNotesTool`, generate an OpenAI embedding for your question, perform a cosine distance search (`<=>`) against the vector column in Neon, and ingest the top 5 subjective notes into its context to answer your question naturally.

---

## 3. Testing Global UI Context (Implicit Queries)

The chat interface now listens to a Zustand `useGlobalContextStore` state. It sends the `currentViewContext` to `/api/chat/route.ts` on every message.

**How to test:**

1. You'll need to dispatch a view state from somewhere in the frontend. For example, in a prospective `StudentProfile` component, you would call:
   ```typescript
   useGlobalContextStore().setViewContext({
     type: "student_profile",
     studentId: "STU-123",
     studentName: "Marcus",
   });
   ```
2. With that state active, go to the chat and ask an _implicit_ query without naming the student: _"Summarize their recent scores."_ or _"What is their GPA?"_

**Expected Behavior:** The agent inherently knows you meant Marcus (STU-123) because the system prompt was dynamically injected with `"STUDENT CONTEXT: The user is currently viewing the profile of Student ID STU-123."` Mastra will pass "STU-123" into the Database Tools internally and return Marcus's data!

---

_Notes: Make sure your `OPENAI_API_KEY` and `THESYS_API_KEY` are valid and the Neon DB is running before attempting these tests!_
