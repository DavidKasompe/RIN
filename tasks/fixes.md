# RIN C1 Chat Integration — Fixes & Known Issues

## Status: Active

---

## ✅ Fixed

### 1. C1 Action Buttons Show Raw XML Tags in Chat

**Symptom:** Clicking a C1-generated button (e.g. "Share Student Information") showed the raw `<content thesys="true">…</content><context>[…]</context>` string as the user's chat bubble.

**Root Cause:** `handleC1Action` was passing `llmFriendlyMessage` (the full context/state payload) to `sendMessage`, which used it as both the displayed text and the API prompt.

**Fix:** `sendMessage(displayText, apiText?)` now takes two params:

- `displayText` → shown in the chat bubble (use `humanFriendlyMessage`)
- `apiText` → sent to the Thesys C1 API (use `llmFriendlyMessage`)

**Files:** `src/app/dashboard/page.tsx` — `sendMessage`, `handleC1Action`

---

### 2. Artifact PDF/PPTX Downloads Not Working

**Symptom:** Download buttons on C1-generated reports/slides did nothing.

**Root Cause:** `exportAsPdf` and `exportAsPPTX` props were not passed to `C1Component`.

**Fix:** Added `handleExportPdf` and `handleExportPptx` helper functions in `page.tsx` that call `/api/export-pdf` and `/api/export-pptx` respectively, then trigger a browser download. These are now passed as props to `C1Component` inside `AssistantBubble`.

**Files:**

- `src/app/dashboard/page.tsx` — `AssistantBubble`, `handleExportPdf`, `handleExportPptx`
- `src/app/api/export-pdf/route.ts` — proxies to Thesys PDF export API
- `src/app/api/export-pptx/route.ts` — proxies to Thesys PPTX export API

---

### 3. C1 CSS Styles Missing

**Symptom:** C1 components rendered without correct visual styles.

**Fix:** Added `import '@crayonai/react-ui/styles/index.css'` to `src/app/dashboard/layout.tsx`.

---

### 4. ThemeProvider Hydration Mismatch

**Symptom:** Console error: hydration mismatch on `.crayon-theme-portal-uid-N` — UID generated differs between SSR and client.

**Fix:** Wrapped `ThemeProvider` with an `isMounted` guard — renders only after mount (client-side only), eliminating the SSR/CSR UID mismatch.

**Files:** `src/app/dashboard/page.tsx` — `isMounted` state + `useEffect`

---

### 5. Thinking State Not Showing

**Symptom:** No "thinking" indicator appeared while waiting for the AI response.

**Fix:** Rewrote `route.ts` to use `makeC1Response()` + `writeThinkItem()` from `@thesysai/genui-sdk/server`. The thinking state is written immediately before the LLM stream begins.

**Files:** `src/app/api/chat/route.ts`

---

## 🔲 Remaining / Watch List

### A. Form State Not Persisted

C1 form values reset when the page is refreshed. The `updateMessage` callback on `C1Component` is not yet implemented (requires a database table or API to store C1 DSL state per message).

**To fix:** Implement `PUT /api/messages/:id` and pass `updateMessage` prop to `C1Component`.

### B. Mastra Agent Tools Not Used

The current chat flow calls Thesys C1 API directly, bypassing Mastra agent tools (DB lookups, student data queries). The system prompt instructs C1 to ask for data manually, but no real student records are fetched.

**To fix:** Wire Mastra tools as OpenAI-compatible `tools` array in `route.ts` using `client.beta.chat.completions.runTools(...)`. Each tool (e.g. `get_student_by_id`, `list_at_risk_students`) should call Mastra internally.

### C. `currentViewContext` Not Used by Thesys API

`currentViewContext` is injected in the system prompt as a string, but Thesys C1 doesn't automatically query the DB for that student. Real integration requires a Mastra tool call when a student profile is in context.

---

## Environment Variables Required

```env
THESYS_API_KEY=your_key_from_app.thesys.dev
OPENAI_API_KEY=...         # Used by Mastra agent (separate from Thesys)
AUTUMN_SECRET_KEY=...      # Billing/auth
```
