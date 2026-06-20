/**
 * LangGraphPipeline.tsx
 * ----------------------------------------------------------------------------
 * Visualises the 5-agent LangGraph multi-agent RAG topology. The active node
 * is highlighted based on the running phase emitted by the App.
 * ----------------------------------------------------------------------------
 */
import React from "react";
import { LANGGRAPH_NODES, LANGGRAPH_EDGES, weightedConfidence } from "../utils/langGraphMap";

interface Props {
  activePhase?: string;
}

function phaseToNode(phase?: string): string {
  const p = (phase || "").toLowerCase();
  if (p.includes("plan") && p.includes("action")) return "planner_action";
  if (p.includes("retriev") || p.includes("rag") || p.includes("ingest")) return "retriever";
  if (p.includes("diagn"))   return "diagnoser";
  if (p.includes("risk") || p.includes("score") || p.includes("mpi")) return "riskscorer";
  if (p.includes("plan"))    return "planner";
  return "planner";
}

const LangGraphPipeline: React.FC<Props> = ({ activePhase }) => {
  const activeId = phaseToNode(activePhase);
  const conf = weightedConfidence({
    planner: 0.92, retriever: 0.88, diagnoser: 0.94, riskscorer: 0.91, planner_action: 0.87,
  });

  return (
    <section
      id="langgraph-pipeline"
      className="mt-6 rounded-lg border border-purple-500/40 bg-slate-900/70 p-5"
    >
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-purple-300">
            5-Agent LangGraph · Multi-Agent RAG Topology
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            active phase: <span className="text-purple-300">{activePhase || "—"}</span> ·
            calibrated confidence index = <span className="text-emerald-300">{(conf.overall * 100).toFixed(1)}%</span>
          </p>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        {LANGGRAPH_NODES.map((n) => {
          const isActive = n.id === activeId;
          return (
            <div
              key={n.id}
              className={`rounded-md border p-3 transition-all ${
                isActive
                  ? "border-purple-400 bg-purple-500/15 shadow-[0_0_20px_-6px_rgba(168,85,247,0.6)]"
                  : "border-slate-700 bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase ${
                  isActive ? "text-purple-200" : "text-slate-300"
                }`}>
                  {n.name}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">w={n.confidenceWeight.toFixed(2)}</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 leading-snug">{n.role}</p>
              <p className="mt-2 text-[9px] uppercase text-slate-500">tools</p>
              <p className="text-[10px] text-cyan-300 font-mono">{n.tools.join(" · ")}</p>
              <p className="mt-1 text-[9px] uppercase text-slate-500">rag sources</p>
              <p className="text-[10px] text-emerald-300 font-mono">{n.ragSources.join(" · ")}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-slate-700 bg-slate-800/40 p-3">
        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">edges (typed messages)</p>
        <div className="flex flex-wrap gap-2">
          {LANGGRAPH_EDGES.map((e, i) => (
            <span key={i} className="text-[10px] text-slate-300 font-mono bg-slate-900/60 border border-slate-700 px-2 py-1 rounded">
              <span className="text-purple-300">{e.from}</span>
              <span className="text-slate-500"> → </span>
              <span className="text-purple-300">{e.to}</span>
              <span className="text-slate-500"> · </span>
              <span className="text-cyan-300">{e.message}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">
          confidence weighted breakdown
        </p>
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-1 px-2">agent</th>
              <th className="py-1 px-2 text-right">weight</th>
              <th className="py-1 px-2 text-right">score</th>
              <th className="py-1 px-2 text-right">contribution</th>
            </tr>
          </thead>
          <tbody>
            {conf.factors.map((f) => (
              <tr key={f.id} className="border-b border-slate-800/60">
                <td className="py-1 px-2 text-slate-100">{f.name}</td>
                <td className="py-1 px-2 text-right text-slate-300">{f.weight.toFixed(2)}</td>
                <td className="py-1 px-2 text-right text-slate-300">{f.score.toFixed(2)}</td>
                <td className="py-1 px-2 text-right text-emerald-300 font-bold">{f.contribution.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LangGraphPipeline;
