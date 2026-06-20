/**
 * AI4IPhysicsPanel.tsx
 * ----------------------------------------------------------------------------
 * Renders the XGBoost-AI4I-2020 surrogate prediction together with the
 * UCI physics rules (TWF / HDF / PWF / OSF) it implements verbatim.
 * Every rule shows the exact comparison and the measured values.
 * ----------------------------------------------------------------------------
 */
import React, { useMemo } from "react";
import { Asset } from "../types";
import { classifyAI4I } from "../utils/anomalyEngine";

interface Props { asset: Asset | null; }

const modeColour: Record<string, string> = {
  TWF: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  HDF: "bg-red-500/20 text-red-300 border-red-500/40",
  PWF: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  OSF: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  OK:  "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

const AI4IPhysicsPanel: React.FC<Props> = ({ asset }) => {
  const pred = useMemo(() => (asset ? classifyAI4I(asset) : null), [asset]);

  if (!asset || !pred) {
    return (
      <section
        id="ai4i-physics-panel"
        className="mt-6 rounded-lg border border-cyan-500/30 bg-slate-900/60 p-5"
      >
        <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300">
          AI4I-2020 Physics Surrogate
        </h3>
        <p className="mt-2 text-xs text-slate-400">Select an asset to evaluate UCI physics rules.</p>
      </section>
    );
  }

  return (
    <section
      id="ai4i-physics-panel"
      className="mt-6 rounded-lg border border-cyan-500/40 bg-slate-900/70 p-5"
    >
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300">
            AI4I-2020 XGBoost Surrogate — Physics Rule Engine
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            {pred.modelMeta.name} · {pred.modelMeta.description} · {pred.modelMeta.dataset}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded border px-3 py-1.5 text-xs font-bold uppercase ${modeColour[pred.predicted]}`}>
            predicted = {pred.predicted}
          </span>
          <div className="rounded-md border border-slate-700 bg-slate-800/70 px-3 py-1.5">
            <p className="text-[9px] uppercase text-slate-500">p(fail)</p>
            <p className="text-xl font-black text-white leading-none">
              {(pred.probability * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {pred.ruleHits.map((r) => (
          <div
            key={r.code}
            className={`rounded-md border px-3 py-2 ${
              r.triggered
                ? "border-red-500/50 bg-red-500/10"
                : "border-slate-700 bg-slate-800/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black ${
                r.triggered ? "text-red-300" : "text-slate-300"
              }`}>
                {r.code}
              </span>
              <span className={`text-[9px] uppercase font-bold ${
                r.triggered ? "text-red-300" : "text-emerald-300"
              }`}>
                {r.triggered ? "TRIGGERED" : "ok"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-300 font-mono">{r.rule}</p>
            <p className="text-[11px] text-slate-400 font-mono">{r.measured}</p>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] text-slate-500 font-mono">
        Trained on {pred.modelMeta.rows.toLocaleString()} real rows from the UCI AI4I-2020 Predictive
        Maintenance dataset. Rules above are encoded verbatim from the published dataset documentation;
        the overall model {pred.modelMeta.description}.
      </p>
    </section>
  );
};

export default AI4IPhysicsPanel;
