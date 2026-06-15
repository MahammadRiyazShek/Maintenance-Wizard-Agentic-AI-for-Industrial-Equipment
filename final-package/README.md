# Maintenance Wizard — Agentic AI for Industrial Equipment

**Tata Steel AI Hackathon 2026 — Round 2 (Agentic AI Challenge)**
Problem Statement: *Maintenance Wizard for Industrial Equipment*

A production-grade, context-aware agentic AI decision-support cockpit for
steel-plant maintenance teams. It fuses live cyber-physical telemetry
from Blast Furnaces, Continuous Casters, Rolling Mills and Utilities with
a real on-device **Isolation Forest anomaly engine** (48 trees, harmonic
c-factor, peer + history training), **RAG-grounded SOP retrieval**, a
**Maintenance Priority Index (MPI)** ranking every asset, a
**cascade-dependency graph** showing how a single failure propagates
downstream, and a **business-impact panel** that converts every alarm
into avoidable-loss dollars.

---

## ✨ Core capabilities mapped to the hackathon brief

| Hackathon requirement | Where it lives |
| --- | --- |
| Contextual reasoning via LLM | `src/utils/geminiClient.ts` — Gemini-powered multi-turn diagnosis |
| Knowledge integration (manuals, SOPs, logs) | `src/components/KBBrowser.tsx`, `LogbookBrowser.tsx` + RAG citations in `DiagnosisReport` |
| Natural-language, multi-turn chat | `src/components/SupportChat.tsx` |
| Explainable recommendations | `DiagnosisReport.tsx` shows MPI math, factor weights, and citation IDs |
| Abnormality detection & failure prediction | `src/utils/assetAnalytics.ts` (real Isolation-Forest impl) |
| Risk classification / urgency | `RiskPrioritizationMatrix.tsx` + `BusinessImpactPanel.tsx` |
| Spares & lead-time prioritisation | `SparesProcurementPanel.tsx` |
| Real-time alerting | `AlertList.tsx` + Sentinel Agent loop in `App.tsx` |
| Feedback loop | Engineer feedback stored via `ClientStore.saveFeedback()` |
| Reporting & digital logbook | `ReportingIncidentCenter.tsx`, `LogbookBrowser.tsx` |
| Cascade & dependency reasoning (✨ new) | `CascadeDependencyGraph.tsx` |

---

## 🏗️ Architecture overview

```
┌──────────────────────────────────────────────────────────────┐
│                       React + Vite UI                         │
│  Cinematic Landing → Operations Cockpit → Role-based Surfaces │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                     Express server (Node)                     │
│  • /api/diagnose   → calls Gemini 2.x with RAG context        │
│  • /api/chat       → multi-turn troubleshooting agent         │
│  • /api/store      → server-side persistence (data_store.ts)  │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│       On-device ML  (src/utils/assetAnalytics.ts)             │
│  Isolation Forest (48 trees, c-factor harmonic norm)          │
│      ↓                                                        │
│  Anomaly score → Failure prob → RUL → Cascade exposure        │
│      ↓                                                        │
│  MPI = w1·P(fail) + w2·Safety + w3·PlantImpact                │
│       + w4·Criticality + w5·SpareScarcity + w6·LeadTime       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Run locally

**Prerequisites:** Node.js ≥ 18 and a Google Gemini API key.

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev          # http://localhost:5173
```

For a production build:

```bash
npm run build
npm start            # serves dist/ via Express on $PORT (default 8080)
```

---

## ☁️ Deploy to Google Cloud Run

```bash
# 1. Build & push image (replace PROJECT_ID and REGION)
gcloud builds submit --tag gcr.io/PROJECT_ID/maintenance-wizard .

# 2. Deploy to Cloud Run
gcloud run deploy maintenance-wizard \
  --image gcr.io/PROJECT_ID/maintenance-wizard \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_gemini_key \
  --port 8080
```

The included `Dockerfile` uses `node:20-slim`, runs `npm run build`, and
serves on `$PORT` (Cloud Run injects 8080 automatically).

---

## 🧠 What makes this submission original

1. **Real on-device Isolation Forest** — not a fake claim. 48 trees, seeded
   RNG, harmonic c-factor normalisation, trained at runtime on each asset's
   history + peer baselines. See `src/utils/assetAnalytics.ts`.
2. **Maintenance Priority Index (MPI)** — a transparent six-factor utility
   score with visible weights and breakdown table, not a black-box rank.
3. **Cascade Dependency Graph** — visually shows how Ironmaking →
   Steelmaking → Rolling Mill flows propagate failure exposure across the
   plant. Selecting any asset highlights the downstream area chain.
4. **Business Impact Panel** — converts the $22 K/hour downtime claim into
   a calculated *avoidable loss* per alarm × intervention window.
5. **Closed feedback loop** — engineer corrections are stored and tagged
   so future diagnoses learn from human-in-the-loop reviews.
6. **No fake model claims** — every advertised model in the UI has a
   matching implementation in `src/utils/`.

---

## 📁 Project layout

```
.
├── Dockerfile              · Cloud-Run-ready build
├── server.ts               · Express server (Gemini + RAG + storage API)
├── server/data_store.ts    · Server-side persistence helpers
├── src/
│   ├── App.tsx             · Operations cockpit (role-aware)
│   ├── components/         · 22 UI surfaces (alerts, KB, RAG, MPI, etc.)
│   └── utils/
│       ├── assetAnalytics.ts   · Real Isolation Forest + MPI math
│       ├── dataStore.ts        · Client-side asset/alert/KB store
│       └── geminiClient.ts     · LLM client + RAG prompts
├── package.json
└── README.md (this file)
```

---

## 🎬 Demo

Live deployment: <https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/>

Recorded walkthrough: <https://www.youtube.com/watch?v=56f9MAxLd-k>

Repository: <https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment>

---

© 2026 · Built for Tata Steel AI Hackathon Round 2 · Agentic AI Challenge
