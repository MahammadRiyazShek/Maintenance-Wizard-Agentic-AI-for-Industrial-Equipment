import React, { useMemo } from "react";
import { Asset } from "../types.ts";
import { computeAssetAnalytics, rankAssetsByPriority } from "../utils/assetAnalytics.ts";
import { AlertTriangle, ArrowRight, DollarSign, Factory, TimerReset } from "lucide-react";

interface BusinessImpactPanelProps {
  asset: Asset | null;
  assets: Asset[];
}

export default function BusinessImpactPanel({ asset, assets }: BusinessImpactPanelProps) {
  const ranking = useMemo(() => rankAssetsByPriority(assets), [assets]);

  if (!asset) {
    return null;
  }

  const analytics = computeAssetAnalytics(asset, assets);
  const rank = ranking.findIndex((item) => item.asset.id === asset.id) + 1;
  const lineRisk = Math.max(1, Math.round((analytics.failureProbability * analytics.dependencyExposure) * 10));
  const thisWeekExposure = asset.delayCostPerHour * 24 * 7;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-600" />
            Business impact & maintenance priority
          </h3>
          <p className="text-[11px] text-slate-600 mt-1">
            Converts the current alarm context into avoidable-loss, plant-rank, and intervention-window numbers.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/70 border border-amber-200 text-[10px] font-mono font-bold text-amber-800">
          Asset rank #{rank || "-"} of {assets.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
        <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Avoidable loss</div>
          <div className="mt-2 text-2xl font-black text-rose-600 font-mono">${analytics.avoidableLossUSD.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Within {analytics.interventionWindowHours}h action window</div>
        </div>
        <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1"><TimerReset className="h-3.5 w-3.5" /> Delay rate</div>
          <div className="mt-2 text-2xl font-black text-amber-700 font-mono">${asset.delayCostPerHour.toLocaleString()}/h</div>
          <div className="text-[10px] text-slate-500 mt-1">Current selected asset penalty</div>
        </div>
        <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1"><Factory className="h-3.5 w-3.5" /> Cascade exposure</div>
          <div className="mt-2 text-2xl font-black text-indigo-700 font-mono">{lineRisk}/10</div>
          <div className="text-[10px] text-slate-500 mt-1">Failure probability × dependency reach</div>
        </div>
        <div className="rounded-xl bg-white/80 border border-amber-100 p-3">
          <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5" /> Weekly exposure</div>
          <div className="mt-2 text-2xl font-black text-slate-800 font-mono">${thisWeekExposure.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">If left unmanaged for 7 days</div>
        </div>
      </div>
    </div>
  );
}
