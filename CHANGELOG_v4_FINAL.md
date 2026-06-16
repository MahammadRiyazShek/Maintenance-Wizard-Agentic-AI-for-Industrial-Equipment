# Changelog — v4 FINAL

## v4.0.0 — Final hackathon-submission build

### Added
- **MissionControlNav.tsx** — sticky 7-tab anchor rail mounted at the top of the dashboard. Tabs: Mission Control · Asset Explorer · AI Copilot · Intelligence · Maintenance Priority · Reports & Logbook · Knowledge Vault. Scroll-spy keeps the active tab in sync as the user scrolls. Cmd+K affordance pinned to the right of the rail.
- **MPITraceInspector.tsx** — flagship Maintenance Priority Index panel. Shows the closed-form formula, six weighted factors (Failure Probability, Safety Risk, Plant Impact, Asset Criticality, Spare Stock Penalty, Procurement Lead-time), per-factor weights, raw 0..1 sub-scores, contributions, and a deterministic 0..10 composite. Includes a scenario perturbation (Baseline / Safety-first / Cost-first) so judges can stress-test the policy live.
- **COMPETITIVE_AUDIT.md** — head-to-head ranking against the 40+ public competing submissions, with the reasoning for v4's two new features.
- **README_FINAL_v4.md** — release-ready operator manual.

### Changed
- **index.css** rewritten as a design-token layer:
  - `--mw-container-max: 1600px` so the dashboard never feels stretched on ultrawides.
  - `--mw-gutter: 1.5rem` enforced on every direct child of `#dashboard-workbench` so all top-level sections share the same breathing space.
  - `--mw-card-radius`, `--mw-elevation`, `--mw-elevation-hover` shared across every panel.
  - `scroll-margin-top: 7.5rem` extended to every panel id (banner / index / timeline / matrix / inspector / column / wrapper / nav / table / map).
  - Global `:focus-visible` ring (indigo, 3 px) for keyboard-first accessibility.
  - Plant-floor radial gradient on `body` so the page no longer feels like blank paper.
- **App.tsx** — minimally rewired:
  - Imports the two new components.
  - Wraps the existing `<HeadlineKPIBanner>` with a `<div id="headline-kpi-banner">` anchor so the nav can jump to it.
  - Mounts `<MissionControlNav>` immediately above the headline banner.
  - Mounts `<MPITraceInspector>` immediately above the AI optimization panel.
  - No existing component / handler / state was deleted.

### Verified
- `npm run build` — green (`vite build` 2284 modules, `esbuild` server bundle 42 KB).
- Production server smoke-test: `GET /api/health` returns `{"status":"up","keyConfigured":true}`; `GET /` serves the hashed JS/CSS bundles.
- Cloud Run Dockerfile and `cloudbuild.yaml` unchanged — drop-in deploy.

### Originality
Both new components are 100 % new code authored for this submission.
The MPI weights (0.30 / 0.20 / 0.20 / 0.15 / 0.10 / 0.05) sum to 1.0 and are
documented inline; the formula is a closed-form deterministic function of
live telemetry, asset metadata and pseudo-stable spare/lead-time hashes
(no LLM in the loop for the priority decision — only for explanation).
