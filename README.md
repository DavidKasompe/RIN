<p align="center">
  <img src="public/RIN-Logo.png" alt="RIN Logo" width="180" />
</p>

<h1 align="center">RIN — Responsible Insight Navigator</h1>

<p align="center">
  <strong>AI-powered student dropout risk assessment for educators</strong><br/>
  Built for <a href="#">Nexora Hacks 2026</a> · EdTech & AI Track
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI-Mistral--7B-orange?logo=huggingface" alt="AI Model" />
</p>

---

## 📋 Problem Statement

Student dropout is a critical challenge in education worldwide. Educators often lack the tools to **identify at-risk students early** and take proactive action. Traditional methods rely on gut feeling or delayed indicators — by the time a student is flagged, it may already be too late.

## 💡 Solution

**RIN** is a conversational AI assistant that helps educators assess student dropout risk through natural language. Instead of navigating complex dashboards or spreadsheets, educators simply describe a student's situation — attendance, grades, behavior — and RIN provides:

- **Risk Score** (0–100) with confidence level and category (Low / Moderate / At Risk / Critical)
- **Contributing Factors** ranked by impact with trend indicators
- **Plain-Language Explanations** suitable for parent meetings and reports
- **Intervention Plans** with prioritized, actionable steps
- **What-If Scenarios** showing how specific changes could reduce risk
- **Follow-up Q&A** for deeper analysis within the same context

All analysis is presented in clear, non-technical language designed for educators — not data scientists.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│           RIN Dashboard (Next.js 16)             │
├──────────────┬────────────────┬──────────────────┤
│  Landing     │  Dashboard     │  Overview        │
│  Page        │  Chat (AI)     │  Analytics       │
│              │  Settings      │  History         │
├──────────────┴────────────────┴──────────────────┤
│          Next.js API Routes (Server-side)        │
│   /api/analyze         /api/intervention         │
├──────────────────────────────────────────────────┤
│   Prompt Engineering + Zod Schema Validation     │
│   JSON extraction + structured output parsing    │
├──────────────────────────────────────────────────┤
│         HuggingFace Inference API                │
│         Model: Mistral-7B-Instruct-v0.2          │
├──────────────────────────────────────────────────┤
│   localStorage (chat sessions, analysis history) │
└──────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer           | Technology                                               |
| --------------- | -------------------------------------------------------- |
| **Framework**   | Next.js 16 (App Router)                                  |
| **UI**          | React 19 + TypeScript 5                                  |
| **Styling**     | Tailwind CSS 4                                           |
| **AI Model**    | Mistral-7B-Instruct-v0.2 (via HuggingFace Inference API) |
| **Validation**  | Zod 4                                                    |
| **Font**        | Inter (Google Fonts)                                     |
| **Persistence** | Browser localStorage                                     |
| **Deployment**  | Vercel                                                   |

## 🤖 AI Disclosure

This project uses AI in the following ways:

- **Core Analysis Engine**: [Mistral-7B-Instruct-v0.2](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2) via the [HuggingFace Inference API](https://huggingface.co/docs/api-inference/) is used to power all student risk assessments, intervention recommendations, scenario simulations, and follow-up Q&A.
- **Prompt Engineering**: Custom structured prompts enforce strict JSON output, parsed and validated with Zod schemas for type-safe, reliable results.
- **Development Assistance**: AI coding assistants were used during development to accelerate implementation.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A free [HuggingFace account](https://huggingface.co/join) with an API token

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/rin-dashboard-nextjs.git
cd rin-dashboard-nextjs

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and add your HuggingFace API key

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable     | Description                                                                    | Required |
| ------------ | ------------------------------------------------------------------------------ | -------- |
| `HF_API_KEY` | HuggingFace API token ([get one here](https://huggingface.co/settings/tokens)) | ✅ Yes   |

## 📖 Features

### Conversational AI Chat

Describe a student's situation in natural language and receive a structured risk assessment with contributing factors, explanations, and confidence scores.

### Intervention Recommendations

After an analysis, RIN generates prioritized intervention plans with specific action steps and expected impact — ready for parent meetings or IEP planning.

### Analytics Overview

View aggregated insights across all analyses: risk distribution, contributing factors breakdown, radar charts, and recent analysis history.

### Chat Persistence

Conversations are saved locally and accessible from the sidebar. Start new analyses or revisit past ones at any time.

### Settings & Data Management

Export all analyses as JSON, manage your profile, or clear all data — full control over your information.

## 👤 Team

| Role               | Name          |
| ------------------ | ------------- |
| **Solo Developer** | David Kasompe |

Design, development, AI integration, and deployment — all by one person.

## 🔮 Future Roadmap

- [ ] Database persistence (PostgreSQL) for multi-device access
- [ ] Teacher authentication and class-based student organization
- [ ] Batch analysis via CSV upload
- [ ] PDF report generation for parent meetings
- [ ] Fine-tuned model for higher accuracy dropout prediction
- [ ] Multi-language support for international schools
- [ ] Integration with existing LMS platforms (Canvas, Moodle)

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
