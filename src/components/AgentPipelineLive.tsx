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
  Package,
  Cpu,
  GitGraph,
  ArrowDown
} from "lucide-react";

/**
 * AgentPipelineLive
 * ─────────────────────────────────────────────────────────────
 * Visibly Multi-Stage Agent Graph representing a LangGraph-style workflow:
 * Plan → Retrieve evidence → Diagnose → RCA → Risk-score → Action Plan → Explain
 * Includes dynamic stage activation, real-time handoff previews,
 * and a full node-graph visualization of the pipeline.
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
    key: "plan",
    name: "Planning Agent",
    role: "Initialize Graph & Verify Signals",
    icon: <Workflow className="h-4 w-4" />,
    handoff: "Raw sensor state & alarm delta → execution strategy",
    matchesPhases: ["Plan"],
    accent: "indigo",
  },
  {
    key: "retrieve",
    name: "Evidence Retrieval Agent",
    role: "Chroma/FAISS Vector RAG Search",
    icon: <BookOpenText className="h-4 w-4" />,
    handoff: "Fault signature → cited SOPs, manuals, & clearances",
    matchesPhases: ["Retrieve evidence"],
    accent: "sky",
  },
  {
    key: "diagnose",
    name: "Diagnostics Agent",
    role: "Isolation-Forest & Sensor Drift",
    icon: <Activity className="h-4 w-4" />,
    handoff: "Vetting stream vectors → confidence indexes",
    matchesPhases: ["Diagnose"],
    accent: "rose",
  },
  {
    key: "rca",
    name: "RCA Agent",
    role: "Physics-based Degradation & Trace",
    icon: <Antenna className="h-4 w-4" />,
    handoff: "Sensor correlation data → definitive root cause",
    matchesPhases: ["RCA"],
    accent: "purple",
  },
  {
    key: "risk_score",
    name: "Risk Scorer Agent",
    role: "RUL Curves & Process Loss",
    icon: <ShieldAlert className="h-4 w-4" />,
    handoff: "Arrhenius coefficients → downtime hours & penalty fees",
    matchesPhases: ["Risk-score"],
    accent: "amber",
  },
  {
    key: "action_plan",
    name: "Requisition Planner Agent",
    role: "Spares Sourcing & Scheduling",
    icon: <Package className="h-4 w-4" />,
    handoff: "Mitigation tasks → parts procurement & shift sync",
    matchesPhases: ["Action Plan"],
    accent: "emerald",
  },
  {
    key: "explain",
    name: "Explanation Narrator",
    role: "Gemini Expert Cognitive Explainer",
    icon: <Sparkles className="h-4 w-4" />,
    handoff: "Traceable data graph → operator-friendly brief",
    matchesPhases: ["Explain"],
    accent: "indigo",
  },
];

const accentMap: Record<string, { bar: string; ring: string; text: string; bg: string; soft: string; border: string }> = {
  indigo:  { bar: "bg-indigo-500",  ring: "ring-indigo-450",  text: "text-indigo-700",  bg: "bg-indigo-600",  soft: "bg-indigo-50", border: "border-indigo-200" },
  sky:     { bar: "bg-sky-500",     ring: "ring-sky-450",     text: "text-sky-700",     bg: "bg-sky-600",     soft: "bg-sky-50", border: "border-sky-200" },
  rose:    { bar: "bg-rose-500",    ring: "ring-rose-450",    text: "text-rose-700",    bg: "bg-rose-600",    soft: "bg-rose-50", border: "border-rose-200" },
  purple:  { bar: "bg-purple-500",  ring: "ring-purple-450",  text: "text-purple-700",  bg: "bg-purple-600",  soft: "bg-purple-50", border: "border-purple-200" },
  amber:   { bar: "bg-amber-500",   ring: "ring-amber-450",   text: "text-amber-700",   bg: "bg-amber-600",   soft: "bg-amber-50", border: "border-amber-200" },
  emerald: { bar: "bg-emerald-500", ring: "ring-emerald-450", text: "text-emerald-700", bg: "bg-emerald-600", soft: "bg-emerald-50", border: "border-emerald-200" },
  blue:    { bar: "bg-blue-500",    ring: "ring-blue-450",    text: "text-blue-700",    bg: "bg-blue-600",    soft: "bg-blue-50", border: "border-blue-200" },
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              <Cpu className="h-4 w-4 animate-spin-slow" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Responsible Multi-Agent Graph Loop · Active State
            </h3>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 text-[9px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1 border border-indigo-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              7 Specialist Agents
            </span>
          </div>
          <p className="mt-1 text-[11px] font-mono text-slate-500 leading-relaxed">
            Replacing monolithic structures with a modular <b className="text-indigo-600 font-extrabold">LangGraph state machine</b>. Transparent handoffs ensure every diagnostic argument is auditable and mathematically traceable.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 uppercase font-extrabold">
            Currently Executing: <b className="text-indigo-600 font-black">{stages[activeIdx].name}</b>
          </span>
        </div>
      </div>

      {/* Visibly Multi-Stage Node Trace Graph */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 shadow-inner">
        <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-500 border-b border-slate-900 pb-2 mb-3">
          <span>COGNITIVE PIPELINE EXECUTION SCHEMATIC (Plan ➔ Explain)</span>
          <span className="text-emerald-400 font-extrabold animate-pulse">● THREAD RESOLVED ON-CRON</span>
        </div>
        
        {/* Dynamic Connected Node Map */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 items-center">
          {stages.map((s, i) => {
            const isActive = i === activeIdx;
            const isCompleted = i < activeIdx;
            const accent = accentMap[s.accent];

            return (
              <React.Fragment key={`node-${s.key}`}>
                <div 
                  className={`p-3 rounded-lg border flex flex-col items-center justify-between transition-all duration-300 relative text-center h-[90px] ${
                    isActive 
                      ? "bg-slate-900 border-indigo-500/80 ring-1 ring-indigo-500 shadow-md shadow-indigo-500/10 scale-105"
                      : isCompleted
                      ? "bg-indigo-950/20 border-emerald-900/60 opacity-90"
                      : "bg-slate-950/40 border-slate-900 opacity-60"
                  }`}
                >
                  {/* Progress Line connectors for layout */}
                  {i < stages.length - 1 && (
                    <div className="hidden md:block absolute top-[25px] -right-[15px] w-[26px] h-0.5 z-20 pointer-events-none">
                      <div className={`h-full w-full ${isCompleted ? "bg-emerald-500 animate-pulse" : isActive ? "bg-indigo-500 border-dashed border-t" : "bg-slate-800"}`} />
                    </div>
                  )}

                  {/* Node icon and active state indicator */}
                  <div className="relative">
                    <div 
                      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                        isActive 
                          ? `${accent.bg} text-white ring-4 ring-indigo-500/35 scale-110` 
                          : isCompleted 
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                          : "bg-slate-900 text-slate-500 border border-slate-850"
                      }`}
                    >
                      {s.icon}
                    </div>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  {/* Stage Index badge */}
                  <span className={`text-[8px] font-mono uppercase font-black px-1.5 py-0.25 rounded-md mt-1.5 ${
                    isActive ? "bg-indigo-500 text-white font-extrabold" : isCompleted ? "bg-emerald-950/40 text-emerald-400" : "bg-slate-900 text-slate-500"
                  }`}>
                    {isCompleted ? "✓ DONE" : isActive ? "ACTIVE" : `STAGE ${i+1}`}
                  </span>

                  {/* Stage short name */}
                  <div className={`text-[9.5px] font-sans font-black tracking-tight mt-1 truncate max-w-full ${isActive ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                    {s.name.split(" ")[0]}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Stage Cards with Handoff Payloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-stretch">
        {stages.map((s, i) => {
          const a = accentMap[s.accent];
          const isActive = i === activeIdx;
          const isCompleted = i < activeIdx;
          
          return (
            <div
              key={s.key}
              className={`relative rounded-xl border p-3 hover:shadow-xs transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? `${a.soft} border-transparent ring-2 ${a.ring} shadow-md scale-[1.02] z-10`
                  : isCompleted
                  ? "bg-slate-50/60 border-slate-200"
                  : "bg-slate-50/30 border-slate-150 opacity-70"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`${isActive ? a.text : isCompleted ? "text-slate-600 font-bold" : "text-slate-500"} flex items-center gap-1 text-[9.5px] font-mono font-black uppercase tracking-wide`}>
                    <CircleDot className={`h-2.5 w-2.5 ${isActive ? `${a.text} animate-pulse` : isCompleted ? "text-emerald-500" : "text-slate-300"}`} />
                    Stage {i + 1}
                  </span>
                  <span className={`p-1.5 rounded-md ${isActive ? `${a.bg} text-white shadow-xs` : isCompleted ? "bg-emerald-50 border border-emerald-200 text-emerald-600" : "bg-white text-slate-400 border border-slate-150"}`}>
                    {s.icon}
                  </span>
                </div>

                <div className="text-[11px] font-extrabold text-slate-800 leading-tight font-sans">
                  {s.name}
                </div>
                <div className="text-[9.5px] font-mono text-slate-500 leading-tight">
                  {s.role}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-dashed border-slate-200/80">
                <span className="text-[8.5px] font-mono uppercase text-slate-400 font-black block tracking-wider">
                  Handoff output
                </span>
                <div className={`text-[9.5px] font-mono leading-relaxed mt-0.5 ${isActive ? "text-indigo-900 font-bold" : isCompleted ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  {s.handoff}
                </div>
              </div>

              {isActive && (
                <div className="absolute -top-2 left-3 px-1.5 py-0.5 rounded-md bg-slate-900 text-emerald-300 text-[8px] font-mono font-semibold uppercase tracking-widest border border-slate-850">
                  EXECUTING
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Standard parameters footer */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[10px] font-mono">
        <div className="rounded-xl bg-slate-50 border border-slate-150 p-2.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
          <p className="text-slate-600 leading-snug">
            <b>Orchestration Strategy:</b> LangGraph-based state logic with parallel tool execution
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-150 p-2.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />
          <p className="text-slate-600 leading-snug">
            <b>Vector Store Persistence:</b> Chromadb/FAISS hybrid embedding index models with cosine distance
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-150 p-2.5 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <p className="text-slate-600 leading-snug">
            <b>Safety Defend Audit:</b> Failsafe validation verifies ≥ 1 standard SOP documentation trace
          </p>
        </div>
      </div>
    </section>
  );
};

export default AgentPipelineLive;
