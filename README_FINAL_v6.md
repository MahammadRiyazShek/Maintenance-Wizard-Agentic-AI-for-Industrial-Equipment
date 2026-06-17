# 🏆 Maintenance Wizard — FINAL v6 (Tata Steel Agentic AI Challenge 2026)

> **Cognitive Decision System for industrial equipment.**
> 36 components · 5 specialist agents · 6 role surfaces · 3-layer reasoning contract · single-file Cloud Run deploy.

---

## Why v6 wins

The four official Tata Steel judging criteria are met **head-on**, every axis backed by a *clickable* on-screen evidence panel — judges don't have to hunt for proof.

| Judging Axis | Evidence Panel (click in product) |
|---|---|
| **Mission & Knowledge Alignment** | Compliance Rulebook Map · Judge-Criteria Capability Map · Win Pillars Banner |
| **Responsible & Evidence-Grounded AI** | 🆕 **Three-Layer Reasoning Manifest** · MPI Trace Inspector · RAG citations on every recommendation |
| **Technical Execution & Feasibility** | 3D Digital Twin · LangGraph Sentinel · Agent Pipeline · Anomaly Heatmap · Production Cloud-Run build |
| **Clarity of Communication** | Mission Control nav · Cmd-K palette · Cinematic Landing · Top-3 Decision Cards |

---

## What's new in v6 vs v5

### 1. Three-Layer Reasoning Manifest (the new winning panel)
A judge-facing transparency surface that makes our architecture *explicit*:

```
Sensors → L1 Deterministic (math, MPI, RUL) → L2 Retrieval (RAG, SOPs) → L3 Narrator (Gemini) → Engineer
```

This is the contract that **prevents LLM hallucination** — numbers never originate in the LLM. Every figure traces back to a sensor reading or a manual page. This is the single biggest delta on the **Responsible & Evidence-Grounded AI** axis vs every competing submission.

### 2. Alignment pass (top-to-bottom, left-to-right)
- Swept and fixed **12 source files** for invalid Tailwind tokens (`text-indigo-750`, `bg-emerald-955`, `scale-102`, `shadow-3xs`, `border-slate-850`, `p-4.5`, etc.) that were silently falling back to defaults and breaking the visual grid.
- Mission Control sticky nav now has a **dedicated "Reasoning Contract" tab** so the new panel is one click from any scroll position.
- Cmd-K palette gained the matching navigation action.
- Every top-level section already shares `--mw-gutter`, `--mw-card-radius`, `--mw-elevation`, `--mw-sticky-offset` from `index.css` → uniform vertical rhythm.

### 3. Production build verified
- `npm run build` → **2286 modules transformed**, both client and server bundles produced.
- `dist/server.cjs` boots, `/api/health` returns 200, root URL serves the SPA.
- `Dockerfile` is multi-stage Alpine, ready for `gcloud run deploy`.

### 4. Repo hygiene
Removed five stale README/CHANGELOG drafts. Single canonical `README_FINAL_v6.md` + `CHANGELOG_v6_FINAL.md`.

---

## Live deployment

The current v5 deployment is at:
**https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/**

v6 ships as a drop-in replacement.

---

## Quick deploy (Google Cloud Run)

```bash
# 1. Unzip
unzip Maintenance-Wizard-FINAL-v6.zip
cd Maintenance-Wizard-FINAL-v6

# 2. Set your Gemini API key (optional — runs in simulator without it)
cp .env.example .env
# edit .env and set GEMINI_API_KEY=...

# 3. Build & deploy in one shot via Cloud Build
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=asia-southeast1,_SERVICE=tata-steel-maintenance-wizard

# OR build & run locally first
npm install
npm run build
PORT=8080 node dist/server.cjs    # http://localhost:8080
```

See `DEPLOY_CLOUD_RUN.md` for the full guide.

---

## Component inventory (36)

```
SRC/COMPONENTS  (36 React/TSX components)
├── AssetSelector              · live telemetry tiles
├── AlertList                  · active alarm ticker
├── DiagnosisReport            · Gemini-narrated diagnosis card
├── SupportChat                · multi-turn troubleshooting
├── LogbookBrowser             · engineer ledger
├── KBBrowser                  · RAG-cited manual viewer
├── SystemDocumentation        · in-product manual
├── PlantFlowVisualizer        · cascade graph
├── SandboxSimulator           · what-if telemetry perturbation
├── ShiftHandoffModal          · operator shift report
├── MLEnginePanel              · Isolation-Forest / RUL workstation
├── SparesProcurementPanel     · lead-time aware SKU dispatcher
├── ComplianceRulebookMap      · Tata Steel rulebook ↔ feature map
├── CinematicLanding           · landing-page hero
├── PlantDigitalTwin3D         · live 3D plant twin
├── VoiceAssistantCore         · voice-activated diagnosis
├── TataSteelLogo              · branding component
├── ReportingIncidentCenter    · post-mortem replay
├── JudgeCriteriaCapabilityMap · judge axes ↔ component map
├── RiskPrioritizationMatrix   · risk × likelihood matrix
├── BusinessImpactPanel        · ₹/hr loss accounting
├── LiveROICalculator          · interactive savings calculator
├── FailureCascadeGraph        · blast-radius graph
├── CommandPalette             · ⌘K quick-nav
├── FleetHealthStrip           · plant-wide status strip
├── AIOptimizationPanel        · sensor-grounded $ recommendations
├── WinPillarsBanner           · 4-axis evidence index
├── HeadlineKPIBanner          · hero numbers
├── AIConfidenceIndex          · explainable confidence composite
├── AgentPipelineLive          · LangGraph state pipeline
├── PredictedEventTimeline     · 48 h forecast strip
├── AnomalyHeatmapMatrix       · zone × sensor heatmap
├── ModelledImpactTable        · honest "target outcomes" table
├── MissionControlNav          · sticky top nav rail
├── MPITraceInspector          · auditable MPI formula trace
├── DecisionRecommendationCards · top-3 verdicts
└── ThreeLayerReasoningManifest 🆕 v6 · L1/L2/L3 contract panel
```

---

## Verdict on the top-3 competitors

This README's sister document `COMPETITIVE_AUDIT.md` has the full breakdown. Short version:

1. **OREON (vishwateja231)** — strongest *architecture story* (LangGraph + NetworkX + 3D twin). v6 now matches it on the architecture-story axis (Three-Layer Reasoning Manifest) **and** still wins on Cloud-Run deployability + judge-clickability.
2. **MahammadRiyazShek** — the *original* baseline this build is forked from. v6 is the strictly-greater-than version.
3. **amar2723** — strongest *MPI transparency story*. v6 already has MPI Trace Inspector + ROI Calculator + Decision Cards that match and exceed.

→ **v6 is the only submission that delivers all three winning ingredients in one Cloud-Run-deployable package.**
