# Prompt 03: Deep-Linking — Overview Alerts to Contextual AI Chat

**Role:** You are an expert Next.js frontend engineer with strong React state management skills.

**Objective:**
When an educator clicks **"Analyze"** next to a flagged student on the Overview page (or the Students list), they should be taken directly to the chat interface with a pre-populated, context-aware prompt that auto-submits. No more manual typing.

---

## Context

- The Overview page is `src/app/dashboard/overview/page.tsx`. It already has an `atRiskStudents` list with an `"Analyze"` link that navigates to `/dashboard?studentId=${s.id}` — but the chat doesn't pre-populate or auto-send.
- The Chat page is `src/app/dashboard/page.tsx`. It reads `searchParams?.studentId` on mount and sets the `currentViewContext`, but does NOT pre-fill the input or auto-submit.
- The global context store is `src/lib/contextStore.ts` (Zustand or similar) — check this file to understand the existing `currentViewContext` mechanism.
- Design: inline CSS matching the existing RIN style.

---

## Tasks

### 1. Create a `pendingPrompt` global store slot

In `src/lib/contextStore.ts`:

- Add a `pendingPrompt: string | null` field and a `setPendingPrompt(prompt: string | null): void` action to the Zustand store.
- This field is consumed once by the chat page and then cleared.

### 2. Update Overview page "Analyze" buttons (`src/app/dashboard/overview/page.tsx`)

Replace the existing `<Link href={...}>Analyze</Link>` with a button that:

1. Sets `pendingPrompt` in the store with a rich, student-specific prompt string:
   ```
   Analyze the current risk factors for {student.name} (Grade {student.grade}).
   Their attendance is {student.attendanceRate}% and GPA is {student.gpa}.
   Fetch their full profile and suggest a targeted intervention plan.
   ```
2. Sets `currentViewContext` to `{ type: 'student_profile', studentId: student.id, studentName: student.name }`.
3. Navigates to `/dashboard` using `useRouter().push('/dashboard')`.

Also add the same pattern to the **Students list page** (`src/app/dashboard/students/page.tsx`) — add an "Analyze" action button to each student row.

### 3. Update Chat page to consume `pendingPrompt` (`src/app/dashboard/page.tsx`)

In the chat page's `useEffect` on mount (or when `pendingPrompt` changes):

- Read `pendingPrompt` from the store.
- If it exists:
  1. Set the textarea value / input state to the `pendingPrompt` string.
  2. **Automatically trigger send** after a 300ms delay (so the UI visibly loads first).
  3. Call `setPendingPrompt(null)` to clear it — it should only auto-send once.

### 4. Update Student Detail Page "Analyze in Chat" button (`src/app/dashboard/students/[id]/page.tsx`)

The existing button already routes to `/dashboard?studentId=...` but doesn't pre-populate. Update it to also set `pendingPrompt`:

```
Analyze {student.name}'s current risk profile in full detail.
Their latest risk score is {student.lastRiskScore ?? 'unknown'}.
Fetch all available data and provide a comprehensive intervention recommendation.
```

---

## Technical Requirements

- The `pendingPrompt` store value must use `sessionStorage` for persistence (in case the user is redirected through middleware). Use Zustand's `persist` middleware targeting `sessionStorage`, OR manually read/write to `sessionStorage` as a fallback.
- The auto-send should be cancellable — if the user edits the pre-filled text before the 300ms fires, cancel the auto-send and let them send manually.
- The Analyze button on the Overview and Students list must visually match existing action buttons: `padding: '4px 12px', backgroundColor: 'rgba(128,5,50,0.08)', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#800532'`.

**Files to modify:**

- `src/lib/contextStore.ts` — add `pendingPrompt` field
- `src/app/dashboard/overview/page.tsx` — update Analyze buttons
- `src/app/dashboard/students/page.tsx` — add Analyze buttons to student rows
- `src/app/dashboard/students/[id]/page.tsx` — update "Analyze in Chat" button
- `src/app/dashboard/page.tsx` — consume `pendingPrompt` on mount
