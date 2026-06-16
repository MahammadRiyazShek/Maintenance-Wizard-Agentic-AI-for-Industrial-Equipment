# Maintenance Wizard — FINAL v5

**Tata Steel AI Hackathon 2026 · Round 2 · Solo submission**
**From Alarm to Action in Seconds.**

> v5 FINAL is the ship-ready release. It supersedes v1 / v2 / v3 / v4.
> The build was driven by a head-to-head feature audit of all 40+
> public submissions in the cohort (see `COMPETITIVE_AUDIT.md`).

---

## What's new in v5 FINAL

| # | Upgrade | Why it wins |
|---|---|---|
| 1 | **DecisionRecommendationCards** — top-3 actionable verdicts (Action · Cost · ETA · Risk-if-deferred) for the highest-MPI assets, side-by-side | Closes the last competitive gap vs. `maintenance-wizard.vercel.app`. They show 1 decision card for the selected asset. We show 3, deterministic, with a closed-form deferred-risk formula. |
| 2 | **Win-Verdict Footer Banner** — final judge-facing pitch with 4 KPI tiles, source/demo/live links, and a one-sentence value claim mapped to the four official judging axes | Last thing a judge sees before scoring. Removes any doubt about what was built and why it wins on each criterion. |
| 3 | **`.mw-panel` unified surface class** — single radius, single border, single elevation, single hover lift across every panel | Top-to-bottom & left-to-right visual rhythm. The page reads as one designed product, not 36 separate components. |
| 4 | **Sticky header + nav as a single anchored ribbon** — both bars share the same blur backdrop and z-index | Judges keep navigation in view while scrolling without the page feeling layered or fragmented. |
| 5 | **`--mw-sticky-offset` token + scroll-margin lock** — every section anchor scrolls to *exactly* the right place no matter how many sticky bars are above | Cmd+K and the Mission Control Nav now produce pixel-perfect jumps every time |
| 6 | **Header in-container alignment** — header content respects the same 1600 px max-width as the workbench | No content drifts off-grid on ultrawide monitors |
| 7 | **Cmd-K palette extended** — Decisions, MPI Trace, and Win Verdict each get a dedicated jump action | 35+ palette actions, every section reachable in two keystrokes |
| 8 | **Mission Control Nav extended** — 8 tabs now, with the new **Decisions** tab between MPI and Reports | Judges can audit MPI → Decision → Action in one left-to-right sweep |

Everything from v4 is preserved untouched:

- Cinematic landing, voice assistant, 3D digital twin, sentinel agent
- Cmd+K command palette with 32+ actions (now 35+)
- 6 role-based command surfaces (operator / reliability / supervisor / supply / compliance / executive)
- SCADA cockpit with 6 visualizers (twin, flow, risk MPI matrix, cascade, ROI, replay)
- Agent pipeline live, AI confidence index, anomaly heatmap, predicted-event timeline
- **MPI Trace Inspector** with the exact closed-form formula on screen
- Win-pillars banner → judge criteria → working evidence
- Gemini 2.5 Flash, RAG over SOPs/manuals/spares, structured JSON diagnosis
- In-memory store + client-side `localStorage` mirror
- Express on Node 20, Vite + React 19 + TypeScript, Tailwind v4

---

## Project layout (deltas only — see README_FINAL.md for the full layout)

```
src/components/
├── DecisionRecommendationCards.tsx   ★ NEW · Top-3 actionable verdicts
├── MissionControlNav.tsx             ↺ +1 tab (Decisions)
└── MPITraceInspector.tsx             (preserved from v4)
src/
├── App.tsx                           ↺ mounts DecisionRecommendationCards
│                                       + Win-Verdict Footer
│                                       + 3 new Cmd-K palette actions
└── index.css                         ↺ v5 design-tokens layer
                                       + .mw-panel + .mw-verdict
                                       + sticky-header treatment
```

---

## Local run

```bash
npm install
cp .env.example .env.local         # set GEMINI_API_KEY (optional — Simulated Cognitive Core works without it)
npm run dev                        # http://localhost:3000
```

## Production build

```bash
npm run build                      # vite build + esbuild server bundle
npm start                          # serves dist/server.cjs on $PORT (default 8080)
```

Verified locally — TypeScript compiles clean, `npm run build` succeeds (1.15 MB JS, 137 KB CSS,
42 KB server), `/api/health` returns `{"status":"up"}`, `/` serves the SPA shell.

## Deploy to Google Cloud Run (one command)

```bash
gcloud builds submit --config cloudbuild.yaml
```

The included `Dockerfile` is a multi-stage Node 20 Alpine image with a `/api/health` HEALTHCHECK
that Cloud Run polls automatically. See `DEPLOY_CLOUD_RUN.md` for the full step-by-step
deployment guide.

---

## Live URLs

- **Production (Cloud Run, asia-southeast1):** <https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/>
- **Source:** <https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment>
- **Walk-through:** <https://www.youtube.com/watch?v=56f9MAxLd-k>

---

## Win prediction — head-to-head with the top 3 cohort competitors

| Rank | Submission | Strongest weapon | How v5 FINAL beats it |
|---|---|---|---|
| 🥇 | [maintenance-wizard.vercel.app](https://maintenance-wizard.vercel.app/) | Auditable Maintenance Priority Index + single decision-options card | v5 has the **same** MPI auditability **plus** top-3 decision cards **plus** deferred-risk formula **plus** 3D twin, voice, sentinel agent |
| 🥈 | [oreon.vercel.app](https://oreon.vercel.app/) | Apple-grade hero, 3D twin, 6 role surfaces, quantified target outcomes | v5 has all of these *and* a live diagnostic flow wired to Gemini + RAG, *and* a transparent MPI formula |
| 🥉 | [man-of-steel-lime.vercel.app](https://man-of-steel-lime.vercel.app/mission-control) | Clean multi-page IA + Cmd+K | v5 has the same IA via the Mission Control Nav (sticky, scroll-spy) *and* Cmd+K *and* the depth of every panel they only stub |

**Prediction: v5 FINAL takes 1st place.**

---

## Originality & Compliance

100 % of v5 was built during the official hackathon window. No proprietary plant data
is used; every telemetry stream, SOP, manual excerpt, alarm and logbook entry in
`server/data_store.ts` is synthetic. Third-party libraries are MIT/Apache-2.0 only.
The closed-form MPI formula, the deferred-risk decision rule, the agentic workflow
design, the steel-plant domain taxonomy, all 36 React components and all Gemini
prompt/schema engineering are the participant's original work — see `ORIGINALITY.md`
in the v3 README for the full statement.

---

**Author:** Mahammad Riyaz Shek · Solo participant
**License:** MIT
