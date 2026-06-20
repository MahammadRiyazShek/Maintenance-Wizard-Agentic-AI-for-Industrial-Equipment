# Judge Map — Maintenance Wizard v8 FINAL

> Every advertised capability is mapped to a **named source file**, a **DOM
> anchor** you can scroll to in the running app, and (where applicable) the
> **REST endpoint** that exposes the underlying data.

| # | Criterion | Implementing file | REST endpoint | Scroll to | Status |
|---|-----------|-------------------|---------------|-----------|--------|
| 1 | 6-step deterministic MPI with weighted contributions | `src/utils/anomalyEngine.ts → computeMPI` | — | `#mpi-audit-trail` | deterministic |
| 2 | Isolation Forest anomaly detection (32 trees, seed-stable) | `src/utils/anomalyEngine.ts → isolationForestScore` | — | `#mpi-audit-trail` | deterministic |
| 3 | implements the published UCI AI4I-2020 ruleset on real UCI dataset | `src/utils/anomalyEngine.ts → classifyAI4I` | — | `#ai4i-physics-panel` | deterministic |
| 4 | UCI physics rules TWF / HDF / PWF / OSF (verbatim encoder) | `anomalyEngine.ts → classifyAI4I` | — | `#ai4i-physics-panel` | deterministic |
| 5 | 5-agent LangGraph + Multi-Agent RAG | `src/utils/langGraphMap.ts` + `LangGraphPipeline.tsx` | — | `#langgraph-pipeline` | live |
| 6 | Confidence index — weighted breakdown + evidence chain | `langGraphMap.ts → weightedConfidence` | — | `#langgraph-pipeline` | deterministic |
| 7 | Regional anomaly heatmap | `components/AnomalyHeatmapMatrix.tsx` | — | `#anomaly-heatmap-matrix` | live |
| 8 | Live process schematic | `LiveProcessSchematic.tsx` + `DigitalTwinVisualizer.tsx` | — | `#scada-panel` | live |
| 9 | Server-side autonomous daemon (zero-touch) | `server/autopilot_daemon.ts` | `GET /api/autopilot/status` | `#autopilot-daemon-console` | live |
| 10 | Autopilot mode toggle (off / monitor / autopilot) | `AutopilotDaemonConsole.tsx` | `POST /api/autopilot/mode` | `#autopilot-daemon-console` | live |
| 11 | Dynamic KB upload — live RAG indexing | `DynamicKBUpload.tsx` | `POST /api/kb` | `#dynamic-kb-upload` | live |
| 12 | Outcome repository with accuracy metric | `OutcomeRepositoryView.tsx` | `GET /api/autopilot/accuracy` | `#outcome-repository` | persisted |
| 13 | Dollar-quantified business impact | `anomalyEngine.ts` ($/hr table) + `BoardroomROIAgent.tsx` | — | `#boardroom-roi` | deterministic |
| 14 | Board-level ROI agent (payback months, net ROI) | `BoardroomROIAgent.tsx` | — | `#boardroom-roi` | deterministic |
| 15 | Scenario / counter-factual simulator | `SandboxSimulator.tsx` + `CounterFactualSimulator.tsx` | — | `#counter-factual-simulator` | live |
| 16 | Explicit judge-facing capability ↔ source map (this page in-app) | `JudgeMapPage.tsx` | — | `#judge-map-page` | live |

---

## How to verify each row in under 30 seconds

1. **MPI 6-step audit trail** — pick any asset in the SCADA panel. Scroll to
   the "Maintenance Priority Index — 6-Step Audit Trail" card. Add the
   **Contribution** column manually; multiplied by 100 it equals the headline
   MPI score.
2. **Isolation Forest** — change one telemetry value in `data_store.ts` and
   re-load. The anomaly contribution (step 4) updates deterministically
   because the RNG is seeded from the asset id.
3. **AI4I ruleset** — open `anomalyEngine.ts` and read the rule block. The
   four `if` branches are the **literal** TWF / HDF / PWF / OSF rules from
   the UCI dataset documentation.
4. **5-agent LangGraph** — the "5-Agent LangGraph · Multi-Agent RAG
   Topology" card shows all five nodes and the typed edges. The active
   phase pulses in real time.
5. **Autonomous daemon** — at server boot the daemon emits its first event
   within 8 seconds. Close every browser tab, wait 30 seconds, reopen — the
   event log will have advanced.
6. **Dynamic KB upload** — paste any text, hit *Index into live RAG*, then
   ask the wizard a question that references your text. The Retriever
   Agent will cite the freshly uploaded doc.
7. **Outcome repository** — flip the daemon to *autopilot* mode, wait for
   a dispatch (band ∈ {High, Critical}), then click ✓ correct or ✗ wrong.
   The accuracy metric updates immediately and survives a server restart.

## REST endpoints (cheat-sheet)

```
GET    /api/autopilot/status               → daemon health
POST   /api/autopilot/mode                 → { mode: "off"|"monitor"|"autopilot" }
GET    /api/autopilot/events?limit=N       → recent timeline events
GET    /api/autopilot/outcomes             → outcome repository
POST   /api/autopilot/outcomes/:id/resolve → { outcome, note, costAvoided }
GET    /api/autopilot/accuracy             → rolling accuracy + $ avoided
POST   /api/kb                             → { title, category, content }
DELETE /api/kb/:id                         → remove runtime-uploaded doc
```

All endpoints are exercised by the corresponding React components — open
the browser DevTools network panel to follow along.
