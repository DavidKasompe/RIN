# Prompt: Artifact Persistence — Artifacts Drawer UI

**Role:** You are an expert frontend Next.js developer specialising in React Server Components, Radix UI, and Tailwind-free CSS-in-JS design consistent with the existing RIN design system.

**Objective:**
Build the `ArtifactsDrawer` component and wire it into the Overview page so educators can browse, preview, and re-download all previously generated AI reports and slide decks. This is the final step of Phase 4 in `tasks/mastra-agent.md`.

**Context:**

- The `artifacts` table exists in the DB with fields: `id`, `title`, `type` (`'pdf'` | `'pptx'`), `publicUrl`, `userId`, `createdAt`.
- Artifacts are saved when the educator downloads a report or slide deck via chat.
- The existing dashboard design uses inline styles (no Tailwind) and the `DM Sans` font. Match this aesthetic exactly.
- The Overview page is at `src/app/dashboard/overview/page.tsx` (or the root dashboard page — check which page is the landing view after login).

**Tasks:**

1. **Create `/api/artifacts/route.ts`** (GET):
   - Fetch the authenticated user's artifacts from the DB ordered by `createdAt DESC`.
   - Return `{ artifacts: Artifact[] }` as JSON.
   - Use `auth.api.getSession({ headers })` for auth.

2. **Create `src/components/dashboard/ArtifactsDrawer.tsx`**:
   - Use `@radix-ui/react-dialog` (already installed) styled as a right-side Sheet/drawer — width `520px`, full height, sliding in from the right with a smooth transition.
   - **Trigger**: a button labelled `"Saved Reports & Slides"` with an appropriate icon (e.g., `FileText` from lucide-react). Style it to match the existing sidebar/overview action buttons.
   - **Inside the drawer**: two tabs — **Reports** (filters `type === 'pdf'`) and **Slides** (filters `type === 'pptx'`). Use a simple custom tab bar (two pill buttons, active state highlighted) consistent with existing RIN UI.
   - **Artifact cards**: render each artifact as a card with:
     - File type icon (PDF icon for reports, slides icon for PPTX)
     - `title` (bold, 14px)
     - Formatted `createdAt` date (e.g., "Feb 21, 2026")
     - A `"Open"` button that opens `publicUrl` in a new tab
   - Show a friendly empty state (`"No reports generated yet — ask RIN to create one in the chat."`) if the list is empty.
   - Fetch artifacts on drawer open (not on mount) to avoid unnecessary requests.

3. **Wire into the Overview page**:
   - Import and render `<ArtifactsDrawer />` on the Overview/Dashboard landing page.
   - The trigger button should sit in the page header or toolbar area.

**Technical Requirements:**

- This component is `'use client'`.
- Use `fetch('/api/artifacts')` inside a `useEffect` (triggered when the drawer opens) — no server actions.
- The drawer animation should use CSS transitions, not Framer Motion, to keep bundle size small.
- Drawer overlay should be semi-transparent (`rgba(0,0,0,0.3)`), consistent with other modals in the app.
- Cards should have hover states and subtle shadows matching the RIN design language.
- Match the colour palette: background `rgb(250,250,249)`, borders `rgb(228,221,205)`, text `rgb(26,25,25)`, accent `rgb(99,102,241)`.

**Files to create / modify:**

- `src/app/api/artifacts/route.ts` — new GET endpoint
- `src/components/dashboard/ArtifactsDrawer.tsx` — new drawer component
- Overview/landing dashboard page — render `<ArtifactsDrawer />`
