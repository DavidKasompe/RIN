# RIN Integration & Feature Roadmap

This document outlines the planned direction for the RIN platform to evolve into a comprehensive, enterprise-grade early warning system for schools.

## Phase 1: Core Communication Workflow (Near Term)
1. **Parent Database & Logging:** Expand schema to track parent contact info and maintain a comprehensive `communication_log`.
2. **Automated Emails (Resend):** Integrate Resend API to send risk alerts, weekly summaries, and intervention notices to parents.
3. **SMS Alerts (Twilio):** Integrate Twilio for urgent absence alerts and two-way SMS confirmation.
4. **Interventions Table:** Create a robust logging system for counselors to record actions taken and their outcomes.

## Phase 2: Calendar & Productivity Sync
1. **Google Calendar Bi-directional Sync:** Allow educators to schedule intervention meetings in RIN that push to GCal, and read events from GCal to prevent scheduling conflicts.
2. **Notion Integration:** Automatically push AI-generated intervention plans, meeting agendas, and weekly reports to an educator's connected Notion workspace.

## Phase 3: Academic Data Import
1. **Google Classroom Sync:** Pull rosters, assignment completion rates, and grades automatically to feed the risk model.
2. **LMS Integration (Canvas/PowerSchool):** Enterprise integrations to pull nightly SIS data, removing the need for manual CSV uploads.
3. **Advanced Results Viewer:** Build visual grade trends, assignment heatmaps, and predictive trajectory charts on the student details page.

## Phase 4: Autonomous Agent Workflows
1. **Tool Expansion:** Equip the Mastra `rin-agent` with functions to:
   - `getStudentProfile`
   - `draftParentLetter`
   - `logIntervention`
   - `calculateRiskScore`
   - `scheduleIntervention`
2. **Rule Engine:** Build a backend workflow engine that evaluates triggers (e.g., "Attendance drops below 70%") and automatically invokes agent tools to take action (e.g., "Draft email alert").

## Future Considerations
- Role-Based Access Control (RBAC) to support the "District Enterprise" tier.
- School-wide analytics dashboards for administrators.
- FERPA and COPPA compliance audits for all data storage and third-party transmission.
