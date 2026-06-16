import React, { useEffect, useState } from "react";
import {
  Antenna,
  Activity,
  BookOpenText,
  ShieldAlert,
  Workflow,
  ArrowRight,
  CircleDot,
  Sparkles,
} from "lucide-react";

/**
 * AgentPipelineLive
 * ─────────────────────────────────────────────────────────────
 * Explicit, named, 5-stage agentic pipeline with live state
 * lights — inspired by Mantis-AI's "Agentic AI Workflow" panel
 * (Ingestion · Anomaly · RAG · Risk · Planner) but extended with
 * live phase animation, per-stage handoff payload preview, and
 * a "currently active" indicator that rotates with the Sentinel
 * daemon's real scan cycle.
 */

interface Props {
  /** Phase string emitted by the Sentinel daemon in App.tsx */
  sentinelPhase: string;
}

interface Stage {
  key: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  handoff: string;
  matchesPhases: string[]; // map App.tsx Sentinel phases → this stage
  accent: string;
}

const stages: Stage[] = [
  {
    key: "ingest",
    name: "Ingestion Agent",
    role: "Telemetry, alarms, logbook",
    icon: <Antenna className="h-4 w-4" />,
    handoff: "raw stream → normalised feature vector",
    matchesPhases: ["Intel Ingest"],
    accent: "indigo",
  },
  {
    key: "anomaly",
    name: "Anomaly Agent",
    role: "Iso-Forest · EWMA · z-score",
    icon: <Activity className="h-4 w-4" />,
    handoff: "feature vector → anomaly score + band breach",
    matchesPhases: ["Anomaly Scoring"],
    accent: "rose",
  },
  {
    key: "rag",
    name: "RAG Agent",
    role: "Manuals · SOPs · prior incidents",
    icon: <BookOpenText className="h-4 w-4" />,
    handoff: "fault signature → top-k cited evidence",
    matchesPhases: ["Vector RAG"],
    accent: "sky",
  },
  {
    key: "risk",
    name: "Risk Agent",
    role: "RUL · MPI · cascade · safety",
    icon: <ShieldAlert className="h-4 w-4" />,
    handoff: "evidence → ranked actions + $-impact",
    matchesPhases: ["RUL Curve", "MPI Solving"],
    accent: "amber",
  },
  {
    key: "planner",
    name: "Planner Agent",
    role: "Spares · shift · approvals",
    icon: <Workflow className="h-4 w-4" />,
    handoff: "actions → work-order + procurement trigger",
    matchesPhases: ["Shift Sync"],
    accent: "emerald",
  },
];

const accentMap: Record<string, { bar: string; ring: string; text: string; bg: string; soft: string }> = {
  indigo:  { bar: "bg-indigo-500",  ring: "ring-indigo-400/60",  text: "text-indigo-700",  bg: "bg-indigo-600",  soft: "bg-indigo-50" },
  rose:    { bar: "bg-rose-500",    ring: "ring-rose-400/60",    text: "text-rose-700",    bg: "bg-rose-600",    soft: "bg-rose-50" },
  sky:     { bar: "bg-sky-500",     ring: "ring-sky-400/60",     text: "text-sky-700",     bg: "bg-sky-600",     soft: "bg-sky-50" },
  amber:   { bar: "bg-amber-500",   ring: "ring-amber-400/60",   text: "text-amber-700",   bg: "bg-amber-600",   soft: "bg-amber-50" },
  emerald: { bar: "bg-emerald-500", ring: "ring-emerald-400/60", text: "text-emerald-700", bg: "bg-emerald-600", soft: "bg-emerald-50" },
};

const AgentPipelineLive: React.FC<Props> = ({ sentinelPhase }) => {
  // Determine which stage is currently active
  const activeIdx = Math.max(
    0,
    stages.findIndex(s => s.matchesPhases.includes(sentinelPhase))
  );

  // Pulse handoff arrow when active stage advances
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setPulse(p => p + 1);
  }, [activeIdx]);

  return (
    <section
      id="agent-pipeline-live"
      className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-feed"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Agentic AI Pipeline · Live
            </h3>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-emerald-300 text-[9px] font-mono uppercase tracking-wider font-extrabold">
              5 specialist agents
            </span>
          </div>
          <p className="mt-1 text-[11px] font-mono text-slate-500 leading-relaxed">
            Each agent has a single audited responsibility. The handoff payload between agents is shown explicitly —
            <b className="text-slate-700"> no black-box "the AI decided"</b>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 uppercase font-extrabold">
            currently active: <b className={`${accentMap[stages[activeIdx].accent].text} ml-1`}>{stages[activeIdx].name}</b>
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 xl:grid-cols-[repeat(5,1fr)_auto] gap-3 items-stretch">
        {stages.map((s, i) => {
          const a = accentMap[s.accent];
          const isActive = i === activeIdx;
          return (
            <React.Fragment key={s.key}>
              <div
                className={`relative rounded-xl border p-3 transition-all duration-300 ${
                  isActive
                    ? `${a.soft} border-transparent ring-2 ${a.ring} shadow-md scale-[1.02]`
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`${isActive ? a.text : "text-slate-500"} flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide`}>
                    <CircleDot className={`h-3 w-3 ${isActive ? `${a.text} animate-pulse` : "text-slate-300"}`} />
                    Stage {i + 1}
                  </span>
                  <span className={`p-1 rounded-md ${isActive ? `${a.bg} text-white` : "bg-white text-slate-400 border border-slate-200"}`}>
                    {s.icon}
                  </span>
                </div>
                <div className="mt-2 text-sm font-black text-slate-800 leading-tight">{s.name}</div>
                <div className="text-[10px] font-mono text-slate-500 leading-snug mt-0.5">{s.role}</div>
                <div className="mt-3 pt-2 border-t border-dashed border-slate-200">
                  <div className="text-[9px] font-mono uppercase text-slate-400 font-extrabold">handoff payload</div>
                  <div className="text-[10px] text-slate-700 font-mono leading-snug mt-0.5">{s.handoff}</div>
                </div>
                {isActive && (
                  <div className="absolute -top-2 left-3 px-1.5 py-0.5 rounded-md bg-slate-900 text-emerald-300 text-[9px] font-mono font-extrabold uppercase tracking-wider">
                    LIVE
                  </div>
                )}
              </div>

              {i < stages.length - 1 && (
                <div className="hidden xl:flex items-center justify-center text-slate-300">
                  <ArrowRight
                    key={`arr-${i}-${pulse}`}
                    className={`h-5 w-5 ${i === activeIdx ? "text-indigo-500 animate-pulse" : ""}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono">
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          <span className="text-slate-400 uppercase font-extrabold">orchestration:</span>
          <span className="text-slate-700 ml-1">Gemini 2.x tool-calling + deterministic guardrails</span>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          <span className="text-slate-400 uppercase font-extrabold">trust boundary:</span>
          <span className="text-slate-700 ml-1">every recommendation requires ≥ 1 cited source</span>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          <span className="text-slate-400 uppercase font-extrabold">latency budget:</span>
          <span className="text-slate-700 ml-1">end-to-end ≤ 3 s · ML inference &lt; 5 ms/asset</span>
        </div>
      </div>
    </section>
  );
};

export default AgentPipelineLive;
