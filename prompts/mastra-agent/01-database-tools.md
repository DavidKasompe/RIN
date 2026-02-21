# Prompt: Database Tools Integration for Mastra Agent

**Role:** You are an expert backend engineer specializing in Next.js, Drizzle ORM, and the Mastra AI framework.

**Objective:**
Implement Phase 1 of the `tasks/mastra-agent.md` plan: Equipping the `rinAgent` with read access to the Neon database via custom Drizzle ORM tools.

**Tasks:**

1. **Create `getStudentProfileTool`**: A Mastra tool to fetch a student's full demographic, attendance, and risk score data.
   - Inputs should accept a `studentId` or name.
   - Check `src/db/schema.ts` for the `students` table structure.
2. **Create `getStudentAcademicsTool`**: A Mastra tool to fetch a student's GPA, standardized test scores, and recent assignment completion statuses from the database.
3. **Create `getInterventionsTool`**: A Mastra tool to fetch a student's intervention history, behavioral events, and active action plans (referencing `events` and planned `interventions` tables).
4. **Register Tools**: Update `src/mastra/agents/rin-agent.ts` to import and explicitly register all newly created tools in the agent's configuration.

**Technical Requirements:**

- You must use Drizzle ORM queries (`db.select().from()...`). Do NOT use raw SQL strings.
- Define a strict Zod schema for the inputs of every Mastra tool you create.
- Ensure the tools handle negative cases gracefully (e.g., returning a clear string like "No student found with that name" so the LLM knows how to respond).
- Store these tools logically in `src/mastra/tools/`.
