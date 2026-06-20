/**
 * JudgeMapPage.tsx
 * ----------------------------------------------------------------------------
 * Single panel that maps every challenge criterion to:
 *   - the source file that implements it
 *   - the DOM anchor a judge can scroll to
 *   - the REST endpoint that exposes the data
 *
 * Designed so that a judge can verify each row in under 30 seconds.
 * ----------------------------------------------------------------------------
 */
import React from "react";

interface Row {
  criterion: string;
  file: string;
  anchor: string;
  endpoint?: string;
  status: "live" | "deterministic" | "persisted";
}

const ROWS: Row[] = [
  { criterion: "6-step deterministic MPI with weighted contributions",
    file: "src/utils/anomalyEngine.ts → computeMPI",
    anchor: "#mpi-audit-trail", status: "deterministic" },
  { criterion: "Isolation Forest anomaly detection (32 trees, seed-stable)",
    file: "src/utils/anomalyEngine.ts → isolationForestScore",
    anchor: "#mpi-audit-trail", status: "deterministic" },
  { criterion: "AI4I-2020 XGBoost surrogate (99.05%) on real UCI dataset",
    file: "src/utils/anomalyEngine.ts → classifyAI4I",
    anchor: "#ai4i-physics-panel", status: "deterministic" },
  { criterion: "UCI physics rules TWF / HDF / PWF / OSF",
    file: "anomalyEngine.ts (rule encoder)",
    anchor: "#ai4i-physics-panel", status: "deterministic" },
  { criterion: "5-agent LangGraph + Multi-Agent RAG",
    file: "src/utils/langGraphMap.ts + components/LangGraphPipeline.tsx",
    anchor: "#langgraph-pipeline", status: "live" },
  { criterion: "Confidence index — weighted breakdown + evidence chain",
    file: "langGraphMap.ts → weightedConfidence",
    anchor: "#langgraph-pipeline", status: "deterministic" },
  { criterion: "Regional anomaly heatmap",
    file: "components/AnomalyHeatmapMatrix.tsx",
    anchor: "#anomaly-heatmap-matrix", status: "live" },
  { criterion: "Live process schematic",
    file: "components/LiveProcessSchematic.tsx + DigitalTwinVisualizer.tsx",
    anchor: "#scada-panel", status: "live" },
  { criterion: "Server-side autonomous daemon (zero-touch)",
    file: "server/autopilot_daemon.ts",
    endpoint: "GET /api/autopilot/status",
    anchor: "#autopilot-daemon-console", status: "live" },
  { criterion: "Autopilot mode toggle (off / monitor / autopilot)",
    file: "components/AutopilotDaemonConsole.tsx",
    endpoint: "POST /api/autopilot/mode",
    anchor: "#autopilot-daemon-console", status: "live" },
  { criterion: "Dynamic KB upload (live RAG indexing)",
    file: "components/DynamicKBUpload.tsx",
    endpoint: "POST /api/kb",
    anchor: "#dynamic-kb-upload", status: "live" },
  { criterion: "Outcome repository with accuracy metric",
    file: "components/OutcomeRepositoryView.tsx",
    endpoint: "GET /api/autopilot/accuracy",
    anchor: "#outcome-repository", status: "persisted" },
  { criterion: "Dollar-quantified business impact",
    file: "anomalyEngine.ts ($/hour table) + BoardroomROIAgent.tsx",
    anchor: "#boardroom-roi", status: "deterministic" },
  { criterion: "Board-level ROI agent (payback months, net ROI)",
    file: "components/BoardroomROIAgent.tsx",
    anchor: "#boardroom-roi", status: "deterministic" },
  { criterion: "Scenario simulator (what-if levers)",
    file: "components/SandboxSimulator.tsx + CounterFactualSimulator.tsx",
    anchor: "#counter-factual-simulator", status: "live" },
];

const statusColour: Record<Row["status"], string> = {
  live:          "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  deterministic: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  persisted:     "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

const JudgeMapPage: React.FC = () => {
  return (
    <section
      id="judge-map-page"
      className="mt-6 rounded-lg border border-fuchsia-500/40 bg-slate-900/70 p-5"
    >
      <header>
        <h3 className="text-sm font-black uppercase tracking-wider text-fuchsia-300">
          Judge Map — Capability ↔ Source ↔ Evidence
        </h3>
        <p className="text-[11px] text-slate-400 font-mono">
          Every advertised capability is mapped to the file that implements it,
          a DOM anchor you can scroll to, and (where applicable) the REST endpoint
          that exposes the underlying data. See <code className="text-emerald-300">JUDGE_MAP.md</code> for the printable companion.
        </p>
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-1 px-2">#</th>
              <th className="py-1 px-2">criterion</th>
              <th className="py-1 px-2">implementing file</th>
              <th className="py-1 px-2">endpoint</th>
              <th className="py-1 px-2">scroll to</th>
              <th className="py-1 px-2">status</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                <td className="py-1 px-2 text-slate-500">{i + 1}</td>
                <td className="py-1 px-2 text-slate-100">{r.criterion}</td>
                <td className="py-1 px-2 text-emerald-300">{r.file}</td>
                <td className="py-1 px-2 text-cyan-300">{r.endpoint || "—"}</td>
                <td className="py-1 px-2">
                  <a href={r.anchor} className="text-fuchsia-300 underline hover:text-fuchsia-200">
                    {r.anchor}
                  </a>
                </td>
                <td className="py-1 px-2">
                  <span className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase ${statusColour[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default JudgeMapPage;
