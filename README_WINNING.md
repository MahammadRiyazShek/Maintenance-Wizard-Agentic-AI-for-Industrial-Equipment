# Maintenance Wizard — Agentic AI for Industrial Equipment
### Tata Steel AI Hackathon 2026 · Round 2 · Agentic AI Challenge
**Submission by:** Mahammad Riyaz Shek

[![Live Demo](https://img.shields.io/badge/Live-Demo-22d3ee?style=for-the-badge)](https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/)
[![Source Code](https://img.shields.io/badge/GitHub-Repo-1f4e9c?style=for-the-badge&logo=github)](https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment)
[![Demo Video](https://img.shields.io/badge/YouTube-Demo-ef4444?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=56f9MAxLd-k)
[![Deployed on](https://img.shields.io/badge/Google_Cloud-Run-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/run)

---

## 1. One-Sentence Pitch

**Maintenance Wizard is an agentic AI co-pilot that fuses live cyber-physical telemetry from steel-plant equipment with RAG-powered SOP lookup, a real 48-tree Isolation Forest for anomaly detection, multi-agent reasoning, and human-in-the-loop feedback — cutting MTTD from ~45 min to ~60 sec and projecting ~$6.3 M / plant annual savings.**

## 2. Why This Wins — At-a-Glance

| Judging Axis | Evidence |
|---|---|
| **Problem understanding** | All five expected output families (diagnosis / RCA / RUL / risk / plan) delivered as first-class UI surfaces |
| **Agentic AI depth** | Diagnosis → RCA → Planner → Procurement multi-agent flow with Gemini tool-calling |
| **Technical implementation** | 14,000 + LoC TypeScript, real Isolation Forest math, 23 React components |
| **Scalability** | GCP Cloud Run, autoscale 0 → N, containerised Distroless image |
| **Real-world applicability** | 6 role-based command surfaces match actual Tata Steel maintenance org chart |
| **Presentation** | Cinematic landing, 3D digital twin, voice assistant, polished pitch deck |
| **Business impact** | Live ROI calculator, $66 K/incident saved, 96 % MTTD reduction, see **BENCHMARKS.md** |

## 3. Key Features

- 🏭 **Cyber-Physical Telemetry Core** — live monitoring across Blast Furnace, Continuous Caster, Hot Strip Mill, Coke Oven Compressor.
- 🤖 **Multi-Agent Reasoning** — Diagnosis · Root-Cause · Planner · Procurement agents orchestrated via Gemini 2.x tool-calling.
- 🔍 **RAG Knowledge Base** — every recommendation traceably cites the manual, SOP, or historical incident behind it.
- 📈 **Real Predictive ML** — 48-tree Isolation Forest + EWMA Z-score + Weibull RUL — runs client-side, < 5 ms per asset, zero API cost.
- 🎭 **6 Role-Based Surfaces** — Operator · Reliability · Supervisor · Supply · Compliance · Executive.
- 🗣️ **Voice Assistant Core** — hands-free operation for hot-zone engineers.
- 🌐 **3D Plant Digital Twin** — interactive WebGL view with live alert highlighting.
- 🕸️ **Failure Cascade Graph** — upstream and downstream propagation visualised.
- 🧪 **Sandbox Simulator** — inject failures and watch the agentic pipeline respond.
- 📋 **Shift Handoff** — auto-generated digital hand-over packet.
- 📜 **Compliance Rulebook Map** — DGFASLI · OISD · Tata internal standards.
- 🔁 **Human-in-the-Loop Feedback** — thumbs-up/down rewrites retrieval weights and feeds the monthly fine-tune.

## 4. Technology Stack

| Layer | Tech |
|---|---|
| Front-end | React 19 · Vite · TypeScript · Tailwind v4 · Recharts · motion |
| LLM | Google Gemini (`@google/genai` 2.4) — long context, function calling |
| ML | Pure TypeScript Isolation Forest (in-browser, zero-dep, offline-capable) |
| Server | Express on Node 18, single binary via esbuild |
| Container | Distroless multi-stage Docker — < 100 MB |
| Hosting | GCP Cloud Run · region asia-southeast1 · managed HTTPS · autoscale |
| CI/CD | `cloudbuild.yaml` — one-command deploy |

## 5. Architecture at a Glance

See `ARCHITECTURE.md` and `architecture.png` for the full system diagram.

```
Roles (6)  →  Agentic Orchestration (4 agents)  →  RAG + ML + Rules
                                                          │
                              Cyber-Physical Telemetry Core (4 assets)
                                                          │
                            Human-in-the-Loop Feedback (closes the loop)
```

## 6. Quantitative Benchmarks

| KPI | Baseline | With Wizard | Δ |
|---|---|---|---|
| MTTD | 35–50 min | **45–90 sec** | ↓ 96 % |
| MTTR | 4–6 h | **1.5–2.5 h** | ↓ ~58 % |
| False alarm rate | 22 % | **6 %** | ↓ 73 % |
| Engineer ramp-up | 6–9 months | **2–4 weeks** | ↓ ~85 % |
| Avoidable loss / incident | — | **≈ $66 000** | new |
| Annual savings / plant | — | **≈ $6.3 M** | new |

Math + assumptions are reproducible in `BENCHMARKS.md`.

## 7. Run It

### Option A — Live Deployment (recommended for reviewers)
Open https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/

### Option B — Local
```bash
git clone https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment
cd Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment
npm install
echo "GEMINI_API_KEY=your_key_here" > .env.local
npm run dev   # http://localhost:5173
```

### Option C — Deploy to Cloud Run
```bash
gcloud builds submit --config cloudbuild.yaml
```
(See `DEPLOY_CLOUD_RUN.md` for the full one-command flow.)

## 8. Deliverables Map (per problem statement § 9)

| Required | Where |
|---|---|
| Source code | This repo + `Source Code` attachment |
| System architecture doc | `ARCHITECTURE.md` + `architecture.png` |
| Tech stack | This README § 4 |
| Data flow / system flow | `ARCHITECTURE.md` § 2 |
| Model design / reasoning pipeline | `BENCHMARKS.md` § 1, § 2 |
| Alerting & prediction logic | `src/utils/assetAnalytics.ts`, server.ts `/api/alerts` |
| Assumptions & limitations | `ARCHITECTURE.md` § 6 |
| Install / config / run | This README § 7 |
| Sample input / output | `SandboxSimulator` panel in the live UI |
| Screen recording | https://www.youtube.com/watch?v=56f9MAxLd-k |

## 9. Honest Acknowledgements

- Telemetry is **simulated** via `data_store.ts` + `SandboxSimulator`. The endpoint signature is identical to what an OPC-UA / MQTT bridge would post — production cut-over is a single-file change.
- Gemini API key is required only for natural-language reasoning. The ML scoring, RUL calculation, and dashboards all work **without** an API key (graceful degradation).
- The Isolation Forest is re-trained per request from current + peer assets. For production, persist a long-horizon model and retrain nightly.

## 10. License

This submission's intellectual property belongs to its author per HackerEarth / Tata Steel Hackathon rules.

---

*Built end-to-end during the Round 2 window (5 – 15 Jun 2026, Asia/Kolkata).*
