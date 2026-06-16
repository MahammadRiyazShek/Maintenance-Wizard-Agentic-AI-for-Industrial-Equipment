# Maintenance Wizard — FINAL v4

**Tata Steel AI Hackathon 2026 · Round 2 · Solo submission**
**From Alarm to Action in Seconds.**

> v4 FINAL is the ship-ready Cloud-Run build. It supersedes v1 / v2 / v3.
> Every change in this release was driven by a head-to-head feature
> audit of the 40+ competing submissions listed in `COMPETITIVE_AUDIT.md`.

---

## What's new in v4 FINAL

| # | Upgrade | Why it wins |
|---|---|---|
| 1 | **Mission Control Nav** — sticky 7-tab anchor rail at the top of every screen | Matches Man-of-Steel's multi-page IA *without* breaking the SPA, gives judges instant navigation across 30+ dashboard sections |
| 2 | **MPI Trace Inspector** — fully auditable Maintenance Priority Index with the closed-form formula on screen | Beats the strongest competitor (maintenance-wizard.vercel.app) at its own game: every weight, sub-score and contribution is visible, so judges can audit the recommendation by eye |
| 3 | **Site-wide alignment rhythm** — `--mw-gutter`, `--mw-card-radius`, `--mw-elevation` design tokens + container max-width + uniform scroll-margin | Top-to-bottom & left-to-right visual rhythm; the page reads as one designed product, not 35 separate components |
| 4 | **Focus-visible ring system** — single colour family, single radius, same offset everywhere | Keyboard-first accessibility (matters for the responsible-AI judging axis) |
| 5 | **Plant-floor backdrop** — quiet radial gradient on `body` | Removes the "blank white" feel without distracting from data |

Everything from v3 is preserved untouched:

- Cinematic landing, voice assistant, 3D digital twin, sentinel agent
- Cmd+K command palette with 32+ actions
- 6 role-based command surfaces (operator / reliability / supervisor / supply / compliance / executive)
- SCADA cockpit with 6 visualizers (twin, flow, risk MPI matrix, cascade, ROI, replay)
- Agent pipeline live, AI confidence index, anomaly heatmap, predicted-event timeline
- Win-pillars banner → judge criteria → working evidence
- Gemini 2.5 Flash, RAG over SOPs/manuals/spares, structured JSON diagnosis
- In-memory store + client-side `localStorage` mirror
- Express on Node 20, Vite + React 19 + TypeScript, Tailwind v4

---

## Project Layout (deltas only — see README_FINAL.md for the full layout)

```
src/components/
├── MissionControlNav.tsx      ★ NEW · sticky top nav rail
└── MPITraceInspector.tsx      ★ NEW · auditable MPI engine
src/
├── App.tsx                    ↺ rewired to mount the two new components
└── index.css                  ↺ v4 design-tokens layer
```

---

## Local Run

```bash
npm install
cp .env.example .env.local         # set GEMINI_API_KEY
npm run dev                        # http://localhost:3000
```

## Production Build

```bash
npm run build                      # vite build + esbuild server bundle
npm start                          # serves dist/server.cjs on $PORT (default 8080)
```

## Deploy to Google Cloud Run (one command)

```bash
gcloud builds submit --config cloudbuild.yaml
```

The included `Dockerfile` is a multi-stage Node 20 Alpine image with a `/api/health`
HEALTHCHECK that Cloud Run polls automatically. See `DEPLOY_CLOUD_RUN.md` for the
full step-by-step deployment guide.

---

## Live URLs

- **Production (Cloud Run, asia-southeast1):** <https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/>
- **Source:** <https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment>
- **Walk-through:** <https://www.youtube.com/watch?v=56f9MAxLd-k>

---

## Originality & Compliance

100 % of v4 was built during the official hackathon window. No proprietary plant data
is used; every telemetry stream, SOP, manual excerpt, alarm and logbook entry in
`server/data_store.ts` is synthetic. Third-party libraries are MIT/Apache-2.0 only.
The closed-form MPI formula, the agentic workflow design, the steel-plant domain
taxonomy, all 35 React components and all Gemini prompt/schema engineering are
the participant's original work — see `ORIGINALITY.md` in the v3 README for the
full statement.

---

**Author:** Mahammad Riyaz Shek · Solo participant
**License:** MIT
