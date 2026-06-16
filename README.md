<div align="center">

# Maintenance Wizard
### Agentic AI for Industrial Equipment

**From Alarm to Action — in Seconds.**
  
Problem Statement: *Maintenance Wizard for Industrial Equipment*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloud%20Run-4285F4?logo=googlecloud&logoColor=white)](https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/)
[![Video Walkthrough](https://img.shields.io/badge/Video-YouTube-red?logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=56f9MAxLd-k)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node%20%2B%20Gemini-success)](#-technical-architecture)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

</div>

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Problem Statement Alignment](#-problem-statement-alignment)
3. [Key Features](#-key-features)
4. [Technical Architecture](#-technical-architecture)
5. [Repository Layout](#-repository-layout)
6. [How to Run (Live Deployment)](#-option-1--use-the-live-deployment)
7. [How to Run (Locally from Source)](#-option-2--run-locally-from-source)
8. [Environment Variables](#-environment-variables)
9. [Agentic Workflow Walkthrough](#-agentic-workflow-walkthrough)
10. [Industrial Impact & ROI](#-industrial-impact--roi)
11. [Originality & Attribution Statement](#-originality--attribution-statement)
12. [Author](#-author)
13. [License](#-license)

---

## 🧠 Project Overview

**Maintenance Wizard** is a context-aware **Agentic AI** engineered for heavy industrial manufacturing environments — purpose-built for the realities of a steel plant.

It bridges the critical gap between **raw cyber-physical telemetry** and **actionable engineering execution**. By fusing live sensor data from high-stakes assets (Blast Furnaces, Continuous Casters, Rolling Mills, Coke Oven Compressors) with **RAG-powered** manual lookups, **predictive analytics**, and **automated Root Cause Analysis (RCA)**, the system transforms chaotic control-room alarms into **traceable, step-by-step mitigation workflows** — minimizing unplanned downtime and protecting high-value equipment.

> 💡 In a typical integrated steel plant, unplanned downtime on a critical line can cost up to **$22,000 per hour**. Maintenance Wizard's job is to compress the time between *"alarm fires"* and *"correct action taken"* from hours to seconds.

---

## 🎯 Problem Statement Alignment

 *"Intelligent AI-powered maintenance decision-support system that helps engineers diagnose equipment issues, identify root causes, predict failures, assess risks, prioritize maintenance actions, and generate actionable recommendations using data from equipment logs, sensor alerts, manuals, SOPs, and historical maintenance records — with natural-language interaction, explainable insights, proactive planning, and continuous learning."*

This implementation maps to every requirement:

| Requirement from the Problem Statement | Where it is implemented in this repo |
|---|---|
| Diagnose equipment issues | `runAssetDiagnosis()` in `src/utils/geminiClient.ts` + `/api/diagnose` route in `server.ts` |
| Identify root causes | `DiagnosticResult.rootCauseAnalysis` schema in `src/types.ts`, rendered by `DiagnosisReport.tsx` |
| Predict failures (Remaining Useful Life) | `DiagnosticResult.remainingUsefulLife` (hours + risk classification) |
| Assess risks & prioritize | `priorityAnalysis` block with `riskClassification`, `urgencyScore`, `bottleneckStatus`, spares & lead-time factors |
| Actionable recommendations | `maintenancePlan` produced by the agent and shown step-by-step |
| Equipment logs, sensor alerts, manuals, SOPs | `server/data_store.ts` (telemetry + alerts) and `INITIAL_KB_DOCUMENTS` (SOPs, manuals, spare DB) |
| Natural-language interaction | `SupportChat.tsx` + `askWizardChat()` multi-turn agent bound to active asset/alarm context |
| Explainable insights | Every diagnosis cites the KB documents it used (`KBBrowser.tsx` + RAG citations) |
| Proactive maintenance planning | `PlantFlowVisualizer.tsx` cascading bottleneck view + `SandboxSimulator.tsx` "what-if" telemetry |
| Continuous improvement via feedback | `EngineerFeedback` capture in `DiagnosisReport.tsx` → persisted via `/api/feedback` + Logbook |

---

## ⚙️ Key Features

- **🛰️ Cyber-Physical Telemetry Core** — Real-time monitoring of Temperature, Vibration, Pressure, and Flow Rate across 4 critical steel-plant nodes (Ironmaking / Steelmaking / Rolling / Utilities) with per-asset **delay-cost in $/hr** for cost-aware triage.
- **🚨 Live Alarm Ticker** — Severity-tagged active alarms (CRITICAL / HIGH / MEDIUM / LOW) that the engineer can click to **bind diagnostic context** directly into the agent.
- **🤖 Agentic Diagnosis & Multi-Turn Troubleshooting** — A conversational AI assistant that automatically inherits the active alarm/asset context, so the engineer never has to re-explain what they are looking at.
- **📚 RAG-Driven Knowledge Base** — Parses SOPs, equipment manuals, safety protocols, and a spare-parts catalogue, returning **traceable citations** for every recommendation.
- **🔮 Predictive Diagnostics & RCA** — Returns probable fault, confidence %, contributing sensors, process defects, Remaining Useful Life (hours), and catastrophic-failure risk class.
- **🪜 Step-by-Step Maintenance Plan** — Ordered isolation / inspection / repair / verification steps with required spares and lead times.
- **🧑‍🔧 Human-in-the-Loop Feedback** — Engineers can 👍 / 👎 every AI plan, add a note, and the result is logged into the digital logbook for continuous learning.
- **🧪 Sandbox Simulator** — Manually perturb telemetry on any asset and re-run the agent to test "what-if" failure scenarios safely.
- **📝 Shift Handoff Modal** — One-click summary of open alarms, active diagnoses, and pending actions for the next shift.

---

## 🏗️ Technical Architecture

```
                ┌────────────────────────────────────────────┐
                │           React + Vite + TS UI             │
                │  (PlantFlowVisualizer, AlertList, Asset    │
                │   Selector, DiagnosisReport, SupportChat,  │
                │   KBBrowser, LogbookBrowser, Sandbox)      │
                └────────────────────┬───────────────────────┘
                                     │  REST / JSON
                ┌────────────────────▼───────────────────────┐
                │     Express + TypeScript Backend           │
                │  /api/diagnose  /api/chat  /api/feedback   │
                │  /api/telemetry /api/alerts /api/kb        │
                └────────────────────┬───────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
   ┌──────────▼──────────┐ ┌─────────▼─────────┐ ┌──────────▼─────────┐
   │  In-Memory Data     │ │  RAG Retriever    │ │  Google Gemini     │
   │  Store              │ │  over KB Docs     │ │  (@google/genai)   │
   │  (assets, alerts,   │ │  (SOPs, manuals,  │ │  Reasoning + tool  │
   │   logbook, KB,      │ │   spare DB)       │ │  calling + RCA     │
   │   feedbacks)        │ │                   │ │  + RUL + plan      │
   └─────────────────────┘ └───────────────────┘ └────────────────────┘
```

**Stack**

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Vite + React 19 + TypeScript** | Fast HMR, dense industrial-grade dashboards, strict typing for safety-critical UI |
| Styling | **Tailwind CSS 4** + `lucide-react` | Consistent industrial visual language |
| Backend | **Node.js + Express + TypeScript** | Lightweight, easy to containerize for Cloud Run |
| AI Engine | **Google Gemini 2.5 Flash** via `@google/genai` | Long-context manual ingestion + structured-JSON tool calls |
| Deployment | **Google Cloud Run** (`asia-southeast1`) | Serverless, scales to zero, fits hackathon ops budget |
| Persistence | In-memory store on server + `localStorage` mirror on client | Sufficient for a hackathon prototype; swappable for Postgres/Vector DB in production |

---

## 📁 Repository Layout

```
.
├── index.html                  # Vite entry
├── package.json                # Scripts: dev / build / start / lint / clean
├── vite.config.ts              # Vite + Tailwind config
├── tsconfig.json
├── .env.example                # Template for required environment variables
├── server.ts                   # Express server, Gemini wiring, REST routes
├── server/
│   └── data_store.ts           # Steel-plant assets, alarms, KB docs, logbook (seed data)
└── src/
    ├── main.tsx                # React entry
    ├── App.tsx                 # Top-level layout & state orchestration
    ├── index.css               # Tailwind + global styles
    ├── types.ts                # Domain types: Asset, Alert, DiagnosticResult, …
    ├── components/
    │   ├── AssetSelector.tsx        # Plant Assets Telemetry Core (clickable nodes)
    │   ├── AlertList.tsx            # Active Alarms Ticker
    │   ├── DiagnosisReport.tsx      # Agentic Diagnosis & Planning panel
    │   ├── SupportChat.tsx          # Interactive Troubleshooter (chat)
    │   ├── KBBrowser.tsx            # RAG knowledge-base inspector
    │   ├── LogbookBrowser.tsx       # Digital logbook / audit trail
    │   ├── PlantFlowVisualizer.tsx  # Bottleneck & delay cascade view
    │   ├── SandboxSimulator.tsx     # "What-if" telemetry sandbox
    │   ├── ShiftHandoffModal.tsx    # End-of-shift summary
    │   └── SystemDocumentation.tsx  # In-app architecture/help
    └── utils/
        ├── dataStore.ts        # Client-side persistence + seed KB
        └── geminiClient.ts     # Gemini REST client, prompts, JSON schemas
```

---

## ▶️ Option 1 — Use the Live Deployment

> **Recommended** — zero setup, ready in under a minute.

1. Open **<https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/>**
2. In the **Plant Assets Telemetry Core**, click any of the 4 asset nodes:
   - `Blast Furnace #4 Tuyere System` (Ironmaking, $18,500/hr)
   - `Continuous Caster Mould Oscillator #2` (Steelmaking, $14,200/hr)
   - `Hot Strip Mill Roughing Stand Work Roll Bearing #1` (Rolling, $22,000/hr)
   - `Coke Oven Gas Compressor #3 Main Rotor` (Utilities, $9,500/hr)
3. *Or* click an entry in the **Active Alarms Ticker** (`ALT-001 CRITICAL` or `ALT-002 MEDIUM`) to bind diagnostic context to the chat.
4. Use the **Interactive Troubleshooter** on the right to ask questions in plain English, e.g.:
   - *"What's the recommended SOP for tuyere over-temperature?"*
   - *"Is there a spare SMS roller bearing in stock?"*
   - *"What is the safest immediate action?"*
5. Inspect the **Agentic Diagnosis & Planning** panel for the traceable SOP analysis, RUL estimate, and step-by-step plan.
6. Open the **KB** tab to verify which manuals/SOPs were cited (explainability check).

---

## 🛠️ Option 2 — Run Locally from Source

**Prerequisites**
- Node.js v18 or higher
- A Google **Gemini API key** ([get one here](https://aistudio.google.com/app/apikey))

**Steps**

```bash
# 1. Clone the repository
git clone https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment.git
cd Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment

# 2. Install dependencies
npm install

# 3. Configure your Gemini API key
cp .env.example .env.local
#   then edit .env.local and set:
#   GEMINI_API_KEY="your_gemini_api_key_here"

# 4. Run in development mode
npm run dev

# 5. Open the app
#    http://localhost:3000   (Express + Vite middleware)
```

**Production build**

```bash
npm run build      # bundles client (Vite) + server (esbuild)
npm start          # serves dist/server.cjs
```

**Useful scripts**

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Express + Vite dev server with HMR |
| `npm run build` | Builds the React client and bundles the Node server |
| `npm start` | Runs the built production server |
| `npm run lint` | Type-checks the entire project (`tsc --noEmit`) |
| `npm run clean` | Removes the `dist/` build output |

---

## 🔐 Environment Variables

Defined in `.env.example` — copy to `.env.local` before running locally:

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Server-side key used by `@google/genai` for diagnosis, chat, RCA, RUL |
| `APP_URL` | Optional | Public URL of the deployed app (used for self-referential links) |

> The app also supports a **fallback client-side API key** entered through the in-app *Settings → Key* panel. This is stored only in the browser's `localStorage` (`ts_mw_api_key`) and never transmitted anywhere except directly to Google's Generative Language endpoint.

---

## 🔁 Agentic Workflow Walkthrough

1. **Sense** — `server/data_store.ts` streams synthetic telemetry (temperature, vibration, pressure, flow) for each asset; thresholds are evaluated on every tick.
2. **Detect** — When a threshold is breached, an entry appears in the **Active Alarms Ticker** with severity and a $/hr delay penalty.
3. **Bind Context** — The engineer clicks the alarm. The agent automatically captures `{ asset, telemetry snapshot, alert message, recent history }` as its working memory.
4. **Retrieve** — `getRelevantKBDocs()` performs lexical RAG over manuals / SOPs / spare DB and stitches the matched documents into the prompt.
5. **Reason** — Gemini is invoked with a strict **JSON response schema** (see `src/types.ts → DiagnosticResult`) so the output is always structured: probable fault, confidence, RCA, RUL, priority analysis, maintenance plan, citations.
6. **Act / Advise** — The plan is rendered step-by-step in `DiagnosisReport.tsx`; the engineer can copy it, hand it off, or drill into any cited document.
7. **Learn** — 👍 / 👎 + optional note is captured as `EngineerFeedback`, written to the logbook, and used to bias future retrievals/prompts (continuous improvement loop).

---

## 💰 Industrial Impact & ROI

| Lever | Mechanism | Estimated impact |
|---|---|---|
| **Reduce MTTR** | Localized RAG over SOPs replaces 1000+ page manual hunts | Minutes saved per incident; on critical lines this directly avoids $22K/hr losses |
| **Prevent catastrophic failure** | Vibration / temperature trend alerts before threshold breach | Avoids unplanned shutdowns and asset replacement costs (3–5× of planned maintenance) |
| **Knowledge retention** | Every troubleshooting session is captured into the digital logbook | Mitigates tribal-knowledge loss as senior engineers retire |
| **Alarm-fatigue mitigation** | Cost-weighted prioritization (`delayCostPerHour`, `urgencyScore`) | Engineers focus on what hurts the P&L first |

---

## ✅ Originality & Attribution Statement

This project was **built entirely during the Tata Steel AI Hackathon 2026 — Round 2** by the author below, in compliance with the hackathon rules.

**What is original to this submission**
- The agentic workflow design (alarm-bind → RAG → structured-JSON diagnosis → human-in-the-loop feedback).
- The steel-plant domain modelling: asset taxonomy, telemetry schema, alarm semantics, KB seed corpus (SOPs / manuals / spare DB), priority-and-bottleneck scoring.
- All UI components in `src/components/*` and the orchestration in `App.tsx`.
- The Gemini prompt design and the strict JSON response schemas in `src/types.ts` and `src/utils/geminiClient.ts`.
- The Express REST surface in `server.ts` and the in-memory data store in `server/data_store.ts`.

**Third-party components used (open source, with their own licenses)**
- React, Vite, TypeScript, Tailwind CSS, Express, dotenv, lucide-react, motion, esbuild, tsx.
- Google's official `@google/genai` SDK for invoking the Gemini API.

**Data**
- All telemetry, alarms, KB documents, and logbook entries are **synthetic data** generated for this prototype. No proprietary or confidential plant data is used.

**AI Tools**
- Coding assistants (e.g., LLM-based IDE helpers) may have been used to accelerate boilerplate writing, in the same way a developer would use auto-complete or Stack Overflow. All architectural decisions, domain modelling, prompts, and integration logic were authored and reviewed by the participant.

If any reviewer needs a deeper originality audit (commit-history walkthrough, dependency-license report, etc.), I am happy to provide it on request.

---

## 👤 Author

**Mahammad Riyaz Shek** — *Solo participant, Tata Steel AI Hackathon 2026*  
🔗 GitHub: <https://github.com/MahammadRiyazShek>  
🎬 Demo video: <https://www.youtube.com/watch?v=56f9MAxLd-k>  
🌐 Live prototype (Google Cloud Run): <https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/>

🌐 Live prototype (Vercel): <https://maintenance-wizard-agentic-ai-for-industrial-equipment.vercel.app/>

---

## 📜 License

Released under the **MIT License** — see `LICENSE` for details. The intellectual property of the code belongs to the author, in accordance with the hackathon rules.

---

<div align="center">

**Maintenance Wizard** • *From Alarm to Action — in Seconds.*  

</div>
