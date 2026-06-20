import React, { useMemo } from "react";
import { Asset } from "../types";
import { Grid3x3 } from "lucide-react";

/**
 * AnomalyHeatmapMatrix
 * ─────────────────────────────────────────────────────────────
 * Plant-zone × sensor-type density matrix. Each cell shows the
 * mean anomaly intensity (telemetry / limit ratio) for a given
 * area × sensor combination. Inspired by Mantis-AI's "Regional
 * Anomaly Matrix" — but computed live from the assets array.
 *
 * Areas (rows): Ironmaking · Steelmaking · Rolling Mill · Utilities
 * Sensors (cols): Temperature · Vibration · Pressure · Flow
 */

interface Props {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
}

const AREAS: Asset["area"][] = ["Ironmaking", "Steelmaking", "Rolling Mill", "Utilities"];
const SENSORS = ["temperature", "vibration", "pressure", "flow"] as const;
const SENSOR_LABEL: Record<string, string> = {
  temperature: "Temp",
  vibration: "Vibr.",
  pressure: "Press.",
  flow: "Flow",
};

function intensity(a: Asset, sensor: typeof SENSORS[number]): number {
  const t = a.telemetry;
  if (sensor === "temperature" && t.temperatureLimit) return t.temperature / t.temperatureLimit;
  if (sensor === "vibration" && t.vibrationLimit) return t.vibration / t.vibrationLimit;
  if (sensor === "pressure" && t.pressureLimit) return t.pressure / t.pressureLimit;
  if (sensor === "flow" && t.flowRateLimit && t.flowRate) return t.flowRate / t.flowRateLimit;
  return 0;
}

function toneFor(score: number) {
  // 0..0.6 emerald → 0.6..0.8 sky → 0.8..0.95 amber → 0.95+ rose
  if (score >= 0.95) return { bg: "bg-rose-500", text: "text-white", label: "critical" };
  if (score >= 0.8) return { bg: "bg-amber-500", text: "text-white", label: "elevated" };
  if (score >= 0.6) return { bg: "bg-sky-400", text: "text-white", label: "watch" };
  if (score > 0)    return { bg: "bg-emerald-400", text: "text-emerald-950", label: "normal" };
  return { bg: "bg-slate-100", text: "text-slate-400", label: "n/a" };
}

const AnomalyHeatmapMatrix: React.FC<Props> = ({ assets, onSelectAsset }) => {
  const matrix = useMemo(() => {
    return AREAS.map(area => {
      const inArea = assets.filter(a => a.area === area);
      const cells = SENSORS.map(s => {
        const scores = inArea
          .map(a => intensity(a, s))
          .filter(v => v > 0);
        const mean = scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 0;
        // peak asset for click-through
        let peakAsset: Asset | undefined;
        let peakScore = 0;
        inArea.forEach(a => {
          const v = intensity(a, s);
          if (v > peakScore) { peakScore = v; peakAsset = a; }
        });
        return { sensor: s, mean, peakAsset, peakScore, n: inArea.length };
      });
      return { area, cells, count: inArea.length };
    });
  }, [assets]);

  const totalElevated = matrix.reduce(
    (acc, row) => acc + row.cells.filter(c => c.mean >= 0.8).length,
    0
  );

  return (
    <section
      id="anomaly-heatmap-matrix"
      className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-feed"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700 ring-1 ring-rose-200">
              <Grid3x3 className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">
              Regional Anomaly Matrix · Plant Zones × Sensors
            </h3>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-rose-300 text-[9px] font-mono uppercase tracking-wider font-extrabold">
              {totalElevated} elevated cell{totalElevated === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-mono text-slate-500 leading-relaxed">
            Mean of <code className="px-1 bg-slate-100 rounded text-slate-700">sensor/limit</code> ratio for every asset in each plant zone.
            <b className="text-slate-700"> Click any cell to jump to its peak-stressed asset.</b>
          </p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          {[
            { c: "bg-emerald-400", l: "normal · <60%" },
            { c: "bg-sky-400", l: "watch · 60–80%" },
            { c: "bg-amber-500", l: "elevated · 80–95%" },
            { c: "bg-rose-500", l: "critical · >95%" },
          ].map(x => (
            <div key={x.l} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded ${x.c}`} />
              <span className="text-slate-500 font-extrabold uppercase">{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-mono uppercase font-extrabold text-slate-500 px-2 py-1">Plant Zone</th>
              {SENSORS.map(s => (
                <th key={s} className="text-[10px] font-mono uppercase font-extrabold text-slate-500 px-2 py-1 text-center">{SENSOR_LABEL[s]}</th>
              ))}
              <th className="text-[10px] font-mono uppercase font-extrabold text-slate-500 px-2 py-1 text-right"># assets</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map(row => (
              <tr key={row.area}>
                <td className="px-2 py-1 text-[11px] font-black text-slate-800 whitespace-nowrap">{row.area}</td>
                {row.cells.map(cell => {
                  const t = toneFor(cell.mean);
                  return (
                    <td key={cell.sensor} className="px-1 py-1">
                      <button
                        disabled={!cell.peakAsset}
                        onClick={() => cell.peakAsset && onSelectAsset(cell.peakAsset.id)}
                        className={`group relative w-full h-12 rounded-lg ${t.bg} ${t.text} ${cell.peakAsset ? "hover:scale-[1.03] hover:ring-2 hover:ring-indigo-400 cursor-pointer" : "cursor-default opacity-70"} transition-all`}
                        title={cell.peakAsset ? `Peak: ${cell.peakAsset.name} · ${(cell.peakScore * 100).toFixed(0)}%` : "no data"}
                      >
                        <div className="text-sm font-black tabular-nums leading-tight">
                          {cell.mean > 0 ? `${Math.round(cell.mean * 100)}%` : "—"}
                        </div>
                        <div className="text-[8px] font-mono uppercase tracking-wider opacity-90 font-extrabold">{t.label}</div>
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-1 text-right text-[11px] font-mono font-black text-slate-600 tabular-nums">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[10px] font-mono text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5">
        <b className="text-slate-700">Reading the matrix:</b> a red cell means
        <i> every</i> asset in that zone is &gt; 95 % of its limit on that sensor — the fastest path to a cascade failure.
        Click → asset deep-dive → diagnose. Empty cells mean no assets in that zone instrument that sensor.
      </div>
    </section>
  );
};

export default AnomalyHeatmapMatrix;
