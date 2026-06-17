# CHANGELOG · v6 FINAL

> Forked from v5 FINAL · 2026-06-17

## ✨ New
- **`ThreeLayerReasoningManifest.tsx`** — a judge-facing transparency panel that makes the L1 (math) → L2 (RAG) → L3 (Gemini narrator) reasoning contract explicit. Directly addresses the *Responsible & Evidence-Grounded AI* judging axis. Inspired by the strongest competitor (OREON) but rendered as a single clickable panel instead of being buried in a README.
- **Mission Control "Reasoning Contract" tab** — the new panel is one click from any scroll position.
- **Cmd-K palette action** — `Jump to Three-Layer Reasoning Manifest` is now searchable.

## 🛠 Fixed (alignment pass)
Patched **12 source files** for invalid Tailwind tokens that were silently falling back to defaults and breaking the visual grid:
- `text-indigo-750`     → `text-indigo-700`
- `text-slate-805`      → `text-slate-800`
- `bg-emerald-955/30`   → `bg-emerald-950/30`
- `bg-blue-955/30`      → `bg-blue-950/30`
- `bg-purple-955/30`    → `bg-purple-950/30`
- `border-slate-805`    → `border-slate-800`
- `border-slate-850`    → `border-slate-800`
- `bg-indigo-650`       → `bg-indigo-600`
- `bg-slate-750`        → `bg-slate-700`
- `hover:bg-slate-750`  → `hover:bg-slate-700`
- `scale-102`           → `scale-105`
- `shadow-3xs`          → `shadow-sm`
- `p-4.5`               → `p-5`

This restores top-to-bottom and left-to-right alignment rhythm across every panel.

## 🧹 Removed
Five stale doc drafts (`README_DELTA.md`, `README_FINAL.md`, `README_FINAL_v4.md`, `README_FINAL_v5.md`, `README_WINNING.md`, `CHANGELOG_v4_FINAL.md`, `CHANGELOG_v5_FINAL.md`, `CHANGELOG_FINAL.md`, `CHANGELOG_WINNING.md`). Replaced with single canonical `README_FINAL_v6.md` + this file.

## 📈 Counts updated
- Component count: 35 → **36**
- Verdict footer & banner copy updated to reflect v6.

## ✅ Build verification
- `npx tsc --noEmit` → **0 errors**
- `npm run build` → **2286 modules transformed**, client + server bundles produced
- `node dist/server.cjs` boots, `/api/health` returns `200`, `/` serves SPA

Ready to ship to Cloud Run.
