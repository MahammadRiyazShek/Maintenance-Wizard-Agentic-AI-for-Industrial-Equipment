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

## 2. Why This Wins — Mapped to the Official Judging Axes

The dashboard now opens with a **"Why we win"** banner that lets a judge click each axis and jump to the live evidence inside the running app.

| Judging Axis | Live Evidence (click in the app) |
|---|---|
| **Mission & Knowledge Alignment** | 6 role-based command surfaces matching the Tata Steel maintenance org chart · 4 plant-area assets (Ironmaking · Steelmaking · Rolling Mill · Utilities) |
| **Responsible & Evidence-Grounded** | Every Gemini reply cites a SOP / Manual / Historical RAG snippet · human-in-the-loop feedback rewrites retrieval weights · Compliance Rulebook Map |
| **Innovation & Agentic Depth** | Autonomous **Sentinel** daemon + 4-agent flow (Diagnose → RCA → Plan → Procure) · real 48-tree Isolation Forest in-browser · Weibull RUL · Voice Assistant Core |
| **Business Impact & Scalability** | Live ROI calculator · cascade-loss model · GCP Cloud Run autoscale 0→N · < 100 MB Distroless image · one-command `cloudbuild.yaml` |

## 3. What's New in this Edition (vs. v1.0)

This is the **WINNING** revision. Original v1.0 surfaces are preserved 1:1; the additions below sharpen the judge experience:

1. **⌘K / Ctrl+K Command Palette** — instant fuzzy-search navigation across 30+ actions (roles · visualizers · toolkit tabs · compliance · external links). Indispensable on a high-density cockpit.
2. **Fleet Health Strip** — a single top-of-page row showing critical / warning / healthy counts, the top-risk asset spotlight, and click-to-jump chips for every asset.
3. **Win Pillars Banner** — judge-facing band that explicitly maps each of the 4 judging axes to evidence in the running UI.
4. **AI Optimization Engine** — deterministic, sensor-grounded $/day recommendations. Every figure is reproducible from the displayed sensor deltas — *no hallucinated marketing numbers.*
5. **Header quick-links** — GitHub, YouTube demo, and Cloud Run live URL accessible from every screen.
6. **Alignment polish** — unified 12-column grid, consistent 16 / 24 px gutters, scroll-margin anchors so anchor-jumps don't hide behind the header, and a custom indigo scrollbar for dense console panels.

## 4. Key Features (Full List)

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
- 🔁 **Human-in-the-Loop Feedback** — thumbs-up / thumbs-down rewrites retrieval weights.
- ⌘ **Command Palette (NEW)** — ⌘K / Ctrl+K fuzzy navigation.
- 💡 **AI Optimization Engine (NEW)** — sensor-grounded $/day recommendations.

## 5. Technology Stack

| Layer | Tech |
|---|---|
| Front-end | React 19 · Vite 6 · TypeScript 5.8 · Tailwind v4 · Recharts · motion |
| LLM | Google Gemini (`@google/genai` 2.4) — long context, function calling |
| ML | Pure TypeScript Isolation Forest (in-browser, zero-dep, offline-capable) |
| Server | Express on Node 20, single binary via esbuild |
| Container | Multi-stage Alpine Docker — ~ 90 MB |
| Hosting | GCP Cloud Run · region `asia-southeast1` · managed HTTPS · autoscale 0→N |
| CI/CD | `cloudbuild.yaml` — one-command deploy |

## 6. Architecture at a Glance

See `ARCHITECTURE.md` and `architecture.png` for the full system diagram.

```
                  ┌────────────────────────────────────────┐
                  │   ⌘K Command Palette  (Global Nav)    │
                  └────────────────────────────────────────┘
                                    │
        Roles (6)  →  Agentic Orchestration (4 agents)  →  RAG + ML + Rules
                                    │
              Cyber-Physical Telemetry Core (4 plant areas)
                                    │
              Human-in-the-Loop Feedback  →  Retrieval-weight tuner
```

## 7. Quantitative Benchmarks

| KPI | Baseline | With Wizard | Δ |
|---|---|---|---|
| MTTD | 35–50 min | **45–90 sec** | ↓ ~96 % |
| MTTR | 4–6 h | **1.5–2.5 h** | ↓ ~58 % |
| False alarm rate | 22 % | **6 %** | ↓ ~73 % |
| Engineer ramp-up | 6–9 months | **2–4 weeks** | ↓ ~85 % |
| Avoidable loss / incident | — | **≈ $66 000** | new |
| Annual savings / plant | — | **≈ $6.3 M** | new |

Math + assumptions are reproducible in `BENCHMARKS.md`.

## 8. Run It Locally

```bash
# 1. Install
npm install

# 2. Dev server (Vite + Express hot reload)
npm run dev
#    → http://localhost:8080

# 3. Production build & run
npm run build
npm start
#    → http://localhost:8080
```

Add an environment variable `GEMINI_API_KEY=<your-key>` to enable the live agentic flow. Without it, the cockpit boots in **Simulated Cognitive Core** mode (all visualizations still work; only the LLM diagnosis loop runs as a deterministic stub).

## 9. Deploy to Google Cloud Run (one command)

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY=$YOUR_GEMINI_KEY
```

That's it — the pipeline builds the multi-stage Docker image, pushes it to `gcr.io`, and deploys to Cloud Run in `asia-southeast1`. See **DEPLOY_CLOUD_RUN.md** for the full step-by-step including IAM, custom domain, and rollback.

## 10. Originality Statement

Every line of code in this repository was authored by the submitting team. Inspiration patterns observed in the broader competitive set (e.g. dashboard layouts, fleet-strip overviews, ⌘K palettes in modern enterprise SaaS) were re-implemented from scratch with our own design language, math, and code — no upstream forks, no copied components, no licensed templates beyond Tailwind, Recharts, lucide-react, and motion (all permissive open source).

---

**Built with rigor. Designed for production. Ready to win.**
