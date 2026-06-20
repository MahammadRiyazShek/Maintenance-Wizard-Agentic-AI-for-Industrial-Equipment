/**
 * AutopilotDaemonConsole.tsx
 * ----------------------------------------------------------------------------
 * Operator-facing surface for the server-side autonomous daemon. Polls
 * /api/autopilot/{status,events} on a 4-second cadence. Lets the supervisor
 * flip between off / monitor / autopilot.
 *
 * The daemon is owned by Node — closing every browser tab does NOT stop it.
 * ----------------------------------------------------------------------------
 */
import React, { useEffect, useState } from "react";

type Mode = "off" | "monitor" | "autopilot";

interface Status {
  mode: Mode;
  startedAt: string;
  tickIntervalMs: number;
  ticks: number;
  lastTick?: string;
  queuedAssets: number;
  eventsBuffered: number;
  outcomes: number;
}

interface Event {
  id: string;
  ts: string;
  assetId: string;
  assetName: string;
  phase: string;
  message: string;
  mpi?: number;
  ai4iMode?: string;
  ai4iProbability?: number;
  workOrderId?: string;
}

const modePill: Record<Mode, string> = {
  off:       "bg-slate-600/30 text-slate-300 border-slate-500/40",
  monitor:   "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  autopilot: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

const AutopilotDaemonConsole: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [err, setErr] = useState<string>("");

  async function refresh() {
    try {
      const [s, e] = await Promise.all([
        fetch("/api/autopilot/status").then((r) => r.json()),
        fetch("/api/autopilot/events?limit=30").then((r) => r.json()),
      ]);
      setStatus(s);
      setEvents(e.events || []);
      setErr("");
    } catch (ex: any) {
      setErr(String(ex?.message || ex));
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, []);

  async function setMode(mode: Mode) {
    try {
      await fetch("/api/autopilot/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      refresh();
    } catch (ex: any) {
      setErr(String(ex?.message || ex));
    }
  }

  return (
    <section
      id="autopilot-daemon-console"
      className="mt-6 rounded-lg border border-emerald-500/40 bg-slate-900/70 p-5"
    >
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300">
            Autonomous Server Daemon
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            zero-touch — keeps running even with all browser tabs closed.
          </p>
        </div>
        {status && (
          <span className={`rounded border px-3 py-1.5 text-xs font-bold uppercase ${modePill[status.mode]}`}>
            mode = {status.mode}
          </span>
        )}
      </header>

      <div className="mt-3 flex gap-2">
        {(["off", "monitor", "autopilot"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-[11px] uppercase font-bold px-3 py-1.5 rounded border transition-colors ${
              status?.mode === m
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                : "border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-700/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {status && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          <Stat label="ticks" value={String(status.ticks)} />
          <Stat label="interval" value={`${status.tickIntervalMs} ms`} />
          <Stat label="queued assets" value={String(status.queuedAssets)} />
          <Stat label="events buffered" value={String(status.eventsBuffered)} />
          <Stat label="outcomes" value={String(status.outcomes)} />
        </div>
      )}

      {err && <p className="mt-2 text-[11px] text-red-400 font-mono">error: {err}</p>}

      <div className="mt-4 rounded-md border border-slate-700 bg-slate-950/60 p-3 max-h-72 overflow-y-auto font-mono text-[11px]">
        {events.length === 0 && <p className="text-slate-500">waiting for events…</p>}
        {events.map((e) => (
          <p key={e.id} className="leading-snug">
            <span className="text-slate-500">[{new Date(e.ts).toLocaleTimeString()}]</span>{" "}
            <span className={
              e.phase === "dispatch" ? "text-emerald-300" :
              e.phase === "diagnose" ? "text-cyan-300"    :
              e.phase === "plan"     ? "text-amber-300"   :
              e.phase === "skip"     ? "text-slate-500"   : "text-slate-300"
            }>
              {e.phase.toUpperCase()}
            </span>{" "}
            <span className="text-slate-400">{e.assetName}</span>{" "}
            <span className="text-slate-200">— {e.message}</span>
            {typeof e.mpi === "number" && (
              <span className="text-indigo-300"> · MPI={e.mpi}</span>
            )}
            {e.workOrderId && (
              <span className="text-emerald-300"> · {e.workOrderId}</span>
            )}
          </p>
        ))}
      </div>
    </section>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-slate-700 bg-slate-800/40 px-3 py-1.5">
    <p className="text-[9px] uppercase text-slate-500">{label}</p>
    <p className="text-sm font-black text-white">{value}</p>
  </div>
);

export default AutopilotDaemonConsole;
