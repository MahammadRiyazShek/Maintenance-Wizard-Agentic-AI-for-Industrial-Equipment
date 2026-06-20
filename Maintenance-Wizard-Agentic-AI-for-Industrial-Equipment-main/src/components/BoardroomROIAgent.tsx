/**
 * BoardroomROIAgent.tsx
 * ----------------------------------------------------------------------------
 * Aggregates per-asset MPI projections into a board-level ROI narrative:
 * $-loss avoided, payback months, top 3 contributors.
 * ----------------------------------------------------------------------------
 */
import React, { useMemo } from "react";
import { Asset } from "../types";
import { computeMPI } from "../utils/anomalyEngine";

interface Props { assets: Asset[]; }

const PROGRAM_COST = 6_500_000;     // assumed all-in annual program cost ($)

const BoardroomROIAgent: React.FC<Props> = ({ assets }) => {
  const summary = useMemo(() => {
    const rows = assets.map((a) => ({ asset: a, mpi: computeMPI(a) }));
    const sorted = rows.sort((a, b) => b.mpi.projectedLoss - a.mpi.projectedLoss);
    const exposure = sorted.reduce((s, r) => s + r.mpi.projectedLoss, 0);
    const avoided = Math.round(exposure * 0.78);   // assumed 78% mitigation effectiveness
    const paybackMonths = avoided > 0 ? Number(((PROGRAM_COST / avoided) * 12).toFixed(1)) : 0;
    return { rows: sorted, exposure, avoided, paybackMonths, top3: sorted.slice(0, 3) };
  }, [assets]);

  return (
    <section
      id="boardroom-roi"
      className="mt-6 rounded-lg border border-amber-500/40 bg-slate-900/70 p-5"
    >
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
            Boardroom ROI Agent
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            assets evaluated = {assets.length} · program cost assumption = ${PROGRAM_COST.toLocaleString()}
          </p>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <KPI label="Annual exposure" value={`$${summary.exposure.toLocaleString()}`} colour="text-red-300" />
        <KPI label="Loss avoided (78% effective)" value={`$${summary.avoided.toLocaleString()}`} colour="text-emerald-300" />
        <KPI label="Net ROI" value={`$${(summary.avoided - PROGRAM_COST).toLocaleString()}`} colour="text-amber-300" />
        <KPI label="Payback" value={`${summary.paybackMonths} months`} colour="text-cyan-300" />
      </div>

      <div className="mt-4">
        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">
          top 3 dollar-weighted contributors
        </p>
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-1 px-2">asset</th>
              <th className="py-1 px-2 text-right">MPI</th>
              <th className="py-1 px-2">band</th>
              <th className="py-1 px-2 text-right">$/hr</th>
              <th className="py-1 px-2 text-right">projected loss</th>
            </tr>
          </thead>
          <tbody>
            {summary.top3.map(({ asset, mpi }) => (
              <tr key={asset.id} className="border-b border-slate-800/60">
                <td className="py-1 px-2 text-slate-100">{asset.name}</td>
                <td className="py-1 px-2 text-right text-slate-300">{mpi.index}</td>
                <td className="py-1 px-2 text-amber-300">{mpi.band}</td>
                <td className="py-1 px-2 text-right text-slate-300">${mpi.dollarImpactPerHour.toLocaleString()}</td>
                <td className="py-1 px-2 text-right text-red-300 font-bold">${mpi.projectedLoss.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] text-slate-500 font-mono">
        Narrative: with the Wizard armed, the program avoids ≈ ${summary.avoided.toLocaleString()} in
        annualised downtime, achieving payback in {summary.paybackMonths} months against a
        ${PROGRAM_COST.toLocaleString()} annual investment.
      </p>
    </section>
  );
};

const KPI: React.FC<{ label: string; value: string; colour: string }> = ({ label, value, colour }) => (
  <div className="rounded-md border border-slate-700 bg-slate-800/40 px-3 py-2">
    <p className="text-[9px] uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`text-base font-black ${colour}`}>{value}</p>
  </div>
);

export default BoardroomROIAgent;
