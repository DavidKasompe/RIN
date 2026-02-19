# RIN Database Schema Context

## Core Technologies
- **Neon PostgreSQL**: Serverless Postgres.
- **Drizzle ORM**: Used for all schema definitions and type-safe querying.
  - Schema configuration: `src/db/schema.ts`
  - DB connection instance: `src/db/index.ts`

## Current Tables

### User & Authentication (Better Auth)
- `user`, `session`, `account`, `verification`
- Standard tables generated and managed by Better Auth. Role based access (RBAC) currently uses the `role` field on `user` (values like `teacher`, `counselor`, `admin`).

### Core Application Tables
- `students`: Central entity. Core academic profile data.
- `attendance`: Daily tracking of present, absent, tardy, excused.
- `events`: Behavioral incidents, meetings, positive interventions.
- `academic_records`: Term-based or assignment-based grades and GPA tracking.

## Future Schema Expansions
*As detailed in `integrations.md`, the following tables will be needed as the platform expands:*

- `parents`: Links to `students`, stores contact info and communication preferences (for Resend/Twilio integrations).
- `communication_log`: An audit trail of every email and SMS sent to parents/guardians, including delivery status and replies.
- `interventions`: Replaces basic 'events' for counselor tracking. Includes follow-up dates and outcome analysis.
- `risk_history`: Snapshots of a student's risk score over time to power trend charts and predictive trajectory analytics.
- `case_notes`: Rich-text private/shared notes for counselors.

## Implementation Guidelines
- Always use Drizzle queries (`db.select().from(...)`) over raw SQL.
- For new tables containing sensitive data (like `case_notes` or `communication_log`), ensure Row-Level Security (RLS) or application-level access checks are strictly enforced so educators only see their assigned students' data.
