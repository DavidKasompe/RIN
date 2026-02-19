# RIN Platform - Project Overview

## What is RIN?
RIN (Responsible Insight Navigator) is an AI-powered student dropout risk assessment platform designed for K-12 educators. It provides a real-time early warning dashboard that tracks grades, attendance, and behavior, using AI to generate risk alerts and intervention plans before a student falls through the cracks.

## Core Value Proposition
- **For Teachers:** Identifies at-risk students early without manual data crunching.
- **For Counselors:** Generates concrete, data-backed intervention plans and parent communication.
- **For Administrators:** Provides class/cohort-wide analytics to spot trends.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (`index.css` for custom utility classes)
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **AI/LLM:** OpenAI (`gpt-4o-mini`)
- **Generative UI:** Thesys C1 (`@thesysai/genui-sdk`)
- **AI Agent Framework:** Mastra (`rin-agent.ts`)

## Project Structure
- `src/app`: Next.js App Router pages and API routes.
  - `/api/chat`: Thesys C1 streaming generative UI endpoint.
  - `/api/analyze`: OpenAI structured dropout risk scoring endpoint.
  - `/dashboard`: Main application interface (Students, Workflows, Settings, etc.).
- `src/components`: Reusable React components (UI, specific domain components).
- `src/lib`: Utilities, AI logic, database connection.
  - `ai.ts`: Mastra agent definition.
- `src/db`: Drizzle schema and migrations.

## Current State
The platform has a functional landing page, authentication flow, and a dashboard with a generative AI chat interface. The foundational database schema is in place for students, attendance, events, and academic records.

## Pricing & Go-To-Market
RIN uses a flat "Per-School" Team model ($249/school/mo) with a 7-day free trial. This encourages self-serve onboarding by educators who can upload a CSV of at-risk students, see immediate value, and then invite their school team.
