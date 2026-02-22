# Prompt: Artifact Persistence — Database Schema & Supabase Storage

**Role:** You are an expert backend engineer specialising in Next.js, Drizzle ORM, Neon PostgreSQL, and Supabase Storage.

**Objective:**
Implement the first part of Phase 4 of `tasks/mastra-agent.md`: add persistence for AI-generated artifacts (PDF reports and PPTX slide decks) so they survive across sessions.

**Tasks:**

1. **Add `artifacts` table to Drizzle schema (`src/db/schema.ts`)**:
   - Fields: `id` (uuid, default `crypto.randomUUID()`, primary key), `title` (text, not null), `type` (text — either `'pdf'` or `'pptx'`, not null), `publicUrl` (text, not null), `userId` (text, foreign key referencing `user.id` from the existing auth schema), `createdAt` (timestamp, default `now()`).
   - Export the table so it can be queried in route handlers.

2. **Generate & run a Drizzle migration**:
   - Run `npx drizzle-kit generate` then `npx drizzle-kit migrate` (or `push` if configured) to apply the schema to the Neon database.

3. **Create `src/lib/supabase-storage.ts`**:
   - Write and export a helper `uploadToSupabaseStorage(buffer: Buffer, filename: string, mimeType: string): Promise<string>`.
   - Use the existing `@supabase/supabase-js` client (initialise with `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`).
   - Upload to a **public** bucket called `user_artifacts`.
   - Return the public URL of the uploaded file.
   - Handle errors by throwing a descriptive `Error`.

**Technical Requirements:**

- Use `supabase.storage.from('user_artifacts').upload(filename, buffer, { contentType: mimeType, upsert: true })` then `.getPublicUrl(filename)` to retrieve the URL.
- The `SUPABASE_SERVICE_ROLE_KEY` must be used server-side only — never expose it to the client.
- The helper should be importable from any API route: `import { uploadToSupabaseStorage } from '@/lib/supabase-storage'`.
- Check `src/db/index.ts` for how the Drizzle `db` instance is initialised to ensure consistent import patterns.

**Files to create / modify:**

- `src/db/schema.ts` — add `artifacts` table
- `src/lib/supabase-storage.ts` — new upload helper
