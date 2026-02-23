# Prompt 02: Student Document & Transcript Management

**Role:** You are an expert full-stack Next.js engineer with expertise in Drizzle ORM, Supabase Storage, and React UI patterns.

**Objective:**
Add a **Documents tab** to the Student Detail page (`/dashboard/students/[id]`) where educators can upload, view, and delete historical transcripts, IEPs, and records for a student. These documents must also feed into the RAG pipeline so the AI agent can reference them when analyzing that student.

---

## Context

- Student detail page is at `src/app/dashboard/students/[id]/page.tsx`. It currently has NO tab system — it renders a flat list of metric cards, a risk trend chart, and teacher notes in one view.
- The existing Supabase Storage bucket is `user_artifacts` (used for PDF/PPTX exports). We'll use the same bucket with a different path prefix: `student-docs/{studentId}/{filename}`.
- The existing `uploadToSupabaseStorage` helper is at `src/lib/supabase-storage.ts`.
- The RAG pipeline uses `searchStudentNotesTool` (`src/mastra/tools/searchStudentNotesTool.ts`) which searches the `student_notes` table via vector embeddings. Uploaded documents should be chunked and embedded into `student_notes` so the AI can search them.
- Design: inline CSS, `Inter` font, `#800532` accent, `#230603` text — match `src/app/dashboard/students/[id]/page.tsx` exactly.

---

## Tasks

### 1. Database: `student_documents` table in `src/db/schema.ts`

Add a new table:

```typescript
export const studentDocuments = pgTable("student_documents", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(), // original filename displayed in UI
  storageKey: text("storage_key").notNull(), // path in Supabase Storage bucket
  publicUrl: text("public_url").notNull(),
  type: text("type").notNull(), // 'pdf' | 'docx' | 'txt'
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

After adding, run `npx drizzle-kit push` to apply the migration.

### 2. API Routes

**`POST /api/students/[id]/documents`**

- Accept `multipart/form-data` with field `file`.
- Auth-guard; verify the student belongs to the requesting user.
- Extract text (same logic as Prompt 01 — use `pdf-parse` / `mammoth` / plain text).
- Upload raw file to Supabase: `student-docs/{studentId}/{uuid}-{originalName}`.
- Insert into `student_documents`.
- **Chunk and embed** the extracted text into `student_notes`:
  - Split text into ≤500-word chunks.
  - For each chunk: call `openai.embeddings.create({ model: 'text-embedding-3-small', input: chunk })`.
  - Insert a `student_notes` row: `{ studentId, authorId: userId, content: chunk, type: 'document', embedding: vector }`.
- Return `{ document: { id, filename, publicUrl, createdAt } }`.

**`GET /api/students/[id]/documents`**

- Return all documents for the student ordered by `createdAt DESC`.

**`DELETE /api/students/[id]/documents/[docId]`**

- Remove from `student_documents` table and delete from Supabase Storage.
- Also delete all `student_notes` rows with `type = 'document'` linked to this student AND whose content originated from this file (use `storageKey` as a tag — store it in the `notes` field of `student_notes` as a JSON tag `{"sourceDocId": "..."}` so we can filter on delete).

### 3. Tab System on Student Detail Page (`src/app/dashboard/students/[id]/page.tsx`)

Add a **tab bar** with two tabs: **Overview** (existing content) and **Documents** (new).

- The tab bar sits just below the student name/header section, above the metric cards.
- Style: two pill buttons. Active tab: `backgroundColor: '#800532', color: 'white'`. Inactive: `backgroundColor: 'transparent', color: 'rgba(35,6,3,0.5)'`.
- **Documents tab** content:
  - An **upload area**: a dashed-border drop zone (`"Drop a PDF, DOCX, or TXT here, or click to browse"`) that triggers `<input type="file">`. Show upload progress via a loading state on the button.
  - A **list of uploaded documents** fetched from `GET /api/students/[id]/documents`. Each row: `DocumentText` icon (iconsax), filename, file size, upload date, and a red trash/delete button.
  - Empty state: `"No documents uploaded yet. Upload transcripts or IEPs to help RIN make better assessments."`

---

## Technical Requirements

- Reuse the `uploadToSupabaseStorage` helper — call it with `storageKey` as the filename arg.
- The embedding insertion is fire-and-forget (wrap in `try/catch`, don't block the response).
- Max upload size: 10 MB (larger than chat attachments since these are stored permanently).
- The `student_notes` `type` field currently accepts `'general' | 'meeting' | 'iep' | 'disciplinary'` — add `'document'` as a new allowed value type in the schema type cast.

**Files to create / modify:**

- `src/db/schema.ts` — add `studentDocuments` table
- `src/app/api/students/[id]/documents/route.ts` — new (GET + POST)
- `src/app/api/students/[id]/documents/[docId]/route.ts` — new (DELETE)
- `src/app/dashboard/students/[id]/page.tsx` — add tab system + Documents tab
