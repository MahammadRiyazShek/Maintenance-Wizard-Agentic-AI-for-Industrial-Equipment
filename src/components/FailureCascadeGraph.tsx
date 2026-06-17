import React, { useMemo, useState } from "react";
import { GitBranch, AlertOctagon, ArrowRight, Zap } from "lucide-react";
import { Asset } from "../types";

/**
 * FailureCascadeGraph
 * --------------------------------------------------------
 * Visualizes how a single asset failure propagates downstream
 * through the steel plant's process-flow dependency chain.
 *
 * Process flow (integrated steel plant):
 *   Utilities  →  Ironmaking  →  Steelmaking  →  Rolling Mill
 *
 * If an asset trips, every downstream-area asset is at risk.
 * Revenue-at-risk is summed across all impacted assets in real time.
 */
interface FailureCascadeGraphProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset?: (id: string) => void;
}

// Process-area flow order: upstream → downstream
const AREA_ORDER: Array<Asset["area"]> = [
  "Utilities",
  "Ironmaking",
  "Steelmaking",
  "Rolling Mill",
];

// Flow descriptors between adjacent areas
const FLOW_LABEL: Record<string, string> = {
  "Utilities→Ironmaking": "Power · O₂ · gas",
  "Ironmaking→Steelmaking": "Hot metal",
  "Steelmaking→Rolling Mill": "Slabs / billets",
  "Utilities→Steelmaking": "Coolant · oxygen",
  "Utilities→Rolling Mill": "Coolant · power",
  "Ironmaking→Rolling Mill": "Indirect feedstock",
};

export default function FailureCascadeGraph({
  assets,
  selectedAssetId,
  onSelectAsset,
}: FailureCascadeGraphProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const focusId = hoverId || selectedAssetId;
  const focusedAsset = assets.find((a) => a.id === focusId);

  // Compute downstream impact: every asset in a downstream area
  const cascade = useMemo(() => {
    if (!focusedAsset) return { impactedIds: new Set<string>(), areaJumps: [] as string[] };

    const focusAreaIdx = AREA_ORDER.indexOf(focusedAsset.area);
    if (focusAreaIdx < 0) return { impactedIds: new Set<string>(), areaJumps: [] };

    const downstreamAreas = AREA_ORDER.slice(focusAreaIdx + 1);
    const impactedIds = new Set<string>(
      assets
        .filter((a) => downstreamAreas.includes(a.area) && a.id !== focusedAsset.id)
        .map((a) => a.id)
    );

    const areaJumps: string[] = [];
    for (let i = focusAreaIdx; i < AREA_ORDER.length - 1; i++) {
      areaJumps.push(`${AREA_ORDER[i]}→${AREA_ORDER[i + 1]}`);
    }

    return { impactedIds, areaJumps };
  }, [focusedAsset, assets]);

  // Revenue at risk
  const revenueAtRisk = useMemo(() => {
    if (!focusedAsset) return 0;
    const impacted = new Set([focusedAsset.id, ...cascade.impactedIds]);
    return assets
      .filter((a) => impacted.has(a.id))
      .reduce((sum, a) => sum + (a.delayCostPerHour || 0), 0);
  }, [focusedAsset, cascade.impactedIds, assets]);

  // Group assets by area for column layout
  const grouped = useMemo(() => {
    const out: Record<string, Asset[]> = {};
    AREA_ORDER.forEach((area) => {
      out[area] = assets.filter((a) => a.area === area);
    });
    return out;
  }, [assets]);

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl shadow-indigo-900/20">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-400/30 rounded-lg">
            <GitBranch className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 leading-tight">
              Failure Cascade Graph
            </h3>
            <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
              Click any asset · see what trips downstream
            </p>
          </div>
        </div>
        {focusedAsset && (
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-widest">
              Revenue at risk / hr
            </div>
            <div className="text-2xl font-bold text-rose-400 tabular-nums leading-tight">
              ${(revenueAtRisk / 1000).toFixed(1)}K
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {cascade.impactedIds.size} asset{cascade.impactedIds.size !== 1 ? "s" : ""} impacted
            </div>
          </div>
        )}
      </div>

      {/* Area-column layout: 4 columns, one per process area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {AREA_ORDER.map((area, areaIdx) => (
          <div key={area} className="space-y-2">
            {/* Area header */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] font-mono font-black text-indigo-300 uppercase tracking-widest">
                {areaIdx + 1}. {area}
              </span>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                {grouped[area].length}
              </span>
            </div>

            {/* Assets in this area */}
            <div className="space-y-2">
              {grouped[area].map((asset) => {
                const isFocus = asset.id === focusId;
                const isImpacted = cascade.impactedIds.has(asset.id);
                return (
                  <button
                    key={asset.id}
                    onClick={() => onSelectAsset?.(asset.id)}
                    onMouseEnter={() => setHoverId(asset.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className={`group relative w-full text-left rounded-lg border-2 p-2.5 transition-all duration-300 ${
                      isFocus
                        ? "border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400/40 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                        : isImpacted
                        ? "border-rose-400/60 bg-rose-500/10"
                        : asset.status === "Critical"
                        ? "border-rose-500/40 bg-rose-500/5 opacity-80 hover:opacity-100"
                        : asset.status === "Warning"
                        ? "border-amber-500/40 bg-amber-500/5 opacity-80 hover:opacity-100"
                        : "border-slate-700 bg-slate-900/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {isFocus && (
                      <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-indigo-500 text-white text-[8px] font-mono font-black rounded uppercase tracking-widest shadow-lg">
                        ROOT
                      </div>
                    )}
                    {isImpacted && !isFocus && (
                      <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-mono font-black rounded uppercase tracking-widest flex items-center gap-0.5 shadow-lg animate-pulse">
                        <Zap className="w-2 h-2" />
                        HIT
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
                        {asset.id}
                      </span>
                      <span
                        className={`flex-shrink-0 h-1.5 w-1.5 rounded-full mt-0.5 ${
                          asset.status === "Critical"
                            ? "bg-rose-400 animate-pulse"
                            : asset.status === "Warning"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-200 mt-1 leading-snug line-clamp-2 min-h-[1.8rem]">
                      {asset.name}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5 tabular-nums">
                      ${(asset.delayCostPerHour / 1000).toFixed(1)}K/hr
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Cascade trace footer */}
      {focusedAsset && cascade.areaJumps.length > 0 && (
        <div className="mt-5 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
              Cascade trace — failure propagates {cascade.areaJumps.length} process stage
              {cascade.areaJumps.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-1 bg-indigo-500/20 border border-indigo-400/40 rounded text-indigo-200 font-semibold">
              {focusedAsset.area}
            </span>
            {cascade.areaJumps.map((jump, i) => {
              const toArea = jump.split("→")[1];
              return (
                <React.Fragment key={i}>
                  <ArrowRight className="w-3 h-3 text-rose-400" />
                  <span className="text-[9px] text-slate-400 px-1.5 py-0.5 bg-slate-800/60 rounded">
                    {FLOW_LABEL[jump] || jump}
                  </span>
                  <ArrowRight className="w-3 h-3 text-rose-400" />
                  <span className="px-2 py-1 bg-rose-500/20 border border-rose-400/40 rounded text-rose-200 font-semibold">
                    {toArea}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {focusedAsset && cascade.areaJumps.length === 0 && (
        <div className="mt-5 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
          <span className="text-xs font-mono text-emerald-300">
            ✓ Terminal-area asset — no downstream process cascade
          </span>
        </div>
      )}
    </div>
  );
}
