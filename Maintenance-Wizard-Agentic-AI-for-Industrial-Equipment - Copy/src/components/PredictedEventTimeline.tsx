import React, { useMemo } from "react";
import { Asset } from "../types";
import { CalendarClock, AlertTriangle, ChevronRight } from "lucide-react";

/**
 * PredictedEventTimeline
 * ─────────────────────────────────────────────────────────────
 * Multi-asset 48-hour forecast strip. Each Critical / Warning
 * asset is plotted on the timeline at its projected band-breach
 * window. Inspired by Mantis-AI's "Predicted Event Timeline" but
 * driven by the live `assets[].telemetry` deltas — no static
 * mocked event list.
 */

interface Props {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
}

interface Forecast {
  asset: Asset;
  hoursAhead: number; // 0-48
  severity: "warning" | "critical";
  cause: string;
}

function projectHours(a: Asset): number {
  // Higher utilization vs limit → sooner breach. Simple deterministic projection.
  const t = a.telemetry;
  const utilT = t.temperatureLimit ? t.temperature / t.temperatureLimit : 0;
  const utilV = t.vibrationLimit ? t.vibration / t.vibrationLimit : 0;
  const utilP = t.pressureLimit ? t.pressure / t.pressureLimit : 0;
  const peak = Math.max(utilT, utilV, utilP);
  // peak 1.0+ => 0-4h, 0.9 => 8-12h, 0.8 => 20-28h, 0.7 => 36-42h
  if (peak >= 1.0) return 2 + Math.round(peak % 1 * 2);
  if (peak >= 0.9) return 8 + Math.round((1 - peak) * 40);
  if (peak >= 0.8) return 20 + Math.round((1 - peak) * 60);
  return 36 + Math.round((1 - peak) * 30);
}

function pickCause(a: Asset): string {
  const t = a.telemetry;
  if (t.temperatureLimit && t.temperature / t.temperatureLimit >= 0.9) return "thermal limit drift";
  if (t.vibrationLimit && t.vibration / t.vibrationLimit >= 0.9) return "vibration band breach";
  if (t.pressureLimit && t.pressure / t.pressureLimit >= 0.9) return "pressure envelope";
  return "compound stress";
}

const sevColor: Record<string, string> = {
  warning: "bg-amber-500 ring-amber-200",
  critical: "bg-rose-500 ring-rose-200",
};
const sevText: Record<string, string> = {
  warning: "text-amber-700",
  critical: "text-rose-700",
};

const PredictedEventTimeline: React.FC<Props> = ({ assets, onSelectAsset }) => {
  const forecasts = useMemo<Forecast[]>(() => {
    return assets
      .filter(a => a.status === "Warning" || a.status === "Critical")
      .map(a => ({
        asset: a,
        hoursAhead: Math.min(48, projectHours(a)),
        severity: a.status === "Critical" ? "critical" : "warning",
        cause: pickCause(a),
      }))
      .sort((a, b) => a.hoursAhead - b.hoursAhead);
  }, [assets]);

  const ticks = [0, 6, 12, 18, 24, 30, 36, 42, 48];

  return (
    <section
      id="predicted-event-timeline"
      className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-feed"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-200">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Predicted Event Timeline · Next 48 h
            </h3>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-sky-300 text-[9px] font-mono uppercase tracking-wider font-extrabold">
              {forecasts.length} event{forecasts.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-mono text-slate-500 leading-relaxed">
            Every dot is a deterministic projection of when a sensor will breach its operating band, based on the live telemetry slope.
            <b className="text-slate-700"> Click any dot to jump to the asset</b>.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /><span className="text-slate-500 font-extrabold uppercase">critical</span></div>
          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /><span className="text-slate-500 font-extrabold uppercase">warning</span></div>
        </div>
      </div>

      <div className="mt-6">
        {/* Track */}
        <div className="relative h-24">
          {/* Backbone */}
          <div className="absolute inset-x-0 top-1/2 h-1 -mt-0.5 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-300" />
          {/* Hour ticks */}
          {ticks.map(h => (
            <div
              key={h}
              className="absolute -top-1 flex flex-col items-center"
              style={{ left: `${(h / 48) * 100}%`, transform: "translateX(-50%)" }}
            >
              <div className="h-3 w-px bg-slate-300" />
              <div className="mt-1 text-[9px] font-mono text-slate-500 font-extrabold">+{h}h</div>
            </div>
          ))}

          {/* Forecast dots */}
          {forecasts.map((f, idx) => {
            const left = (f.hoursAhead / 48) * 100;
            const aboveTrack = idx % 2 === 0;
            return (
              <button
                key={f.asset.id}
                onClick={() => onSelectAsset(f.asset.id)}
                className="absolute group focus:outline-none"
                style={{
                  left: `${left}%`,
                  top: aboveTrack ? "calc(50% - 14px)" : "calc(50% + 6px)",
                  transform: "translateX(-50%)",
                }}
                title={`${f.asset.name} · ${f.cause} · +${f.hoursAhead}h`}
              >
                <span className={`block h-3.5 w-3.5 rounded-full ring-4 ${sevColor[f.severity]} shadow group-hover:scale-125 transition-transform`} />
              </button>
            );
          })}
        </div>

        {/* Event list */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {forecasts.length === 0 && (
            <div className="md:col-span-3 text-center text-xs font-mono text-slate-400 py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No band breaches predicted in the next 48 h — fleet operating within nominal envelope.
            </div>
          )}
          {forecasts.map(f => (
            <button
              key={f.asset.id}
              onClick={() => onSelectAsset(f.asset.id)}
              className="text-left rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-colors p-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className={`text-[10px] font-mono font-extrabold uppercase ${sevText[f.severity]}`}>
                  +{f.hoursAhead}h · {f.severity}
                </div>
                <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <div className="mt-1 text-xs font-black text-slate-800 truncate">{f.asset.name}</div>
              <div className="text-[10px] font-mono text-slate-500 truncate flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                {f.cause} · {f.asset.area}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PredictedEventTimeline;
