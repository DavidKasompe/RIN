# Visual Workflow Builder & Smart Notification Engine

This document contains a series of step-by-step prompts to build a sophisticated, AI-driven workflow builder and notification engine for RIN, inspired by the Vercel Workflow Builder Template and Workflow DevKit.

To proceed, copy and paste each prompt back to me one by one.

---

## Prompt 1: Smart Schema & Engine Core
**Copy this prompt:**
```text
Let's build the engine! First, we need a robust backend to store and execute workflows. 

1. Update `src/db/schema.ts` with:
   - `workflows`: Stores React Flow JSON, metadata, and active status.
   - `workflow_executions`: Tracks runs, status (running/success/failed), and timing.
   - `workflow_execution_logs`: Captures per-node output and errors for observability.
2. Create `src/lib/workflow-engine/executor.ts`: 
   - Implement an `executeWorkflow` function that takes nodes/edges.
   - Support template variable replacement (e.g., `{{@nodeId.field}}`) so data can flow between nodes.
   - Implement a `Condition` node handler that uses safe dynamic evaluation for branching.
3. Setup the "importer" pattern for actions (like the Vercel template) to keep the engine lightweight and modular.
```

---

## Prompt 2: Integration Plugins (Resend, Twilio, & School Data)
**Copy this prompt:**
```text
Now let's build the "Action" nodes that do the real work.

1. Implement `src/lib/integrations/resend.ts`: An email plugin using `resend` and `react-email` templates for parent/teacher alerts.
2. Implement `src/lib/integrations/twilio.ts`: An SMS plugin for urgent escalations (risk > 85% or same-day meeting reminders).
3. Implement `src/lib/integrations/student-data.ts`: A "Data Watcher" service that runs periodically (cron) or on DB triggers to check for "Smart Events" (e.g., "Student missed 3 days", "GPA dropped > 0.5").
4. Export these as a unified `step-registry` that our engine can import dynamically.
```

---

## Prompt 3: The Visual Builder UI (React Flow + Shadcn)
**Copy this prompt:**
```text
Upgrade `/app/dashboard/workflows/page.tsx` from static templates to a live builder.

1. Sidebar: Implement a list of draggable "Node Types":
   - Triggers: Webhook, Cron Schedule, Student Event (e.g., Low Grade), Manual.
   - Logic: Condition (Branch), AI Agent Analysis.
   - Actions: Send Email, Send SMS, Add Task, Create CRM Flag.
2. Canvas: Use `@xyflow/react` to allow dragging, dropping, and connecting nodes.
3. Property Panel: Clicking a node should open a sidebar to configure its properties (e.g., the specific threshold for a risk trigger or the email recipient).
4. Save & Deploy: Add buttons to save the configuration to the DB and toggles to activate/deactivate the workflow.
```

---

## Prompt 4: AI Agent Tools & Chat Integration
**Copy this prompt:**
```text
Let's make our AI Chat smarter by giving it direct access to these workflows.

1. Create a `triggerWorkflow` tool in `src/mastra/tools`: This allows the AI to programmatically start a workflow based on chat context (e.g., "AI, please start the 'Parent Outreach' workflow for Jordan").
2. Implement "Smart Tool Requests": Add a tool that allows teachers to request specific automation directly in chat (e.g., "Remind me if Sarah misses class tomorrow"). The AI should be able to create one-off temporary workflows for these requests.
3. Update the chat orchestrator in `api/chat/route.ts` to surface these new automation capabilities.
```

---

## Prompt 5: AI-Powered Workflow Generation (Natural Language to Canvas)
**Copy this prompt:**
```text
The final piece: Natural Language to Workflow.

1. Build `POST /api/ai/generate-workflow`: This endpoint should take a user prompt (e.g., "Notify me via SMS if any student in my class falls below 60% attendance") and return a valid JSON structure for nodes and edges.
2. Frontend: Add a "Magic Prompt" bar in the Workflows page. When used, it should clear the canvas and populate it with the AI-suggested workflow, which the teacher can then refine and save.
```
