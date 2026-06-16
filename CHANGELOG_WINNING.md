# Changelog — WINNING Enhancement Edition

All notable changes from v1.0 → v1.1 (Winning Edition).
No surfaces from v1.0 were removed; every addition is additive.

## Added

### Components (new, 4 files)
- `src/components/CommandPalette.tsx`
  Cmd/Ctrl-K global command palette with fuzzy search, grouped results,
  keyboard nav (↑ ↓ Enter Esc), 30+ pre-wired actions.
- `src/components/FleetHealthStrip.tsx`
  Top-of-page strip with Critical/Warning/Healthy KPIs, top-risk asset
  spotlight, and click-to-focus asset chips. Strict 12-column grid.
- `src/components/AIOptimizationPanel.tsx`
  Deterministic, sensor-grounded $/day recommendations. Each figure
  is a formula over LIVE telemetry — no hallucinated values.
- `src/components/WinPillarsBanner.tsx`
  Judge-facing band mapping the 4 official judging axes to live
  evidence sections in the running app. Click to jump.

### Integrations in `src/App.tsx`
- `useCallback` import added; smooth-scroll `jumpTo(sectionId)` helper.
- Global Cmd/Ctrl-K keyboard listener.
- `cmdOpen` state for the palette.
- Header now exposes:
  • Quick-Nav button (opens palette)
  • GitHub button (source repo)
  • YouTube button (demo video)
- Main render flow now opens with:
  1. WinPillarsBanner
  2. FleetHealthStrip
  3. (existing) JudgeCriteriaCapabilityMap
  4. (existing) Role-Command-Surfaces HUD
  5. (existing) Sentinel Agent Dashboard
  6. (existing) SCADA Cockpit
  7. (existing) Telemetry / Reasoning / Toolkit 3-column grid
  8. **AIOptimizationPanel (NEW)**
  9. (existing) Executive Ops Suite (ML / Spares / Logbook)
- `<CommandPalette />` mounted as a global overlay; action list built
  by a pure `buildCommandActions(...)` factory outside the component.

### Styling in `src/index.css`
- `@keyframes feedIn` and `.animate-feed` class.
- `.custom-scrollbar::-webkit-scrollbar-*` indigo theming.
- `.animate-spin-slow` for settings icons.
- `[id$="-panel"], [id$="-strip"], …` → `scroll-margin-top: 96px` so
  anchor-jumps from the palette and pillars don't hide under the header.
- `.ring-pulse` highlight class used by `jumpTo()`.
- Custom `xs:block` media query (Tailwind v4 doesn't ship `xs` by default).
- `kbd { line-height: 1 }` to keep ⌘K kbd glyphs aligned.

### Docs
- `README_WINNING.md` — rewritten with the judging-axis mapping,
  v1.1 changes section, and updated deploy instructions.
- `DEPLOY_CLOUD_RUN.md` — full operational runbook (deploy, healthcheck,
  domain, rollback, logs, cost, troubleshooting).
- `CHANGELOG_WINNING.md` — this file.

## Verified
- `npx tsc --noEmit` → clean (0 errors).
- `npm run build` → Vite + esbuild both succeed.
  Output: `dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`,
  `dist/server.cjs`.
- `node dist/server.cjs` → boots; `GET /` → 200; `GET /api/health` → `{status:"up"}`.

## Unchanged
- All 23 v1.0 components (DiagnosisReport, SparesProcurementPanel,
  PlantDigitalTwin3D, etc.) preserved 1:1.
- `Dockerfile`, `cloudbuild.yaml`, `server.ts` data routes, `types.ts`,
  `dataStore.ts`, `geminiClient.ts` — all preserved.
- The Cloud Run deploy command is identical. **Drop-in replacement.**
