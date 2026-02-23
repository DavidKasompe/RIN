# Prompt 01: AI Chat File Attachments & Transcript Analysis

**Role:** You are an expert full-stack Next.js engineer specialising in file handling, OpenAI APIs, and the Thesys C1 chat SDK (`@thesysai/genui-sdk`).

**Objective:**
Add a file attachment button (paperclip icon) to the RIN AI chat interface so educators can upload PDFs, DOCX, and TXT documents for real-time AI analysis. The AI must be able to read and reason about the uploaded content within the active conversation.

---

## Context

- The chat UI lives in `src/app/dashboard/page.tsx`. The input box is a custom `<textarea>` rendered inside the `ChatInput` component (or equivalent in that file) with a send button.
- The chat API route is `src/app/api/chat/route.ts`. It accepts `{ messages, currentViewContext }` and runs a manual OpenAI tool-call loop, streaming a Thesys C1 response.
- The existing design uses inline CSS, `Inter` font, `#800532` primary color, `#230603` text. Match this exactly — no Tailwind.
- Icons come from `iconsax-reactjs` (e.g. `Paperclip`, `CloseCircle`, `DocumentText`).

---

## Tasks

### 1. Backend: `POST /api/upload-document`

Create `src/app/api/upload-document/route.ts`:

- Accept `multipart/form-data` with a single file field named `file`.
- Support file types: `.pdf`, `.docx`, `.txt` (reject others with a 400 + descriptive message).
- Extract the plain text content:
  - **TXT**: read as UTF-8 string directly.
  - **PDF**: use `pdf-parse` (`npm install pdf-parse`). Call `pdfParse(buffer).then(d => d.text)`.
  - **DOCX**: use `mammoth` (`npm install mammoth`). Call `mammoth.extractRawText({ buffer })`.
- Return `{ text: string, filename: string, size: number }` as JSON.
- Cap file size at 5 MB — return 413 if exceeded.
- Auth-guard with `auth.api.getSession({ headers: req.headers })`.

### 2. Frontend: Attachment UI in `src/app/dashboard/page.tsx`

Add to the chat input area:

- A hidden `<input type="file" accept=".pdf,.docx,.txt">` element.
- A **paperclip button** (`Paperclip` icon from iconsax-reactjs) that triggers the file input click. Style it to match the existing send button area (small, 32px, rounded, `rgba(35,6,3,0.06)` background).
- When a file is selected:
  1. Show a **pill/chip** above the text input with the filename and a remove (`CloseCircle`) button.
  2. `POST` the file to `/api/upload-document` — show a subtle loading spinner on the chip while extracting.
  3. Store `{ text, filename }` in component state (`attachedDoc`).
- When the educator submits the chat:
  - Prepend a system context block to the user message:

    ```
    [ATTACHED DOCUMENT: "{filename}"]
    {text}
    [END DOCUMENT]

    {userMessage}
    ```

  - Clear `attachedDoc` after send.

### 3. Update `src/app/api/chat/route.ts`

- No backend changes needed — the document text is injected into the user message content on the frontend, so the C1 model receives it as part of the conversation. Just ensure the `messages` array the backend receives is passed through unchanged.

---

## Technical Requirements

- Install: `npm install pdf-parse mammoth`
- The attachment chip must show file name truncated to 24 chars if long.
- Only one file at a time. Selecting a new file replaces the previous one.
- If `/api/upload-document` returns an error, show a red inline error below the input (`"Could not read this file. Try a different format."`).
- The paperclip button must be disabled while the upload is in progress.
- Do NOT change any other parts of the chat UI or the API route logic.

**Files to create / modify:**

- `src/app/api/upload-document/route.ts` — new
- `src/app/dashboard/page.tsx` — add attachment UI to the input area
