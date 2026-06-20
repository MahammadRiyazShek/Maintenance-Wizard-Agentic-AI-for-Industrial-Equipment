# Maintenance Wizard — System Architecture

## 1. High-Level Architecture (Layered View)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          USER & PRESENTATION LAYER                           │
│  Operator · Reliability Eng. · Supervisor · Supply · Compliance · Executive  │
│  ─────────────────────────────────────────────────────────────────────────── │
│  React 19 + Vite + TypeScript + Tailwind 4 · 3D Digital Twin · Voice Core    │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          AGENTIC ORCHESTRATION LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │ Diagnosis  │  │    RCA     │  │  Planner   │  │ Procurement│  ← Tool-using│
│  │   Agent    │→ │   Agent    │→ │   Agent    │→ │   Agent    │    Sub-agents│
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘              │
│           Gemini 2.x function-calling · multi-turn context binding           │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  RAG KNOWLEDGE LAYER │ │  PREDICTIVE ML CORE  │ │  RULE / SOP ENGINE   │
│ Manuals · SOPs · Logs│ │ Isolation Forest 48t │ │ DGFASLI · OISD · TS  │
│  Failure reports     │ │ EWMA + Z-score · RUL │ │  Compliance Rulebook │
│  Spares DB           │ │ Weibull degradation  │ │  Step-by-step SOPs   │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       CYBER-PHYSICAL TELEMETRY CORE                          │
│  Blast Furnace · Continuous Caster · Hot Strip Mill · Coke Oven Compressor   │
│  Temperature · Vibration · Pressure · Flow rate · State · Alerts             │
│  (REST: /api/assets · /api/alerts · /api/assets/telemetry · /api/feedback)   │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│        FEEDBACK & CONTINUOUS-LEARNING LOOP (Human-in-the-Loop)               │
│  Engineer thumbs-up/down → Logbook → Retrieval re-weighting → Model fine-tune│
└──────────────────────────────────────────────────────────────────────────────┘
```

## 2. Data-Flow Sequence (per alert)

```
1. Sensor breach           ──►  Telemetry endpoint updates Asset.status
2. Alert auto-spawned      ──►  Isolation Forest scores anomaly
3. Score ≥ 0.56            ──►  Diagnosis Agent invoked with context
4. Diagnosis Agent         ──►  Queries RAG KB (manuals, SOPs, history)
5. RAG Agent returns       ──►  Top-k traceable citations
6. RCA Agent               ──►  5-whys reasoning + failure cascade lookup
7. Planner Agent           ──►  Prioritised step-by-step plan (risk × spares)
8. Procurement Agent       ──►  Spare-parts ETA, lead time, criticality
9. UI renders              ──►  DiagnosisReport + chat + 3D twin highlight
10. Engineer feedback      ──►  Persisted to feedbacks store → loop
```

## 3. Component Inventory (23 React components + 3 utility cores)

**Visualisation:** PlantDigitalTwin3D, PlantFlowVisualizer, FailureCascadeGraph,
RiskPrioritizationMatrix, LiveROICalculator, BusinessImpactPanel

**Operations:** AlertList, AssetSelector, DiagnosisReport, SupportChat,
LogbookBrowser, KBBrowser, SandboxSimulator, ShiftHandoffModal,
ReportingIncidentCenter

**Intelligence:** MLEnginePanel, SparesProcurementPanel,
ComplianceRulebookMap, VoiceAssistantCore, JudgeCriteriaCapabilityMap

**Utilities:** assetAnalytics (Isolation Forest), dataStore, geminiClient

## 4. Deployment Topology

```
        ┌─────────────────────────────────────────┐
        │   Google Cloud Build (cloudbuild.yaml)  │
        └──────────────────┬──────────────────────┘
                           │ container image
                           ▼
        ┌─────────────────────────────────────────┐
        │   Artifact Registry (asia-southeast1)   │
        └──────────────────┬──────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────────┐
        │   Cloud Run · autoscale 0 → N           │
        │   port 8080 · env GEMINI_API_KEY        │
        │   Region: asia-southeast1 (Singapore)   │
        └─────────────────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────────┐
        │   Public URL (HTTPS, managed cert)      │
        └─────────────────────────────────────────┘
```

## 5. Technology Stack

| Layer | Choice | Justification |
|---|---|---|
| Front-end | React 19 + Vite + TS | Fast HMR, type-safety, modern concurrent rendering |
| Styling | Tailwind v4 | Dense industrial UI, no runtime CSS cost |
| Charts | Recharts | SVG, no Canvas overhead, accessible |
| Animations | motion (Framer) | 60 fps cinematic landing & state transitions |
| Server | Express on Node 18 | Same TypeScript everywhere |
| LLM | Google Gemini (`@google/genai` 2.4) | Long context, tool-calling, multilingual |
| ML | Pure TypeScript Isolation Forest | Zero-dep, runs in browser, offline-capable |
| Container | Distroless multi-stage Docker | <100 MB image, no shell, attack-surface minimised |
| Hosting | Google Cloud Run | Serverless, pay-per-request, scale to zero |

## 6. Assumptions & Limitations

- Telemetry is currently *simulated* via `data_store.ts` seed + `SandboxSimulator`. Replacing with a real OPC-UA / MQTT feed is a 1-file change in `/api/assets/telemetry`.
- Gemini key is required for natural-language reasoning. ML scoring still works without it (graceful degradation).
- The Isolation Forest is re-trained on demand from current + peer assets — for production, a nightly job would persist a long-horizon model.
