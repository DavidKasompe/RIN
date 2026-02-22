# Prompt: Artifact Persistence — Update Export Routes

**Role:** You are an expert backend engineer specialising in Next.js App Router API routes, Supabase Storage, and Drizzle ORM.

**Objective:**
Update the existing `/api/export-pdf` and `/api/export-pptx` route handlers to persist generated artifact files to Supabase Storage and record their URLs in the `artifacts` database table. Complete Phase 4 step 2 from `tasks/mastra-agent.md`.

**Context:**

- Both export routes already exist at `src/app/api/export-pdf/route.ts` and `src/app/api/export-pptx/route.ts`.
- They currently call the Thesys artifact export API and stream the result back to the browser.
- The `artifacts` Drizzle table and `uploadToSupabaseStorage` helper were created in Phase 4 step 1 (see `04-artifact-schema-storage.md`).

**Tasks:**

1. **Update `/api/export-pdf/route.ts`**:
   - After receiving the PDF buffer from the Thesys API, call `uploadToSupabaseStorage(buffer, filename, 'application/pdf')`.
   - Extract the authenticated user's ID using `auth.api.getSession({ headers })` (same pattern used in `src/app/dashboard/layout.tsx`).
   - Insert a record into the `artifacts` table: `{ title, type: 'pdf', publicUrl, userId }`. The `title` should come from the request body (add an optional `title?: string` field to the expected JSON).
   - Return a JSON response `{ publicUrl }` instead of streaming raw bytes — the frontend will open the URL in a new tab.

2. **Update `/api/export-pptx/route.ts`**:
   - Apply the same pattern: upload buffer → save to DB → return `{ publicUrl }`.
   - Use `'application/vnd.openxmlformats-officedocument.presentationml.presentation'` as the MIME type.

3. **Update `handleExportPdf` and `handleExportPptx` in `src/app/dashboard/page.tsx`**:
   - Change them to `await fetch('/api/export-pdf', ...)` and read the JSON response for `publicUrl`.
   - Open the `publicUrl` in a new tab (`window.open(publicUrl, '_blank')`) instead of triggering a blob download.

**Technical Requirements:**

- Always check the response from the Thesys API for errors before uploading.
- Generate unique filenames using `crypto.randomUUID()` combined with the title slug to avoid collisions in the bucket (e.g., `${crypto.randomUUID()}-rin-report.pdf`).
- If the upload or DB insert fails, still return the file to the user (log the error but don't block the download).
- The `title` parameter should be sanitised before using it as part of a filename (strip special characters).

**Files to modify:**

- `src/app/api/export-pdf/route.ts`
- `src/app/api/export-pptx/route.ts`
- `src/app/dashboard/page.tsx` — `handleExportPdf`, `handleExportPptx`
