/**
 * OutcomeRepositoryView.tsx
 * ----------------------------------------------------------------------------
 * Closed-loop learning surface: list every dispatched work-order from the
 * autonomous daemon, let an engineer mark it correct/incorrect with a
 * cost-avoided dollar figure, and display the rolling accuracy + $ avoided.
 * Backed by /api/autopilot/outcomes (persisted to outcomes_store.json).
 * ----------------------------------------------------------------------------
 */
import React, { useEffect, useState } from "react";

interface Outcome {
  id: string;
  ts: string;
  assetId: string;
  assetName: string;
  predictedFailure: string;
  mpi: number;
  outcome: "pending" | "correct" | "incorrect";
  note?: string;
  costAvoided?: number;
}

const OutcomeRepositoryView: React.FC = () => {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [acc, setAcc] = useState<{ accuracy: number; resolved: number; correct: number; totalCostAvoided: number } | null>(null);
  const [busy, setBusy] = useState<string>("");

  async function refresh() {
    try {
      const [o, a] = await Promise.all([
        fetch("/api/autopilot/outcomes").then((r) => r.json()),
        fetch("/api/autopilot/accuracy").then((r) => r.json()),
      ]);
      setOutcomes(o.outcomes || []);
      setAcc(a);
    } catch {/* ignore */}
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, []);

  async function resolve(id: string, outcome: "correct" | "incorrect") {
    setBusy(id);
    try {
      const costAvoided = outcome === "correct"
        ? Number(prompt("$ avoided by this dispatch?", "120000") || 0)
        : 0;
      const note = prompt("optional note", "") || "";
      await fetch(`/api/autopilot/outcomes/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, note, costAvoided }),
      });
      refresh();
    } finally {
      setBusy("");
    }
  }

  return (
    <section
      id="outcome-repository"
      className="mt-6 rounded-lg border border-rose-500/40 bg-slate-900/70 p-5"
    >
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-rose-300">
            Outcome Repository · Closed-Loop Learning
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            persisted to server/outcomes_store.json — survives restarts.
          </p>
        </div>
        {acc && (
          <div className="flex gap-2">
            <Stat label="accuracy" value={`${(acc.accuracy * 100).toFixed(1)}%`} colour="text-emerald-300" />
            <Stat label="resolved" value={`${acc.correct}/${acc.resolved}`} colour="text-cyan-300" />
            <Stat label="$ avoided" value={`$${acc.totalCostAvoided.toLocaleString()}`} colour="text-amber-300" />
          </div>
        )}
      </header>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="py-1 px-2">work order</th>
              <th className="py-1 px-2">asset</th>
              <th className="py-1 px-2">predicted</th>
              <th className="py-1 px-2 text-right">MPI</th>
              <th className="py-1 px-2">outcome</th>
              <th className="py-1 px-2 text-right">$ avoided</th>
              <th className="py-1 px-2">resolve</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.length === 0 && (
              <tr>
                <td colSpan={7} className="py-3 px-2 text-center text-slate-500">
                  No outcomes yet — switch the daemon to 'autopilot' to dispatch.
                </td>
              </tr>
            )}
            {outcomes.map((o) => (
              <tr key={o.id} className="border-b border-slate-800/60">
                <td className="py-1 px-2 text-slate-200">{o.id}</td>
                <td className="py-1 px-2 text-slate-300">{o.assetName}</td>
                <td className="py-1 px-2 text-cyan-300">{o.predictedFailure}</td>
                <td className="py-1 px-2 text-right text-slate-300">{o.mpi}</td>
                <td className="py-1 px-2">
                  <span className={
                    o.outcome === "correct" ? "text-emerald-300" :
                    o.outcome === "incorrect" ? "text-red-300" :
                    "text-slate-400"
                  }>
                    {o.outcome}
                  </span>
                </td>
                <td className="py-1 px-2 text-right text-amber-300">
                  {o.costAvoided ? `$${o.costAvoided.toLocaleString()}` : "—"}
                </td>
                <td className="py-1 px-2">
                  {o.outcome === "pending" ? (
                    <div className="flex gap-1">
                      <button
                        disabled={busy === o.id}
                        onClick={() => resolve(o.id, "correct")}
                        className="rounded border border-emerald-500/40 bg-emerald-500/15 text-emerald-200 text-[10px] px-2 py-0.5 hover:bg-emerald-500/25"
                      >✓ correct</button>
                      <button
                        disabled={busy === o.id}
                        onClick={() => resolve(o.id, "incorrect")}
                        className="rounded border border-red-500/40 bg-red-500/15 text-red-200 text-[10px] px-2 py-0.5 hover:bg-red-500/25"
                      >✗ wrong</button>
                    </div>
                  ) : (
                    <span className="text-slate-500">{o.note || "—"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const Stat: React.FC<{ label: string; value: string; colour: string }> = ({ label, value, colour }) => (
  <div className="rounded-md border border-slate-700 bg-slate-800/40 px-3 py-1.5">
    <p className="text-[9px] uppercase text-slate-500">{label}</p>
    <p className={`text-sm font-black ${colour}`}>{value}</p>
  </div>
);

export default OutcomeRepositoryView;
