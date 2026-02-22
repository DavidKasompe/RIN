# Integrations Setup & Implementation Plan (Composio Era)

**Assignee:** User / Emmanuel

## The Grand Cohesive Goal
*To transform RIN from a siloed dashboard into a fully autonomous, cross-platform early-warning and intervention engine.*

Using Composio + Mastra AI, the RIN Agent will not just *analyze* data, but *take action* directly in the tools educators already use every day. It will instantly read grades from any LMS, schedule interventions in calendars, log case notes in Notion, and notify parents via their preferred channel (Email, SMS, or WhatsApp)—all autonomously and natively.

We are dropping the custom OAuth token management and hardcoded REST API calls. We will utilize **Composio MCP + Tool Router**.

---

## Architecture Transformation (Custom Tools → Composio MCP)

Instead of building individual integrations and managing standard OAuth flows on our database, we are migrating to **Composio MCP**:
- **Managed Auth**: Composio handles token refresh, credential storage, and session management per user via `COMPOSIO_USER_ID`.
- **White-Labeling**: We will use Custom Auth Configs (plugging in our own OAuth Client IDs) so the consent screens say "RIN" instead of "Composio".
- **Dynamic Agent Plugins**: Mastra AI connects to a Composio MCP server URL. Composio's 1000+ tools are injected dynamically into the LLM context.

---

## The New Integration Suite (Composio Toolkits)

We are replacing our old manual plan with the following Supported Composio Toolkits:

### 1. Education & LMS (The Core Data Source)
- **Google Classroom**, **Canvas**, **Blackboard**, **D2L Brightspace**
- *Agent Use Case: Autonomously fetch student rosters, track missing assignments, and monitor real-time grades without us building custom scrapers.*

### 2. Parent & Teacher Notifications (Multichannel)
- **Email**: **Gmail**, **Outlook**
- **SMS & WhatsApp/RCS**: **2chat** (WhatsApp), **MSG91** (Global SMS/Voice/WhatsApp), **Telnyx** (SMS), **SMS Alert** (SMS/RCS)
- **Internal Team**: **Slack**, **Microsoft Teams**, **Discord**
- *Agent Use Case: When a student hits Critical Risk, the agent drafts and sends a localized WhatsApp message or an official Email originating directly from the Teacher's own account (highly personal/trustworthy).*

### 3. Productivity & Case Management (The Organizers)
- **Calendars**: **Google Calendar**, **Outlook Calendar**
- **Documents & Knowledge**: **Notion**, **Google Docs**, **Google Drive**
- *Agent Use Case: Agent checks teacher availability, schedules a Parent-Teacher conference, and seamlessly exports the Risk Report to the school's Notion workspace.*

---

## Step-by-Step Implementation Roadmap

### Phase 1: Core Setup & Agent Wiring
1. **Dependencies**: `npm install @composio/core @mastra/mcp`
2. **Setup Env**: Add `COMPOSIO_API_KEY` to our environment.
3. **Mastra Engine Update**: Refactor `rin-agent.ts` to connect to `session.mcp.url` using the `@mastra/mcp` client, injecting tools using `mcpClient.getTools()`.

### Phase 2: White-Label Authentication & Settings UI
1. **Custom Auth Configs**: In the Composio Dashboard, configure our own Developer API keys/OAuth apps for Google, Notion, etc., so the auth is fully white-labeled to "RIN".
2. **Dashboard Connections Page**: Build out `/dashboard/workspace/settings` to list toolkits.
3. **Manual Auth Flow**: Implement `session.authorize('googleclassroom', { callbackUrl: '...' })`. When an educator clicks "Connect", they are routed to the secure OAuth flow and returned to the dashboard.

### Phase 3: The "Magic" Workflows
1. **The Intervention Automation**:
   - Agent dynamically calls `GOOGLECLASSROOM_LIST_COURSE_STUDENTS` to find a struggling student.
   - Agent calls `MSG91_SEND_WHATSAPP` or `GMAIL_SEND_EMAIL` to contact parents for a meeting.
   - Agent calls `GOOGLECALENDAR_CREATE_EVENT` to lock in the synced schedule.
   - Agent calls `NOTION_CREATE_PAGE` to log the intervention note.

Welcome to the future of the RIN platform!
