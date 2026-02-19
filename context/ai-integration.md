# RIN AI Integration Details

## Technologies Used
- **Thesys C1 (`@thesysai/genui-sdk`)**: Handles the generative UI, chat streaming, and rendering rich components inside the chat interface.
- **OpenAI (`gpt-4o-mini`)**: Powers the core analysis and structured data extraction.
- **Mastra Framework**: Used for building the autonomous AI agent (`rin-agent.ts`) that can call tools.
- **Vercel AI SDK (`@ai-sdk/openai`, `ai`)**: Used for standard LLM streams alongside C1.

## API Routes & Endpoints

### 1. Thesys C1 Chat Route (`/api/chat/route.ts`)
- **Purpose**: Handles the main conversational interface.
- **Mechanism**: 
  - Uses `makeC1Response()` from `@crayonai/stream`.
  - Important: Before kicking off the LLM stream, it emits a **single** C1 native think indicator:
    ```typescript
    c1Response.writeThinkItem({
        title: 'Analyzing student data…',
        description: 'RIN is reviewing the available information and preparing a response.',
    });
    ```
  - **Crucial Rule**: Do not call `writeThinkItem` multiple times in a loop or concurrently, as it causes numbered list bugs (e.g., "1 Analyzing...") in the C1 UI.
  - Streams the OpenAI response back via `c1Response.writeStream(openAiStream)`.

### 2. Risk Analysis Route (`/api/analyze/route.ts`)
- **Purpose**: A dedicated endpoint for generating structured risk scores (0-100) and identifying specific risk factors based on raw student data (attendance, grades, behavior).
- **Output**: JSON payload consumed by the dashboard to update charts and risk indicators.

## Mastra Agent (`rin-agent.ts`)
- The agent defines the persona and available tools.
- **Future Expansion**: The agent needs to be equipped with tools (Playwright/Puppeteer functions, fetch calls) to interact with the database, send emails, log interventions, and run simulations autonomously based on chat requests.

## Frontend Implementation Rules
- **AssistantBubble**: Always render the `<C1Component>` from `@thesysai/genui-sdk` directly. Do not use custom fallback spinners (`<Loader2>`) when waiting for content; let C1 handle its native thinking UI based on the `writeThinkItem` emitted by the backend.
