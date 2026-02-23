# Composio White-Labeling & Integration Setup Plan

This document outlines the strategy for connecting third-party tools via Composio, specifically determining whether integrations should happen at the **Workspace (School) Level** or the **User (Educator) Level**. It also provides a step-by-step guide on how to configure white-labeling for these integrations so users see your brand ("RIN") instead of Composio during the OAuth flow.

## 1. Integration Strategy: Workspace vs. User

Because RIN operates on a school-based billing and data model, we need to carefully separate integrations that affect the *entire school* from integrations that belong to an *individual educator*.

### Workspace-Level Integrations (Entity ID = \`schoolId\`)
These are tools that contain master records (rosters, grades, global attendance). They should only be connected **once per school**, usually by a School Administrator.
- **PowerSchool SIS**: Master demographics, attendance, and official records.
- **Canvas LMS / Moodle**: Course enrollment, district-wide curriculum, and assignment grades.
- **Google Classroom (Domain-wide)**: If the school syncs all Google Classrooms at the admin level instead of individual teacher selection.

**Implementation Status:** This has been *fully implemented* natively in `/api/integrations/route.ts` and `/api/chat/route.ts`. The backend automatically intercepts the incoming toolkit slug during an OAuth connection, checks if it's a workspace-level tool (Canvas, Moodle, Google Classroom, PowerSchool), and routes the connection to the user's active `schoolId` retrieved from the database. User-level tools continue to use the individual `userId`. 

During chat execution, the AI Orchestrator seamlessly merges tools from both the `schoolId` session and the `userId` session. This means the agent has access to all connected tools automatically (triggered by natural conversation keywords), while prioritizing any tools the educator explicitly selects in the UI picker.

### User-Level Integrations (Entity ID = \`userId\`)
These are tools used for daily personal workflows and communication. Every educator connects their own account.
- **Gmail**: Sending parent emails from the educator's actual email address.
- **Google Calendar**: Syncing intervention meetings and parent-teacher conferences to the educator's personal calendar.
- **Slack**: Sending alerts to specific channels the educator is part of.
- **Notion Base**: Exporting reports to a counselor's personal Notion workspace.

**How to implement:** Keep the entity ID as the \`userId\` when generating connections via Composio.

---

## 2. Setting Up Composio White-Labeling (Custom OAuth)

By default, when a user clicks "Connect Calendar", they will see "Composio wants access to your Google Calendar." To build a premium, trusted product, we must replace Composio's branding with **RIN's branding**. Composio supports Custom OAuth apps for this exact purpose.

### General Step-by-Step for Any Toolkit:
1. Go to the [Composio Dashboard](https://app.composio.dev/).
2. Navigate to **Toolkits** -> select the toolkit (e.g., Google Calendar).
3. Click on the **Settings & Auth** tab.
4. Toggle "Use Custom OAuth App" (or similar configuration option depending on the toolkit).
5. Enter your own Client ID and Client Secret generated from the provider (e.g., Google Cloud Console).
6. Provide the provider with Composio's redirect URI (typically \`https://app.composio.dev/api/v1/auth-callback\`).

### Specific Guide: Google Workspace (Gmail, Calendar, Classroom)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **RIN Agent Integrations**.
3. Go to **APIs & Services -> OAuth consent screen**.
   - **App name:** RIN
   - **User support email:** (your email)
   - **App logo:** Upload the RIN logo (dark red/beige aesthetic).
   - **Authorized domains:** \`composio.dev\`, \`[your-production-domain.com]\`
4. Add the necessary Scopes:
   - Calendar events read/write
   - Gmail send/read
   - Classroom rosters/courses read
5. Go to **Credentials -> Create Credentials -> OAuth client ID**.
   - **Application type:** Web application
   - **Authorized redirect URIs:** \`https://app.composio.dev/api/v1/auth-callback\`
6. Copy the generated **Client ID** and **Client Secret**.
7. Paste these into the Composio Dashboard under the Google Calendar, Gmail, and Google Classroom toolkit settings.

### Dummy Data Setup Guide
For the Devpost submission and testing, you will need sandbox data:
1. **Google Calendar:** Create a free standard Google account (\`rin.educator.test@gmail.com\`). Populate the calendar with fake "Intervention Review", "Parent Meeting - John Doe", and "IEP Alignment" events over the past and coming weeks. Connect this account to RIN.
2. **Gmail:** Use the same account to send and receive test emails about student absences.
3. **Canvas LMS:** Sign up for a "Free for Teacher" Canvas account. Create a dummy course ("Algebra I") and add a few test student accounts. Provide varying grades to simulate "at-risk" students.
4. **Slack:** Create a free Slack workspace called "Lincoln High Staff". Create channels like \`#intervention-alerts\` and \`#counseling-team\`. Connect this workspace using the Slack integration to demonstrate alert routing.
