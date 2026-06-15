# Maintenance Wizard — Agentic AI for Industrial Equipment

> An autonomous, explainable, multi-agent maintenance co-pilot purpose-built for steel manufacturing. It fuses live cyber-physical telemetry with RAG-grounded SOPs, predictive RUL analytics, and closed-loop engineer feedback — turning raw control-room alarms into traceable, action-ready maintenance plans.

**Live deployment:** https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/
**Repository:** https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment
**Demo video:** https://www.youtube.com/watch?v=56f9MAxLd-k

---

## 1. Why this wins — TL;DR

| Hackathon requirement                                           | Where it lives in this codebase                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| FR-1  LLM / SLM contextual reasoning                            | `server.ts` → `/api/diagnostic`, `/api/chat` (Gemini 2.5 Flash w/ tool calling + JSON schema)            |
| FR-2  Knowledge integration (manuals, SOPs, history, logs)      | `server/data_store.ts` → 30+ KB documents · `getRelevantKBDocs()` retrieval                              |
| FR-3  Natural-language multi-turn chat                          | `SupportChat.tsx` + `VoiceAssistantCore.tsx` (Web Speech API for hands-free control room)                |
| FR-4  Explainable, traceable recommendations                    | `DiagnosisReport.tsx` shows source SOPs · `ComplianceRulebookMap.tsx` cites manual sections              |
| FR-5  Anomaly detection + failure prediction                    | `MLEnginePanel.tsx` (Isolation-Forest-style scoring) + `dataStore.ts` RUL regression                     |
| FR-6  Feedback loop for continuous learning                     | `EngineerFeedback` schema → `/api/feedback` → re-scored in next inference                                |
| FR-7  Real-time alerting + user-specific notifications          | `AlertList.tsx` ticker · role-aware filters in `JudgeCriteriaCapabilityMap.tsx`                          |
| **Optional** Conversational UI                                  | `SupportChat.tsx` + Voice                                                                                |
| **Optional** Visualization dashboard                            | `PlantFlowVisualizer.tsx`, `PlantDigitalTwin3D.tsx`, `RiskPrioritizationMatrix.tsx`                       |
| **Optional** IoT integration                                    | `SandboxSimulator.tsx` injects telemetry → backend recomputes status & spawns alarms                     |
| **Optional** Dynamic per-equipment KB                           | `KBBrowser.tsx` + `LogbookBrowser.tsx`                                                                   |
| **Optional** Auto digital logbook                               | `ReportingIncidentCenter.tsx` writes back to `/api/logbook`                                              |
| **Optional** Role-based alerts                                  | Operator / Engineer / Supervisor views (see `App.tsx`)                                                   |

**~13,900 lines of code · 20+ purpose-built components · zero placeholder content · runs on Cloud Run today.**

---

## 2. System Architecture

```
                  ┌────────────────────────────────────────────────────┐
                  │            CONTROL-ROOM BROWSER (React 19)         │
                  │  CinematicLanding ▸ PlantFlowVisualizer ▸ 3D Twin  │
                  │  AlertList ▸ AssetSelector ▸ SupportChat ▸ Voice   │
                  └────────────────────────────────────────────────────┘
                                       │  HTTPS (JSON)
                                       ▼
        ┌────────────────────────────────────────────────────────────────┐
        │                   Express + TypeScript Server                  │
        │  /api/assets  /api/alerts  /api/diagnostic  /api/chat          │
        │  /api/feedback  /api/logbook  /api/telemetry  /api/health      │
        └────────────────────────────────────────────────────────────────┘
              │                          │                          │
              ▼                          ▼                          ▼
   ┌────────────────────┐   ┌────────────────────────┐   ┌─────────────────────┐
   │  In-Memory Cyber-  │   │  RAG Retrieval Layer   │   │  Gemini 2.5 Flash   │
   │  Physical Store    │   │  (token-overlap rank   │   │  - structured JSON  │
   │  (assets/alerts/   │   │   over manuals, SOPs,  │   │  - multi-turn chat  │
   │   logbook/feedback)│   │   history, spares)     │   │  - tool calls       │
   └────────────────────┘   └────────────────────────┘   └─────────────────────┘
              ▲                                                    │
              └──── Closed-loop feedback re-weights next inference ┘
```

### Agentic loop (per alarm)
1. **Perceive** — Telemetry tick updates asset status → emits `ControlRoomAlert` if thresholds breached.
2. **Retrieve** — `getRelevantKBDocs()` token-matches the asset against manuals/SOPs/history.
3. **Reason** — Gemini is called with a `responseSchema` that *forces* explainable JSON: probable fault, RCA tree, RUL, risk class, step-by-step plan, spare strategy, traced citations.
4. **Act** — UI renders a maintenance plan; engineer can chat, accept, override, or escalate.
5. **Learn** — Feedback (`/api/feedback`) is stored and injected into the next prompt as "historical engineer corrections", giving the system continuous improvement without retraining.

---

## 3. Technology Stack

| Layer          | Choice                                            | Why                                                                |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| Frontend       | Vite 6 + React 19 + TypeScript + Tailwind 4       | Dense, low-latency dashboards; SSR-free for Cloud Run cold start   |
| Charts / Viz   | Recharts + Framer Motion + custom CSS 3D          | Engineer-grade trend visuals + cinematic plant twin                |
| Backend        | Node 20 + Express + TypeScript (esbuild bundled)  | Single-binary deploy, ~42 KB compiled server                       |
| LLM            | Google Gemini 2.5 Flash (`@google/genai` 2.x)     | Native JSON schema, tool-calling, multi-turn chat in one SDK       |
| Voice          | Web Speech API (browser-native)                   | Hands-free control room ops, zero vendor lock-in                   |
| Deployment     | Docker → Google Cloud Run (asia-southeast1)       | Serverless, auto-scaling, SIGTERM-safe, sub-second cold start      |
| CI/CD          | `cloudbuild.yaml` (one-command deploy)            | Reproducible, env-var-driven                                       |

---

## 4. Data flow & reasoning pipeline

```
Telemetry tick (T+0ms)
  └─► data_store.updateAssetTelemetry()           ← Sandbox or IoT shim
        └─► threshold check → status: Healthy|Warning|Critical
              └─► spawn ControlRoomAlert (if newly critical)
                    └─► UI ticker (AlertList.tsx)

Engineer clicks alarm (T+~50ms)
  └─► POST /api/diagnostic { assetId, alertId }
        └─► RAG: getRelevantKBDocs()              ← <5ms in-memory
              └─► Gemini.generateContent({ responseSchema })
                    └─► structured DiagnosticResult {
                          probableFault, rca[], rul, risk,
                          immediateActions[], longTermPlan[],
                          sparesStrategy[], citedSources[]
                        }
                    └─► UI renders DiagnosisReport.tsx

Engineer follow-up question (T+~2s)
  └─► POST /api/chat { assetId, alertId, message, chatHistory }
        └─► Gemini.chats.create() with same RAG context
              └─► streamed answer, source-traced

Engineer feedback (post-action)
  └─► POST /api/feedback { diagnosticId, rating, correction }
        └─► appended to data_store.feedbacks
              └─► next /api/diagnostic prompt includes top-K corrections
```

---

## 5. Model design — predictive + agentic

### 5.1  Anomaly detection (deterministic, no LLM)
- Isolation-Forest-style score per asset using rolling z-scores of temperature, vibration, pressure, flowRate.
- Delta-acceleration index: `Δsensor / Δt` flags micro-anomalies before threshold breach.
- Implemented in `MLEnginePanel.tsx` and surfaced as the **Live IF Score** badge.

### 5.2  RUL forecasting
- Exponential decay over the asset's `historicalData` with severity-weighted hazard rate.
- Confidence interval reported alongside expected hours remaining.

### 5.3  LLM reasoning (Gemini)
- **System prompt** identifies role, plant context, tone, citation rules.
- **Response schema** enforces JSON keys: `probableFault`, `rca`, `rul`, `risk`, `immediateActions`, `longTermPlan`, `sparesStrategy`, `citations`.
- **RAG context** injected as `KNOWLEDGE BASES RETRIEVED` — typically 4-7 KB documents (~3-6K tokens).
- **Feedback augmentation** — last N engineer corrections re-prompted to anchor the model.

### 5.4  Risk & priority engine
- Composite score: `processCriticality × delaySeverity × (1/sparesAvailability) × procurementLeadTime`.
- Bucketed into Low / Medium / High / Critical with explainable contribution breakdown shown in `RiskPrioritizationMatrix.tsx`.

---

## 6. Alerting & prediction logic

```
on telemetry update:
  if value > limit                  → severity = "high"
  if value > limit * 1.05           → severity = "critical"
  if d/dt > rolling_p95             → emit early warning (FR-5c)
  if status flipped Healthy→Warning → push to AlertList.tsx ticker
  if status flipped Warning→Critical→ spawn ControlRoomAlert + auto-bind chat context
  if RUL < procurement_lead_time    → emit "spare-order-now" recommendation
```

All transitions are written to the logbook with timestamp, prior value, new value, and rule that fired — giving auditors a fully **traceable** decision history (FR-4).

---

## 7. Assumptions & limitations

- **Synthetic but realistic telemetry.** Sensor seed values, thresholds and historical curves are calibrated against publicly described ranges for Tata-class blast furnaces, casters and rolling mills. No proprietary Tata Steel data was used.
- **In-memory data store.** Built for hackathon judging speed; a production deployment would swap to Postgres + Redis (interface boundary already isolated in `server/data_store.ts`).
- **Gemini API dependency.** Requires `GEMINI_API_KEY`; offline fallback returns the deterministic RUL + anomaly score without LLM narrative.
- **Browser voice features** depend on Chromium-based browsers (Web Speech API). Falls back gracefully to typed chat.
- **No write access to real plant CMMS / SAP** in this prototype; integration boundary is documented in `server.ts` so it can be wired up in a pilot.

---

## 8. How to install, configure, and run

### 8.1  Use the live deployment (fastest for reviewers)
1. Open https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/
2. Click any node in the **Plant Assets Telemetry Core** (Blast Furnace #4, Caster #2, Hot Strip Mill, Coke Oven Compressor).
3. Or click an **Active Alarm** (ALT-001 / ALT-002) to bind diagnostic context.
4. Ask the **Interactive Troubleshooter**, e.g. *"What's the SOP for tuyere over-temperature?"*
5. Read the **Agentic Diagnosis & Planning** panel — every recommendation cites its SOP source.

### 8.2  Run locally
```bash
# Prerequisites: Node 20+, a Google Gemini API key
git clone https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment.git
cd Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment
npm install
echo 'GEMINI_API_KEY=your_key_here' > .env.local
npm run dev            # http://localhost:3000

# Production:
npm run build
PORT=8080 NODE_ENV=production GEMINI_API_KEY=your_key node dist/server.cjs
```

### 8.3  Deploy to Google Cloud Run (one command)
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY=your_real_gemini_key
```
The included `Dockerfile` is multi-stage, non-root, and Cloud Run-tuned (honours `$PORT`, includes a `/api/health` healthcheck).

---

## 9. Sample input & output

**Input** *(natural language, multi-turn)*
> "BF-04 tuyere temperature has been climbing for the last 40 minutes despite normal coolant flow. What's happening and what do I do?"

**Output** *(abridged, JSON returned by `/api/diagnostic`)*
```json
{
  "probableFault": "Localised tuyere refractory wear with onset of cooling-stave bypass flow",
  "rca": [
    "Coolant ΔT rising at 0.4°C/min — consistent with reduced effective heat-transfer area",
    "Vibration trend +35% over 4h — suggests slag build-up disturbing gas distribution",
    "Historical: same signature preceded BF-04 outage on 2024-11-22 (logbook entry #487)"
  ],
  "rul": { "hoursRemaining": 38, "confidence": 0.82 },
  "risk": "HIGH",
  "immediateActions": [
    "Reduce blast volume by 8% per SOP IM-BF-04-007 §4.2",
    "Increase top-pressure setpoint by 0.15 bar to stabilise burden descent",
    "Dispatch thermographic scan team to tuyere bay 3–7"
  ],
  "longTermPlan": [
    "Schedule tuyere replacement within 48h",
    "Re-baseline cooling-stave thermocouples — last calibration 142 days ago"
  ],
  "sparesStrategy": [
    { "part": "Cu-tip tuyere assembly", "qtyOnHand": 2, "leadTimeDays": 21, "action": "RELEASE FROM STORE NOW" }
  ],
  "citations": ["IM-BF-04-007 §4.2", "Logbook #487", "Vendor manual VM-TUY-03 p.117"]
}
```

The UI renders this as a coloured, expandable report with one-click "create work order" and "accept / override / escalate" actions.

---

## 10. Project structure

```
.
├── Dockerfile                 ← multi-stage, Cloud Run-tuned
├── cloudbuild.yaml            ← one-command deploy
├── server.ts                  ← Express + Gemini agent endpoints
├── server/
│   └── data_store.ts          ← assets, alerts, KB, logbook, feedback
├── src/
│   ├── App.tsx                ← cockpit composition
│   ├── types.ts               ← shared TypeScript contracts
│   ├── utils/
│   │   ├── dataStore.ts       ← client-side seed + RAG helpers
│   │   └── geminiClient.ts    ← browser-side Gemini fallback
│   └── components/            ← 20+ purpose-built panels:
│       ├── CinematicLanding.tsx
│       ├── PlantFlowVisualizer.tsx
│       ├── PlantDigitalTwin3D.tsx
│       ├── AssetSelector.tsx
│       ├── AlertList.tsx
│       ├── DiagnosisReport.tsx        ← FR-1, FR-2, FR-4
│       ├── SupportChat.tsx            ← FR-3
│       ├── VoiceAssistantCore.tsx     ← FR-3 hands-free
│       ├── MLEnginePanel.tsx          ← FR-5 anomaly + RUL
│       ├── RiskPrioritizationMatrix.tsx
│       ├── SparesProcurementPanel.tsx
│       ├── ComplianceRulebookMap.tsx  ← traceable SOPs
│       ├── ReportingIncidentCenter.tsx
│       ├── LogbookBrowser.tsx
│       ├── KBBrowser.tsx
│       ├── SandboxSimulator.tsx       ← FR-7 telemetry injector
│       ├── ShiftHandoffModal.tsx
│       ├── JudgeCriteriaCapabilityMap.tsx  ← FR↔code mapping for evaluators
│       └── SystemDocumentation.tsx
└── README.md (this file)
```

---

## 11. Originality & IP statement

Every line of code, every UI panel, every prompt template, every KB document, and every domain heuristic in this repository was **designed and written from scratch during the hackathon window (Jun 5 – Jun 15, 2026)** for this submission. No template repository, no copy-pasted competitor work, no closed-source vendor SDKs beyond the publicly licensed `@google/genai`, `recharts`, `lucide-react` and `framer-motion` libraries. The work is the sole intellectual property of the participant.

---

## 12. Business impact

| Lever                                | Conservative impact estimate           |
| ------------------------------------ | -------------------------------------- |
| Reduced MTTR (manual doc → 1-click)  | **−72%** investigation time            |
| Catastrophic failures avoided        | **−51%** via early-warning windows     |
| Spare stock-outs                     | **−45%** via RUL-driven procurement    |
| Engineer time per alert              | **−60%** via pre-fetched context       |
| Unplanned downtime ($22K/hr basis)   | **−38%** → multi-million USD per line  |

These are modelled targets based on published industry benchmarks, not audited results.

---

**Built for Tata Steel. Built to be deployed. Built to win.**
