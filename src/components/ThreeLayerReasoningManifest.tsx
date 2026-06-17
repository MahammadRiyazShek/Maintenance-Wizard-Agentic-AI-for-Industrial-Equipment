import React from "react";
import { Calculator, Database, MessageCircle, Lock, Eye, Sparkles } from "lucide-react";

/**
 * THREE-LAYER REASONING MANIFEST  ·  v6 FINAL
 * ─────────────────────────────────────────────────────────────
 * Judge-facing transparency panel that makes our agentic
 * architecture explicit and auditable:
 *
 *   Layer 1 · DETERMINISTIC INTELLIGENCE  (math · rules · ML)
 *   Layer 2 · RETRIEVAL INTELLIGENCE      (RAG · SOPs · history)
 *   Layer 3 · NARRATIVE INTELLIGENCE      (Gemini narrator only)
 *
 * The contract: the LLM NEVER invents numbers. It only
 * translates pre-computed evidence into role-appropriate prose.
 * This is what makes the output Responsible & Evidence-Grounded
 * (one of the four official Tata Steel judging criteria).
 * ───────────────────────────────────────────────────────────── */

const layers = [
  {
    n: 1,
    title: "Deterministic Intelligence",
    subtitle: "Math · Rules · ML — always runs first",
    icon: Calculator,
    accent: "indigo",
    color: "from-indigo-500/15 to-indigo-500/0",
    border: "border-indigo-500/30",
    chip: "bg-indigo-950 text-indigo-300 border-indigo-800",
    items: [
      "Isolation-Forest anomaly scoring (vibration · temp · current · load)",
      "Paris-Erdogan crack-propagation RUL curve",
      "Arrhenius thermal-acceleration coefficient",
      "MPI = w₁·P(fail) + w₂·SafetyRisk + w₃·PlantImpact + w₄·Criticality − w₅·SpareReadiness",
      "NetworkX plant-graph blast-radius (downstream loss in ₹/hr)",
      "Confidence ∈ [0,1] — explainable 5-factor composite",
    ],
  },
  {
    n: 2,
    title: "Retrieval Intelligence",
    subtitle: "RAG · SOPs · Historical Incidents",
    icon: Database,
    accent: "emerald",
    color: "from-emerald-500/15 to-emerald-500/0",
    border: "border-emerald-500/30",
    chip: "bg-emerald-950 text-emerald-300 border-emerald-800",
    items: [
      "Lexical + semantic retrieval over SMS-Group, NSK & SKF manuals",
      "FMEA tables · spare-parts catalogue · LOTO procedures",
      "Top-K matched SOP chunks with similarity score and page citation",
      "Engineer logbook + closed-loop feedback re-ranks future retrieval",
      "Every retrieved chunk is rendered with traceable source link",
      "Compliance Rulebook Map cross-checks every retrieval against Tata Steel Section 4 & 5",
    ],
  },
  {
    n: 3,
    title: "Narrative Intelligence",
    subtitle: "Gemini 3 — translator only, never inventor",
    icon: MessageCircle,
    accent: "violet",
    color: "from-violet-500/15 to-violet-500/0",
    border: "border-violet-500/30",
    chip: "bg-violet-950 text-violet-300 border-violet-800",
    items: [
      "Strict JSON response schema — numbers are passed-through, not generated",
      "Role-aware tone: operator vs reliability vs supply vs executive",
      "Refuses to answer when retrieval confidence < 0.55 (escalates to human)",
      "Every recommendation cites its evidence chunk and its MPI breakdown",
      "Multi-turn troubleshooting inherits active alarm + asset context",
      "Voice-activated diagnostics route through the same audit trail",
    ],
  },
];

export default function ThreeLayerReasoningManifest() {
  return (
    <section
      id="three-layer-manifest"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-feed"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <span className="p-1 px-1.5 bg-slate-900 text-white rounded font-mono text-[9px] font-extrabold uppercase tracking-widest shrink-0 mt-0.5">
            v6 · Reasoning Contract
          </span>
          <div>
            <h3 className="font-sans font-black text-sm text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Three-Layer Reasoning Manifest
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              How we guarantee <b className="text-slate-800">Responsible &amp; Evidence-Grounded AI</b> — the LLM never invents numbers, it only narrates them.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold">
            <Lock className="h-3 w-3" /> AUDITABLE
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold">
            <Eye className="h-3 w-3" /> EXPLAINABLE
          </span>
        </div>
      </div>

      {/* 3-column stack — top to bottom on mobile, left to right on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {layers.map((L) => {
          const Icon = L.icon;
          return (
            <div
              key={L.n}
              className={`relative rounded-xl border bg-gradient-to-br ${L.color} ${L.border} p-4 flex flex-col gap-3 h-full`}
            >
              {/* Layer header */}
              <div className="flex items-center gap-2">
                <span
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-black border ${L.chip}`}
                  aria-hidden
                >
                  L{L.n}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-slate-700" />
                    <h4 className="font-sans font-black text-[12px] uppercase tracking-tight text-slate-900">
                      {L.title}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">{L.subtitle}</p>
                </div>
              </div>

              {/* Bullet list — identical vertical rhythm in every column */}
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-slate-700">
                {L.items.map((it, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-indigo-500 mt-1 shrink-0 leading-none">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              {/* Footer chip — same height, same alignment in every column */}
              <div className="mt-auto pt-2 border-t border-slate-200/60">
                <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-500">
                  Layer {L.n} of 3 · Output flows down only
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom flow line — visually says "L1 → L2 → L3 → user" */}
      <div className="mt-4 flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded font-extrabold">Sensors</span>
        <span className="text-slate-400">→</span>
        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded font-extrabold">L1 · Math</span>
        <span className="text-slate-400">→</span>
        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-extrabold">L2 · Retrieval</span>
        <span className="text-slate-400">→</span>
        <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded font-extrabold">L3 · Narrator</span>
        <span className="text-slate-400">→</span>
        <span className="px-2 py-1 bg-slate-900 text-white rounded font-extrabold">Engineer</span>
        <span className="ml-auto text-[10px] text-slate-500 normal-case font-medium hidden md:inline">
          Numbers never originate in the LLM. Every figure traces back to a sensor or a manual page.
        </span>
      </div>
    </section>
  );
}
