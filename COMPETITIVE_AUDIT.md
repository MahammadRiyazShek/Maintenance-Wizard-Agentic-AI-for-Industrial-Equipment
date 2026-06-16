# Competitive Audit — Tata Steel AI Hackathon 2026 Round 2

> Compiled before producing v4 FINAL.
> All 40+ public submissions in the cohort were inspected and bucketed by
> standout feature. Anything genuinely strong was either already in v3 or
> has now been brought into v4 as the **MPI Trace Inspector** and
> **Mission Control Nav** features.

## Ranking — top 3 competitors most likely to win (besides this one)

| Rank | Submission | Strongest weapon | How v4 FINAL counters / surpasses |
|---|---|---|---|
| 🥇 | [maintenance-wizard.vercel.app](https://maintenance-wizard.vercel.app/) | Deterministic **Maintenance Priority Index** with traceable formula, reasoning map, constraint simulator, business-consequence panel — judge-grade auditability | v4's new **MPI Trace Inspector** shows the *exact* closed-form formula, every weight, every sub-score, and the contribution percentage, *plus* allows the judge to perturb the policy live (safety-first / cost-first). Same auditability — wider product surface around it |
| 🥈 | [oreon.vercel.app](https://oreon.vercel.app/) | Apple-grade minimalist hero, **3D digital twin**, 10-asset dependency chain, **6 role-adapted command surfaces**, quantified target outcomes (-38 % downtime, -72 % MTTI, -60 % engineer time, -45 % stock-outs, -51 % catastrophic) | v3/v4 already ships **PlantDigitalTwin3D**, **6 role surfaces**, **HeadlineKPIBanner** and **ModelledImpactTable**. v4 adds an Apple-rhythm CSS token layer (`--mw-gutter`, `--mw-elevation`, container max-width) so it now also *looks* the part |
| 🥉 | [man-of-steel-lime.vercel.app](https://man-of-steel-lime.vercel.app/mission-control) | Clean multi-page IA: Mission Control / Asset Explorer / Maintenance Priority / AI Copilot / Intelligence / Reports / Knowledge Vault, plus **Cmd+K** | v3 already had Cmd+K and all the underlying panels — but they were buried in scroll. v4's new **MissionControlNav** surfaces them as a sticky top rail with scroll-spy and identical labels, so judges see the IA at a glance |

## Other notable submissions (≤ rank 4)

- **industrial-agent-ai.vercel.app** — landing-page role picker (Engineer / Manager / Field Tech / Judge), Phi-3.5 fine-tune story. Strong narrative; weak interactivity. We already match the narrative through `WinPillarsBanner` and `JudgeCriteriaCapabilityMap`.
- **steelmind-ai.emergent.host / vulcan-ops-drab.vercel.app / sherlockai-beta.vercel.app** — strong branding but minimal live data underneath. We expose 4 critical assets with live synthetic telemetry, anomaly scoring, RAG citations and a full SCADA cockpit.
- **maintainity-ai.vercel.app / maintainity-dxys.vercel.app** — pretty system-telemetry counters & blueprints page, but the operational dashboard is shallow.
- **forgemind-maintenance.vercel.app** — beautiful TATA cinematic hero, but the dashboard locked behind sign-in.
- **iris-maintenance-wizard.vercel.app / vulcan-maintenance-ai-* / steelplant-maintenance-wizard.vercel.app** — incomplete loading screens at audit time.

## Conclusion — who wins?

The fight is **between this submission and `maintenance-wizard.vercel.app`**.

Both have:
- Auditable Maintenance Priority Index
- RAG-grounded explanations
- Cost-aware prioritisation
- A clean dashboard

We additionally have, and the competitor does not:
1. **3D Digital Twin** (interactive) — only OREON has one too, but theirs is a landing flourish, ours is wired to live asset telemetry.
2. **6 role-adapted command surfaces** with live directives.
3. **Autonomous Sentinel Agent** with a continuously-rotating LangGraph daemon log.
4. **Voice-activated diagnostics core** (`VoiceAssistantCore`).
5. **Cmd+K palette** with 32+ actions and an explicit Mission Control nav rail.
6. **Live ROI calculator**, **Failure Cascade Graph**, **Anomaly Heatmap Matrix**, **Predicted-Event Timeline**.
7. **Judge-criteria → working-surface map** (`JudgeCriteriaCapabilityMap`) that hyper-links the four official judging axes to the exact panel that proves it.

> **Prediction: v4 FINAL ships with strictly more working surfaces, strictly
> better auditability, identical level of explainability, and a more polished
> visual rhythm than the strongest competitor — and therefore takes 1st place.**
