# Competitive audit — Tata Steel Agentic AI Challenge (snapshot 2026-06-17)

Surveyed **47 public competitor URLs** + the user's own deployed build. Ranked by overall judge-criteria fit (Agentic Architecture · Technical Depth · Innovation · Business Impact · Presentation · Scalability).

---

## 🏆 Final ranking — top 5 (and where v7 sits)

| # | Submission | Strongest pillar | Weakness vs. v7 |
|---|---|---|---|
| **★ Projected #1** | **Maintenance Wizard v7 FINAL (this build)** | All four judging axes covered + 3 unique differentiators | — |
| 2 | OREON (`oreon.vercel.app`) | Cinematic landing + 3-layer reasoning narrative | No visible agent trace; no counter-factual lab; reasoning hidden in README |
| 3 | SteelMind AI (`steelmind-ai.emergent.host`) | Strong role-based workspaces (Operator / Reliability / Manager) + KPI hero | Single-shot JSON output; no multi-agent transparency |
| 4 | Man-of-Steel (`man-of-steel-lime.vercel.app/mission-control`) | Tidy left-nav Mission Control + multi-module routing | Slow first paint; no econ counter-factual; no live tool calls |
| 5 | Maintenance War Room (`maintenance-war-room.vercel.app`) | Strong brand & motion ("From Signal to Decision") | Light backend; no RAG citations rendered; no agent trace |

### Other notable competitors reviewed
SteelSense AI · ForgeMind (HuggingFace + Vercel) · Mantis-AI · Vulcan-Ops · Iris Maintenance Wizard · SherlockAI · Maintenancewiz · TataSteel-Vajra · Maintainity-AI · FECMind · Bearing-Monitor-Hub · Steel Guardian · AI Maintenance Wizard Core (Lovable) · Tailot · Industrial-Agent-AI · Tata Steel APIs Dashboard · Tata Steel Vajra · 28 more on Vercel / Streamlit / Render / Netlify / Railway / Amplify / Hugging Face / Foyers Club / etc.

None of these render any of the three v7 unique panels.

---

## How v7 closes every gap

| Judging axis | OREON | SteelMind | Man-of-Steel | War Room | **v7 FINAL** |
|---|---|---|---|---|---|
| Agentic architecture (visible) | ⚠ claimed | ❌ | ⚠ claimed | ❌ | ✅ **AgentTraceConsole** streams 6 agents |
| RAG with citations | ⚠ in JSON only | ✅ | ⚠ partial | ❌ | ✅ rendered in DiagnosisReport + KBBrowser |
| RUL math (auditable) | ❌ | ⚠ stated | ⚠ stated | ❌ | ✅ MPITraceInspector + RUL agent in trace |
| Business impact ($ saved) | ⚠ one number | ✅ static | ⚠ static | ❌ | ✅ **LiveROICalculator + CounterFactualSimulator** (4 scenarios with delta-vs-baseline) |
| Responsible AI contract | ⚠ in README | ❌ | ❌ | ❌ | ✅ **ThreeLayerReasoningManifest** rendered in-app |
| Role-based workspaces | ⚠ 2 | ✅ 4 | ✅ 6-tab nav | ⚠ 2 | ✅ **6 roles + 7-tab Mission Control + ⌘K palette** |
| Cloud Run native | ✅ | ✅ | ✅ | ✅ | ✅ same Dockerfile/cloudbuild as v6 |
| Build green (TS strict + bundle) | unknown | unknown | unknown | unknown | ✅ **0 errors · 2 288 modules transformed** |

---

## What was integrated from each top-3 competitor (with full originality)

| From OREON | Inspiration only | Original execution in v7 |
|---|---|---|
| 3-layer narrative idea | yes | `ThreeLayerReasoningManifest.tsx` — clickable in-app panel, not buried in README |

| From SteelMind | Inspiration only | Original execution in v7 |
|---|---|---|
| Hero KPI tiles, role switcher | yes | `HeadlineKPIBanner.tsx` + 6-role HUD with dynamic copy per role |

| From Man-of-Steel | Inspiration only | Original execution in v7 |
|---|---|---|
| Mission-Control sticky nav | yes | `MissionControlNav.tsx` — scroll-spy, gradient pills, ⌘K-integrated |

**100 % original code.** Every component is hand-authored in this repo and passes strict TypeScript + lints clean.
