/**
 * MPIAuditTrail.tsx
 * ----------------------------------------------------------------------------
 * Renders the deterministic 6-step Maintenance Priority Index breakdown.
 * Every step shows inputs, formula string, output, weight and contribution
 * — a judge can verify the final score by adding the contribution column.
 * ----------------------------------------------------------------------------
 */
import React, { useMemo } from "react";
import { Asset } from "../types";
import { computeMPI } from "../utils/anomalyEngine";

interface Props {
  asset: Asset | null;
}

const bandStyle: Record<string, string> = {
  Low:      "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  Medium:   "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  High:     "bg-orange-500/20 text-orange-300 border-orange-500/40",
  Critical: "bg-red-500/20 text-red-300 border-red-500/40",
};

const MPIAuditTrail: React.FC<Props> = ({ asset }) => {
  const result = useMemo(() => (asset ? computeMPI(asset) : null), [asset]);

  if (!asset || !result) {
    return (
      <section
        id="mpi-audit-trail"
        className="mt-6 rounded-lg border border-indigo-500/30 bg-slate-900/60 p-5"
      >
        <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300">
          Maintenance Priority Index — Audit Trail
        </h3>
        <p className="mt-2 text-xs text-slate-400">
          Select an asset to render the 6-step deterministic MPI breakdown.
        </p>
      </section>
    );
  }

  const total = result.trace.reduce((s, t) => s + t.contribution, 0);

  return (
    <section
      id="mpi-audit-trail"
      className="mt-6 rounded-lg border border-indigo-500/40 bg-slate-900/70 p-5"
    >
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300">
            Maintenance Priority Index — 6-Step Audit Trail
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            asset = <span className="text-slate-200">{asset.name}</span> · generated {new Date(result.generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-slate-700 bg-slate-800/70 px-3 py-1.5">
            <p className="text-[9px] uppercase text-slate-500">MPI</p>
            <p className="text-2xl font-black text-white leading-none">{result.index}</p>
          </div>
          <span className={`rounded border px-3 py-1.5 text-xs font-bold uppercase ${bandStyle[result.band]}`}>
            {result.band}
          </span>
        </div>
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Step</th>
              <th className="py-2 px-2">Inputs</th>
              <th className="py-2 px-2">Formula</th>
              <th className="py-2 px-2 text-right">Output</th>
              <th className="py-2 px-2 text-right">Weight</th>
              <th className="py-2 px-2 text-right">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {result.trace.map((t) => (
              <tr key={t.step} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                <td className="py-2 px-2 text-slate-500">{t.step}</td>
                <td className="py-2 px-2 text-slate-100 font-bold">{t.name}</td>
                <td className="py-2 px-2 text-slate-400">
                  {Object.entries(t.inputs).map(([k, v]) => (
                    <span key={k} className="mr-2">{k}=<span className="text-slate-200">{String(v)}</span></span>
                  ))}
                </td>
                <td className="py-2 px-2 text-emerald-300">{t.formula}</td>
                <td className="py-2 px-2 text-right text-slate-200">{t.output.toFixed(3)}</td>
                <td className="py-2 px-2 text-right text-slate-300">{t.weightApplied.toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-indigo-300 font-bold">{t.contribution.toFixed(3)}</td>
              </tr>
            ))}
            <tr className="bg-slate-800/60">
              <td colSpan={6} className="py-2 px-2 text-right font-bold uppercase text-slate-400">
                Σ contributions × 100 →
              </td>
              <td className="py-2 px-2 text-right font-black text-white">
                {(total * 100).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="$ / hour at risk" value={`$${result.dollarImpactPerHour.toLocaleString()}`} accent="text-amber-300" />
        <Stat label="Projected downtime" value={`${result.projectedDowntimeHours} h`} accent="text-orange-300" />
        <Stat label="Projected loss" value={`$${result.projectedLoss.toLocaleString()}`} accent="text-red-300" />
      </div>
    </section>
  );
};

const Stat: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <div className="rounded-md border border-slate-700 bg-slate-800/40 px-3 py-2">
    <p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`text-base font-black ${accent}`}>{value}</p>
  </div>
);

export default MPIAuditTrail;
