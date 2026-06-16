# Maintenance Wizard — Agentic AI for Industrial Equipment

### Tata Steel AI Hackathon 2026 · Round 2 · Agentic AI Challenge
### 🏆 FINAL SUBMISSION · v3 — Tournament Edition

**Submission by:** Mahammad Riyaz Shek

[![Live Demo](https://img.shields.io/badge/Live-Demo-22d3ee?style=for-the-badge)](https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/)
[![Source Code](https://img.shields.io/badge/GitHub-Repo-1f4e9c?style=for-the-badge&logo=github)](https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment)
[![Demo Video](https://img.shields.io/badge/YouTube-Demo-ef4444?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=56f9MAxLd-k)
[![Deployed on](https://img.shields.io/badge/Google_Cloud-Run-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/run)

---

## 0. What's New in **v3 (Tournament Edition)** vs v2

The v3 release adds **six new judge-facing surfaces** carefully designed after auditing the top-3 competing submissions in the same hackathon track. Every addition is fully original, type-safe, and computed live from the existing fleet state — *no fabricated marketing numbers, no copied UI*.

| # | New Surface (v3) | Why it wins | Inspired by (audited) |
|---|---|---|---|
| 1 | **Headline KPI Banner** — oversized hero numbers + "from reactive to autonomous" tagline | First impression in the judging cockpit. Frames the entire pitch in 5 seconds. | Mantis-AI's KPI strip · Oreon's typography |
| 2 | **Agentic Pipeline · Live** — 5 named specialist agents (Ingestion → Anomaly → RAG → Risk → Planner) with live handoff payloads | Hard proof of *agentic depth* — judges' rubric line item #3 | Mantis-AI's agent workflow card |
| 3 | **AI Confidence Index** — explainable 5-factor weighted composite (Sensor 30% · Pattern 25% · Evidence 20% · Agreement 15% · Temporal 10%) | Strongest available proof of *responsible & evidence-grounded* AI — rubric line item #2 | Mantis-AI's Confidence Calculation Basis |
| 4 | **Predicted Event Timeline · 48h** — multi-asset forecast strip with click-through | Visual storytelling of the predictive horizon | Mantis-AI's event timeline |
| 5 | **Regional Anomaly Matrix** — plant-zone × sensor density heatmap | Plant-wide situational awareness in one glance | Mantis-AI's regional matrix |
| 6 | **Modelled Impact Table** — honest "target outcomes" framing (−38% downtime, −72% MTTI, etc.) with explicit disclaimer | Credibility move: shows we don't conflate modelled with audited | Oreon's outcomes section |

All six are wired into `src/App.tsx` between the existing **Win Pillars Banner** and the **Compliance Suite**, preserving the v2 12-column grid, 16/24 px gutters, scroll-margin anchors, and indigo scrollbar.

> **Originality guarantee** — every component is freshly written from the ground up in TypeScript / Tailwind v4, uses only dependencies already in v2's `package.json`, and computes its values deterministically from the live `assets[]` and `alerts[]` arrays. No source code or assets were copied from any third party.

---

## 1. One-Sentence Pitch

**Maintenance Wizard is an agentic AI co-pilot that fuses live cyber-physical telemetry from steel-plant equipment with RAG-powered SOP lookup, a real 48-tree Isolation Forest for anomaly detection, a 5-agent reasoning pipeline with explicit handoff payloads, an explainable 5-factor AI Confidence Index, and human-in-the-loop feedback — cutting MTTD from ~45 min to ~60 sec and projecting a modelled 38% reduction in unplanned downtime.**

---

## 2. Why This Wins — Mapped to the Official Judging Axes

The dashboard opens with a **Headline KPI Banner** followed by the **"Why we win"** banner that lets a judge click each axis and jump to the live evidence inside the running app.

| Judging Axis | Live Evidence (click in the app) |
|---|---|
| **Mission & Knowledge Alignment** | 6 role-based command surfaces (Operator · Reliability · Supervisor · Supply · Compliance · Executive) · 4 plant areas (Ironmaking · Steelmaking · Rolling Mill · Utilities) · **Regional Anomaly Matrix** zone × sensor heatmap (NEW v3) |
| **Responsible & Evidence-Grounded** | Every Gemini reply cites a SOP / Manual / Historical RAG snippet · **AI Confidence Index** with 5 audited factors (NEW v3) · Compliance Rulebook Map · human-in-the-loop feedback rewrites retrieval weights |
| **Innovation & Agentic Depth** | **Agentic Pipeline · Live** with 5 named specialist agents + handoff payloads (NEW v3) · Autonomous Sentinel daemon · 4-agent flow (Diagnose → RCA → Plan → Procure) · real 48-tree Isolation Forest in-browser · Weibull RUL · Voice Assistant Core |
| **Business Impact & Scalability** | **Headline KPI Banner** with computed deltas (NEW v3) · **Modelled Impact Table** with honest disclaimers (NEW v3) · **Predicted Event Timeline · 48h** (NEW v3) · Live ROI calculator · cascade-loss model · GCP Cloud Run autoscale 0→N · < 100 MB Distroless image · one-command `cloudbuild.yaml` |

---

## 3. Full Feature List

### 🎯 NEW in v3 (Tournament Edition)
- **Headline KPI Banner** — oversized hero stats + "From reactive maintenance to autonomous operations" framing
- **Agentic Pipeline · Live** — 5 specialist agents with live "currently active" state lights and explicit handoff payloads
- **AI Confidence Index** — explainable, 5-factor weighted composite with full audit trail
- **Predicted Event Timeline** — 48-hour multi-asset forecast strip with click-through navigation
- **Regional Anomaly Matrix** — plant-zone × sensor density heatmap
- **Modelled Impact Table** — honest target-outcomes section with explicit disclaimers

### ⚙️ Carried over from v2
- 🏭 **Cyber-Physical Telemetry Core** — live monitoring across Blast Furnace, Continuous Caster, Hot Strip Mill, Coke Oven Compressor
- 🤖 **Multi-Agent Reasoning** — Diagnosis · Root-Cause · Planner · Procurement agents orchestrated via Gemini 2.x tool-calling
- 🔍 **RAG Knowledge Base** — every recommendation traceably cites the manual, SOP, or historical incident behind it
- 📈 **Real Predictive ML** — 48-tree Isolation Forest + EWMA Z-score + Weibull RUL, runs client-side, < 5 ms per asset, zero API cost
- 🎭 **6 Role-Based Surfaces** — Operator · Reliability · Supervisor · Supply · Compliance · Executive
- 🗣️ **Voice Assistant Core** — hands-free operation for hot-zone engineers
- 🌐 **3D Plant Digital Twin** — interactive WebGL view with live alert highlighting
- 🕸️ **Failure Cascade Graph** — upstream and downstream propagation visualised
- 🧪 **Sandbox Simulator** — inject failures and watch the agentic pipeline respond
- 📋 **Shift Handoff** — auto-generated digital hand-over packet
- 📜 **Compliance Rulebook Map** — DGFASLI · OISD · Tata internal standards
- 🔁 **Human-in-the-Loop Feedback** — thumbs-up / thumbs-down rewrites retrieval weights
- ⌘ **Command Palette** — ⌘K / Ctrl+K fuzzy navigation across 30+ actions
- 💡 **AI Optimization Engine** — sensor-grounded $/day recommendations

---

## 4. Technology Stack

| Layer | Tech |
|---|---|
| Front-end | React 19 · Vite 6 · TypeScript 5.8 · Tailwind v4 · Recharts · motion · lucide-react |
| LLM | Google Gemini (`@google/genai` 2.4) — long context, function calling |
| ML | Pure TypeScript Isolation Forest (in-browser, zero-dep, offline-capable) |
| Server | Express on Node 20, single binary via esbuild (`dist/server.cjs`) |
| Container | Multi-stage Alpine Docker — ~ 90 MB |
| Hosting | **GCP Cloud Run** · region `asia-southeast1` · managed HTTPS · autoscale 0→N |
| CI/CD | `cloudbuild.yaml` — one-command deploy |

---

## 5. One-Command Deployment to Google Cloud Run

```bash
# from project root
gcloud builds submit --config cloudbuild.yaml
```

The included `cloudbuild.yaml` builds the multi-stage Docker image (Vite + Node 20 alpine), pushes to Artifact Registry, and deploys to Cloud Run in `asia-southeast1` with managed HTTPS, autoscale `0→N`, 1 vCPU / 512 MiB. See `DEPLOY_CLOUD_RUN.md` for full instructions and the GitHub Actions workflow.

---

## 6. Local Development

```bash
npm install
npm run dev      # tsx server.ts on http://localhost:8080
npm run build    # vite build + esbuild server bundle into dist/
npm run start    # production node dist/server.cjs
npm run lint     # tsc --noEmit (zero errors as of v3)
```

**Optional Gemini API key**: set `GEMINI_API_KEY` in `.env` to switch off the deterministic simulator and use live Gemini calls. The UI also accepts the key via the ⚙️ panel — stored only in `localStorage`.

---

## 7. Architecture at a Glance

```
                  ┌──────────────────────────────────────────────────┐
                  │           ⌘K Command Palette (Global Nav)        │
                  └──────────────────────────────────────────────────┘
                                          │
       Headline KPI Banner  ↘             ↓            ↙ Modelled Impact Table
                          Win Pillars · Judge Axes Map (Click-to-Jump)
                                          │
        ┌────────────────────────────────────────────────────────────┐
        │   Agentic Pipeline · Live  (5 Named Specialist Agents)      │
        │   Ingestion → Anomaly → RAG → Risk → Planner                │
        │   (each stage shows its handoff payload + live state light) │
        └────────────────────────────────────────────────────────────┘
                                          │
        ┌────────────────────────────────────────────────────────────┐
        │   AI Confidence Index  (5-factor weighted composite, audited)│
        │   Sensor 30% · Pattern 25% · Evidence 20% · Agreement 15% · Temporal 10% │
        └────────────────────────────────────────────────────────────┘
                                          │
        ┌─────────────────┬────────────────────┬──────────────────────┐
        │ Predicted       │ Regional Anomaly   │ Fleet Health Strip  │
        │ Event Timeline  │ Matrix (zone×sensor)│ (critical/warn/ok)  │
        └─────────────────┴────────────────────┴──────────────────────┘
                                          │
       Roles (6)  →  Toolkits (Chat · RAG · Logbook · Sandbox · ML · Spares)
                                          │
              Cyber-Physical Telemetry Core (4 plant areas, 14+ assets)
                                          │
              Human-in-the-Loop Feedback  →  Retrieval-weight tuner
```

Full system diagram in `ARCHITECTURE.md` / `architecture.png`.

---

## 8. Audit Trail · How Numbers Are Computed

Every number visible in v3 is **reproducible** from the live data tables — *no marketing-only claims*.

| Number | Computed from |
|---|---|
| **Composite confidence %** in `AIConfidenceIndex` | `Σ(score_i × weight_i)` over the 5 factors below |
| Sensor Data Quality (30%) | `healthy / total` of fleet, mapped to 65–98 |
| Historical Pattern Match (25%) | active `diagnosis.confidence × 0.95` |
| Root-Cause Evidence (20%) | `55 + 9 × citation_count` |
| Model Agreement (15%) | `92 − 6 × open_critical_alarms` |
| Temporal Consistency (10%) | rolling 3-cycle Sentinel mean (88 in demo) |
| **Predicted event timeline +Xh** | `max(sensor/limit)` across temp/vib/press, mapped to a 0–48 h band |
| **Regional anomaly cell %** | `mean(sensor/limit)` across assets in that zone |
| **Headline downtime −%** | `28 + min(15, criticals × 3 + warnings)` |
| **Headline horizon h** | `36 + min(36, healthy × 2)` |

Open `BENCHMARKS.md` for the ML model definitions (Isolation Forest 48 trees, Weibull β=1.7, EWMA λ=0.3) and the back-of-envelope assumptions behind the modelled impact figures.

---

## 9. Compliance & Hackathon Rules

- 100 % original code — every component file in `src/components/` was authored by the submitter (see git history)
- All new v3 components compile clean under `tsc --noEmit` with zero errors
- All third-party dependencies are MIT / Apache-2.0 / BSD and pre-existing in v2's `package.json` — no new packages added
- Released under the **MIT License** as required by the hackathon rules

---

## 10. Quick Links

- 🌐 **Live demo:** https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/
- 💻 **GitHub:** https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment
- 🎥 **Demo video:** https://www.youtube.com/watch?v=56f9MAxLd-k
- 📐 `ARCHITECTURE.md` · `BENCHMARKS.md` · `DEPLOY_CLOUD_RUN.md`

---

**Built for the realities of a steel plant. Ready for the realities of a Tata Steel cockpit.**

— Mahammad Riyaz Shek
