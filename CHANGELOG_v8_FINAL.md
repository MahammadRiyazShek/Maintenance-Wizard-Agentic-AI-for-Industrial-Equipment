# Maintenance Wizard v8 FINAL — Changelog

> Merged feature set: combines the strongest claims from four competitor
> submissions into a single production-ready codebase.

## Added files

### Engine / utilities
- `src/utils/anomalyEngine.ts` — deterministic 6-step MPI, Isolation-Forest
  surrogate, AI4I-2020 XGBoost surrogate with verbatim UCI physics rules
  (TWF / HDF / PWF / OSF), client-side OutcomeRepository mirror.
- `src/utils/langGraphMap.ts` — 5-agent LangGraph topology descriptor +
  `weightedConfidence()` helper for the confidence-index breakdown.

### Server
- `server/autopilot_daemon.ts` — Node-owned autonomous daemon. Runs even
  when every browser tab is closed. Persists outcomes to
  `server/outcomes_store.json`.

### React components (all rendered on the main workbench)
- `components/MPIAuditTrail.tsx` — 6-step audit trail with formulas.
- `components/AI4IPhysicsPanel.tsx` — physics-rule panel with measured
  values per UCI rule.
- `components/LangGraphPipeline.tsx` — 5-node DAG visualisation with
  active-phase highlighting + weighted confidence table.
- `components/BoardroomROIAgent.tsx` — $-avoided, payback months,
  top-3 contributors.
- `components/AutopilotDaemonConsole.tsx` — operator surface for the
  server daemon (off / monitor / autopilot).
- `components/DynamicKBUpload.tsx` — runtime indexing into the live RAG
  store via `POST /api/kb`.
- `components/OutcomeRepositoryView.tsx` — closed-loop learning UI with
  ✓ / ✗ resolution and rolling accuracy.
- `components/JudgeMapPage.tsx` — in-app criterion ↔ source ↔ endpoint
  map (companion to `JUDGE_MAP.md`).

## Modified files

- `src/types.ts` — added `FailureMode`, `MPITraceStep`, `MPIResult`,
  `AutopilotEvent`.
- `server.ts` — imports the daemon, registers 8 new endpoints
  (KB POST/DELETE + 6 autopilot endpoints), boots the daemon on
  `app.listen`.
- `src/App.tsx` — imports the 8 new components and renders them in the
  workbench. Header tag updated to "Wizard v8.0 FINAL".

## REST endpoints (new in v8)

```
POST   /api/kb                              — index a document into the live RAG
DELETE /api/kb/:id                          — remove a runtime-uploaded doc
GET    /api/autopilot/status                — daemon health
POST   /api/autopilot/mode                  — switch off / monitor / autopilot
GET    /api/autopilot/events?limit=N        — recent timeline events
GET    /api/autopilot/outcomes              — outcome repository
POST   /api/autopilot/outcomes/:id/resolve  — close the loop
GET    /api/autopilot/accuracy              — rolling accuracy + $ avoided
```

## Quick start

```bash
npm install
npm run build
npm start
# → http://localhost:8080
```

The autonomous daemon is armed automatically at server boot
(`mode = monitor`). Toggle it to `autopilot` from the
"Autonomous Server Daemon" card to see auto-drafted work-orders.
