# Integrations Setup & Implementation Plan
**Assignee:** User / Emmanuel

## Architecture Overview
Mastra AI supports integrations primarily through **Custom Tools**. A Mastra Tool is a TypeScript function that describes its inputs (using Zod) and its behavior. The agent can seamlessly decide when to call these tools based on user prompts.

Rather than looking for "plug-and-play" widgets, the most robust and secure approach for RIN is to build **5 distinct Mastra Tools** using the native Node.js SDKs or REST APIs for each platform.

---

## 1. Google Workspace (Classroom & Calendar)
Google provides a unified Node.js SDK (`googleapis`) to interact with both Classroom and Calendar.

- [ ] **Setup GCP Project**:
  - Go to Google Cloud Console, create a project, and enable the **Google Classroom API** and **Google Calendar API**.
  - Create OAuth 2.0 credentials or a Service Account depending on your auth strategy.
- [ ] **Install SDK**: `npm install googleapis`
- [ ] **Create `googleClassroomTool`**:
  - Build a Mastra tool that fetches a student's enrolled courses and pending assignments.
- [ ] **Create `googleCalendarTool`**:
  - Build a Mastra tool that queries a teacher's calendar for upcoming parent-teacher conferences or IEP meetings.

## 2. PowerSchool SIS
PowerSchool uses a standard REST API secured by OAuth 2.0 Client Credentials.

- [ ] **Acquire PowerSchool Credentials**:
  - Request API access (Client ID and Client Secret) from your test PowerSchool server/district.
- [ ] **Create `powerSchoolTool`**:
  - Build a Mastra tool using native `fetch` or `axios`.
  - Endpoint targets: `/ws/v1/student` for demographics and `/ws/v1/attendance` for attendance records.
  - Make sure to document the exact JSON schema in the tool's description so the agent knows what data it's extracting.

## 3. Moodle LMS
Moodle provides an extensive REST API that uses a simple token-based authentication mechanism.

- [ ] **Enable Moodle Web Services**:
  - In Moodle Admin, enable Web Services and generate an Access Token for your integration user.
- [ ] **Create `moodleTool`**:
  - Build a Mastra tool utilizing standard HTTP requests.
  - Endpoint targets: `core_enrol_get_users_courses` (to get courses) and `gradereport_user_get_grades_table` (to get grades).

## 4. Notion Base
Notion has an excellent official Node.js SDK for reading from and writing to Notion databases.

- [ ] **Create Notion Integration**:
  - Go to `www.notion.so/my-integrations`, create a new internal integration, and get the `NOTION_API_KEY`.
  - Share the target Notion database with the integration.
- [ ] **Install SDK**: `npm install @notionhq/client`
- [ ] **Create `notionExportTool`**:
  - Build a Mastra tool that takes a generated "Risk Assessment Report" or "Intervention Plan" from the agent and uses `notion.pages.create()` to append it perfectly formatted into the school's shared Notion workspace.

---

## Next Steps for Integration
Once these individual TS files are written (e.g., `src/mastra/tools/google-calendar.ts`), simply import them into `src/mastra/agents/rin-agent.ts` and add them to the agent's `tools` array:

```typescript
export const rinAgent = new Agent({
    id: 'rinAgent',
    name: 'RIN Agent',
    instructions: `...`,
    tools: { 
        googleClassroomTool, 
        powerSchoolTool, 
        moodleTool, 
        googleCalendarTool, 
        notionExportTool 
    },
    // ...
});
```
