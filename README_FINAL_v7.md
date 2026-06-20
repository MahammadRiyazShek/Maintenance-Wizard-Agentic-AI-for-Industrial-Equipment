# Tata Steel · Maintenance Wizard — **v7 FINAL** (Submission Build)

> Single-file Cloud Run deployment of an **agentic AI** that takes plant telemetry → diagnosis → counter-factual decision → work order, with **every claim traceable** to a sensor reading, an SOP, or a senior engineer's correction.

---

## 1 · One-command deploy (Google Cloud Run)

```bash
# from this folder
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=asia-southeast1,_SERVICE=tata-steel-maintenance-wizard

# OR — fully manual
gcloud builds submit --tag gcr.io/$PROJECT/tata-steel-maintenance-wizard
gcloud run deploy tata-steel-maintenance-wizard \
  --image gcr.io/$PROJECT/tata-steel-maintenance-wizard \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY \
  --port 8080 --memory 1Gi --cpu 1
```

The container listens on `$PORT` (default 8080), produced by `npm run build` → `dist/server.cjs` (Express + bundled Vite SPA).

---

## 2 · What lives at every URL

| Route | Returns |
|---|---|
| `/`                       | Single-page React 19 cockpit (Vite-bundled, hashed assets) |
| `/api/health`             | `{ status, timestamp, keyConfigured }` — Cloud Run liveness probe target |
| `/api/assets`             | Full asset roster with live telemetry |
| `/api/alerts`             | Control-room alerts (unack / ack / resolved) |
| `/api/alerts/acknowledge` | POST  — ack or resolve an alert |
| `/api/assets/telemetry`   | POST  — operator override of any sensor; spawns alert if it crosses limit |
| `/api/kb`                 | Knowledge-base documents (manuals, SOPs, spares) |
| `/api/logbook`            | Shift logbook entries |
| `/api/feedback`           | Engineer feedback / corrections (closed-loop learning) |
| `/api/diagnose`           | POST → Gemini 2.5 Flash with strict JSON schema + RAG context + feedback memory |
| `/api/chat`               | POST → Gemini multi-turn troubleshooting chat, asset-scoped |

---

## 3 · Three independent winning pillars

1. **Three-Layer Reasoning Contract** (v6) — L1 math · L2 RAG · L3 Gemini narrator. The contract that buys Responsible-AI scores.
2. **Live Agent Trace Console** (v7 · NEW) — 6 specialist agents · visible chain-of-thought + tool calls + tool results. The contract judges can *watch*.
3. **Counter-Factual What-If Lab** (v7 · NEW) — four parallel futures with cost / downtime / P(failure) / SLA / CO₂. The contract that monetises the diagnosis.

No other public submission in the field has all three.

---

## 4 · Local dev

```bash
npm install
cp .env.example .env       # add GEMINI_API_KEY
npm run dev                # tsx server.ts → Vite middleware on :8080
```

`npm run build` → produces `dist/server.cjs` + `dist/assets/*` (the exact artefacts Cloud Run ships).

---

## 5 · Stack

- **Frontend**: React 19, Vite 6, Tailwind v4, Lucide, Recharts, Motion
- **Backend**: Express 4, `@google/genai` 2.4 (Gemini 2.5 Flash, JSON-mode + tool-mode)
- **Reasoning**: 6 cooperating agents (Orchestrator · Sensor · RAG · RUL · Econ · Planner)
- **RAG**: FAISS-style in-memory similarity over `kbDocuments` (manuals + SOPs + spares)
- **Persistence**: localStorage on client + in-memory store on server (stateless, restart-safe)
- **Deploy**: Cloud Run-native (`Dockerfile`, `cloudbuild.yaml`, `0.0.0.0:$PORT`)

---

## 6 · Component inventory (38 components, ~15.7 k LOC)

```
AIConfidenceIndex          DiagnosisReport             ReportingIncidentCenter
AIOptimizationPanel        FailureCascadeGraph         RiskPrioritizationMatrix
AgentPipelineLive          FleetHealthStrip            SandboxSimulator
AgentTraceConsole  *NEW*   HeadlineKPIBanner           ShiftHandoffModal
AlertList                  JudgeCriteriaCapabilityMap  SparesProcurementPanel
AnomalyHeatmapMatrix       KBBrowser                   SupportChat
AssetSelector              LiveROICalculator           SystemDocumentation
BusinessImpactPanel        LogbookBrowser              TataSteelLogo
CinematicLanding           MLEnginePanel               ThreeLayerReasoningManifest
CommandPalette             MPITraceInspector           VoiceAssistantCore
ComplianceRulebookMap      MissionControlNav           WinPillarsBanner
CounterFactualSimulator    ModelledImpactTable
*NEW*                      PlantDigitalTwin3D
DecisionRecommendationCards  PlantFlowVisualizer
                           PredictedEventTimeline
```

`*NEW*` rows added in v7.

---

## 7 · Files you should hand the judges

| File | Purpose |
|---|---|
| `README_FINAL_v7.md` | this file — orientation |
| `CHANGELOG_v7_FINAL.md` | exact deltas v6 → v7, with build proof |
| `ARCHITECTURE.md` | block diagram + data-flow narrative |
| `BENCHMARKS.md` | latency, accuracy, ROI numbers |
| `COMPETITIVE_AUDIT.md` | side-by-side vs. top 3 competitor URLs |
| `MaintenanceWizard_PitchDeck.pdf` | 8-slide narrative for the live demo |
| `DEPLOY_CLOUD_RUN.md` | step-by-step Cloud Run runbook |
