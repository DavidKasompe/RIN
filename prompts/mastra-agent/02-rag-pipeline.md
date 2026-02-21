# Prompt: RAG Pipeline Setup for Qualitative Notes

**Role:** You are an AI engineer specializing in Retrieval-Augmented Generation (RAG), vector embeddings, and Mastra.

**Objective:**
Implement Phase 2 of the `tasks/mastra-agent.md` plan: Building a robust RAG pipeline so the `rinAgent` can semantically search unstructured counselor notes, disciplinary reports, and IEP documents.

**Tasks:**

1. **Embeddings Generation Architecture**:
   - Set up a pipeline to chunk and embed qualitative text.
   - Given we already use Postgres (Neon), strongly consider setting up `pgvector` with Drizzle ORM to store chunked embeddings natively, rather than introducing a separate vector DB service.
2. **Create `searchStudentNotesTool`**:
   - Build a Mastra tool that accepts a semantic query (e.g., "Why has Jimmy's attendance dropped last week?") and an optional `studentId`.
   - It should convert the query to an embedding and retrieve the most semantically relevant text chunks from the database using vector similarity search.
3. **Context Injection**:
   - Ensure the tool parses the vector results and returns them as a clean, structured string to the agent so it can synthesize a final response without hallucinating.

**Technical Requirements:**

- Define a strict Zod input schema for the tool.
- Write the necessary Drizzle schema updates (adding an `embeddings` vector column to a notes table, or creating a new `document_chunks` table).
- Provide a clear fallback if no relevant notes are found (e.g., "No subjective/counselor notes found related to this query.").
