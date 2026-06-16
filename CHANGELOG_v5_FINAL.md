# Changelog — v5 FINAL

> Ship-ready Cloud-Run build · Tata Steel AI Hackathon 2026 Round 2

## ★ Added

- `src/components/DecisionRecommendationCards.tsx` — Top-3 prioritised decision cards.
  Each card carries the four numbers a maintenance manager actually needs to authorise
  a work order: Recommended Action, Cost-to-Act, ETA, Risk-if-Deferred-24h. All four are
  deterministic, closed-form functions of the same telemetry that drives the MPI Trace
  Inspector — same inputs → same numbers, no LLM in the critical path.
- **Win-Verdict Footer Banner** mounted at the bottom of `dashboard-workbench`. Renders
  a one-sentence value claim mapped to the four official judging axes, four KPI tiles
  (35 components, 5 agents, 6 role surfaces, 32+ Cmd-K actions), and direct Source /
  Demo / Live-Cloud-Run buttons. Last thing a judge sees before scoring.
- **`.mw-panel` and `.mw-verdict`** unified surface classes in `src/index.css`. Every
  panel now inherits the same radius, border, elevation, and hover lift — no eyeballing.
- **`--mw-sticky-offset` token** (`9rem`) — single source of truth for scroll-margin so
  every section anchor lands pixel-perfect under the sticky header + nav.
- **Three new Cmd-K palette actions**: Decisions, MPI Trace, Win Verdict.
- **One new Mission Control Nav tab**: *Decisions* — between *Maintenance Priority* and
  *Reports & Logbook*.

## ↺ Changed

- `src/App.tsx`
  - Imports `DecisionRecommendationCards`.
  - Mounts it directly under `MPITraceInspector` so MPI → Action reads top-to-bottom.
  - Mounts the Win-Verdict Footer as the last child of `dashboard-workbench`.
  - Adds three new Cmd-K palette actions.
- `src/components/MissionControlNav.tsx` — `TABS` array now has 8 tabs (was 7).
- `src/index.css`
  - Adds `.mw-panel`, `.mw-verdict`, `--mw-sticky-offset`, `--mw-accent` tokens.
  - Header is now sticky with backdrop-blur — matches Mission Control Nav rhythm.
  - Header content is now max-width-constrained to match the workbench column.
  - `scroll-margin-top` now references `var(--mw-sticky-offset)` instead of a literal.

## ✓ Verified

- `npx tsc --noEmit` — zero TypeScript errors.
- `npm run build` — vite + esbuild succeed.
  - `dist/index.html` 0.42 kB
  - `dist/assets/index-*.css` 137 kB
  - `dist/assets/index-*.js` 1.15 MB
  - `dist/server.cjs` 42 kB
- `node dist/server.cjs` — boots, `/api/health` returns `{"status":"up"}`, `/` serves the SPA shell.
- All anchor IDs (`mpi-trace-inspector`, `decision-recommendation-cards`,
  `win-verdict-banner`, etc.) resolve correctly with the new
  `scroll-margin-top: var(--mw-sticky-offset)` rule.

## ✗ Not changed (intentionally)

- Every v4 feature is preserved untouched: cinematic landing, voice assistant,
  3D digital twin, sentinel agent, Cmd+K palette, 6 role surfaces, SCADA cockpit,
  agent pipeline, AI confidence index, anomaly heatmap, predicted-event timeline,
  MPI Trace Inspector, win-pillars banner, RAG knowledge vault.
- `Dockerfile` and `cloudbuild.yaml` remain identical — v5 deploys with the same
  `gcloud builds submit --config cloudbuild.yaml` command.
