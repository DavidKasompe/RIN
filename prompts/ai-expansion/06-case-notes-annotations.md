# Prompt 06: Case Notes & Annotations System

**Role:** You are an expert full-stack Next.js engineer with experience in rich text editors and Drizzle ORM.

**Objective:**
Add a **Notes tab** to the Student Detail page where educators can write timestamped case notes (complaints, comments, behavioral keywords, observations) with support for quick keyword tags. Notes are private by default but can be shared with the team. The AI agent can also read and search these notes.

---

## Context

- The `studentNotes` table already exists in `src/db/schema.ts` — it was built for RAG embeddings and has: `id`, `studentId`, `authorId`, `content`, `type`, `embedding`, `createdAt`, `updatedAt`.
- The `searchStudentNotesTool` already embeds and searches these notes for the AI agent.
- The student detail page at `src/app/dashboard/students/[id]/page.tsx` will gain a **Notes** tab after this prompt (4th tab: Overview · Documents · Results · Notes).
- `type` values currently: `'general' | 'meeting' | 'iep' | 'disciplinary'` — keep these and add UI to select.
- Design: inline CSS, `Inter` font, `#800532` accent, `#230603` text.

---

## Tasks

### 1. Add `tags` column to `student_notes` (`src/db/schema.ts`)

```typescript
// Add to studentNotes table:
tags: jsonb('tags').$type<string[]>().default([]),
visibility: text('visibility').notNull().default('private'), // 'private' | 'team'
```

Run `npx drizzle-kit push`.

### 2. API Routes

**`GET /api/students/[id]/notes`**

- Return all notes for the student (ordered by `createdAt DESC`), filtered by the requesting user's notes + any notes with `visibility = 'team'`.
- Include: `id`, `content`, `type`, `tags`, `visibility`, `createdAt`, `authorId`.

**`POST /api/students/[id]/notes`**

- Body: `{ content: string, type: string, tags: string[], visibility: 'private' | 'team' }`
- Auth-guard; set `authorId` from session.
- Generate an embedding for `content` using OpenAI `text-embedding-3-small` — insert into the `embedding` vector column (same pattern as `searchStudentNotesTool`).
- Return the created note.

**`DELETE /api/students/[id]/notes/[noteId]`**

- Only allow deletion if `authorId === requesting userId`.

### 3. Notes Tab UI in `src/app/dashboard/students/[id]/page.tsx`

Add **"Notes"** as the 4th tab.

**Compose area (top):**

- A `<textarea>` (min 80px height, auto-expand) with placeholder `"Add a case note, observation, or behavioral comment..."`.
- A **type selector**: 4 small pill buttons — `General`, `Meeting`, `IEP`, `Disciplinary`. Active pill: `backgroundColor: '#800532', color: 'white'`. Default selected: `General`.
- A **tags input**: a text field where pressing Enter or comma adds a tag chip. Tags appear as small `#230603` pills with a remove button. Pre-suggest: `"Attendance"`, `"Behavior"`, `"Academic"`, `"Parent Contact"`, `"IEP Concern"`.
- A **visibility toggle**: `"Private"` / `"Team"` — default Private. Small switch or segmented control.
- A **Save Note** button: `backgroundColor: '#800532', color: 'white', padding: '8px 20px', borderRadius: 10`.

**Notes list (below compose area):**

- Each note rendered as a card:
  - Timestamp (e.g. `"Feb 23, 2026 · 2:31 PM"`), type badge (colored by type), visibility badge (`"Private"` / `"Team"`).
  - Full note content (no truncation).
  - Tags as small pill chips.
  - Delete button (trash icon, red, only shown for notes authored by current user).
- Empty state: `"No notes yet. Add your first observation above."`.

---

## Technical Requirements

- Notes load lazily (only when Notes tab is first opened).
- The embedding generation is fire-and-forget — don't block the POST response for it. Kick it off async and swallow errors with a `console.error`.
- Tags must be deduplicated (no duplicate tag chips).
- The compose textarea must clear after successful save.
- Pre-suggested tags appear as clickable chips below the tags input (clicking one adds it).

**Files to create / modify:**

- `src/db/schema.ts` — add `tags` + `visibility` to `studentNotes`
- `src/app/api/students/[id]/notes/route.ts` — new (GET + POST)
- `src/app/api/students/[id]/notes/[noteId]/route.ts` — new (DELETE)
- `src/app/dashboard/students/[id]/page.tsx` — add Notes tab
