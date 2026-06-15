import React, { useMemo, useState } from "react";
import { Asset } from "../types.ts";
import { computeAssetAnalytics } from "../utils/assetAnalytics.ts";
import { Activity, AlertTriangle, GitBranch, Zap } from "lucide-react";

interface CascadeDependencyGraphProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
}

/**
 * CascadeDependencyGraph
 * ---------------------------------------------------------------
 * Visualises the plant as a directed dependency graph of areas and
 * shows how a failure in a single asset propagates downstream
 * (upstream area outages stall the next area).
 *
 * Topology (steel plant flow):
 *   Ironmaking  ->  Steelmaking  ->  Rolling Mill
 *      ^                                  ^
 *      |                                  |
 *      +---------- Utilities -------------+
 *
 * Cascade Risk Score for an asset =
 *      P(failure)                                   (from Isolation-Forest)
 *    × downstream-asset count weight                (graph reach)
 *    × area criticality coefficient
 *    × 10                                            (scaled to 0-100)
 *
 * Pure presentational; reads analytics from real ML engine.
 */
export default function CascadeDependencyGraph({
  assets,
  selectedAssetId,
  onSelectAsset,
}: CascadeDependencyGraphProps) {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  // Area definitions with x,y layout positions on SVG canvas
  const areaLayout: { [k: string]: { x: number; y: number; label: string; downstream: string[] } } = {
    Ironmaking:   { x: 90,  y: 80,  label: "IRONMAKING",   downstream: ["Steelmaking"] },
    Steelmaking:  { x: 320, y: 80,  label: "STEELMAKING",  downstream: ["Rolling Mill"] },
    "Rolling Mill": { x: 550, y: 80, label: "ROLLING MILL", downstream: [] },
    Utilities:    { x: 320, y: 220, label: "UTILITIES",    downstream: ["Ironmaking", "Steelmaking", "Rolling Mill"] },
  };

  // Group assets by area and compute analytics for each
  type AreaStats = { assets: Asset[]; avgFailure: number; maxFailure: number; topAsset?: Asset };
  const areaSummary = useMemo<{ [k: string]: AreaStats }>(() => {
    const out: { [k: string]: AreaStats } = {};
    Object.keys(areaLayout).forEach((area) => {
      const inArea = assets.filter((a) => a.area === area);
      let sumP = 0;
      let maxP = 0;
      let topAsset: Asset | undefined = undefined;
      inArea.forEach((a) => {
        const an = computeAssetAnalytics(a, assets);
        sumP += an.failureProbability;
        if (an.failureProbability > maxP) {
          maxP = an.failureProbability;
          topAsset = a;
        }
      });
      out[area] = {
        assets: inArea,
        avgFailure: inArea.length ? sumP / inArea.length : 0,
        maxFailure: maxP,
        topAsset,
      };
    });
    return out;
  }, [assets]);

  // Selected asset's cascade impact: which downstream areas are at risk?
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const selectedAnalytics = selectedAsset ? computeAssetAnalytics(selectedAsset, assets) : null;

  const cascadeFromSelected = useMemo(() => {
    if (!selectedAsset) return [];
    const visited = new Set<string>();
    const queue: string[] = [selectedAsset.area];
    const reach: string[] = [];
    while (queue.length) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      reach.push(cur);
      const layout = areaLayout[cur];
      if (layout) queue.push(...layout.downstream);
    }
    // Exclude source area from reach list (it's the origin)
    return reach.filter((a) => a !== selectedAsset.area);
  }, [selectedAsset, assets]);

  // Color for a node based on max failure probability
  const colorForRisk = (p: number) => {
    if (p >= 0.7) return { fill: "#fee2e2", stroke: "#dc2626", glow: "rgba(220,38,38,0.45)" };
    if (p >= 0.5) return { fill: "#fef3c7", stroke: "#d97706", glow: "rgba(217,119,6,0.40)" };
    if (p >= 0.35) return { fill: "#dbeafe", stroke: "#2563eb", glow: "rgba(37,99,235,0.30)" };
    return { fill: "#dcfce7", stroke: "#16a34a", glow: "rgba(22,163,74,0.20)" };
  };

  // Build SVG arrows for downstream edges
  const edges: Array<{ from: string; to: string; activeFromSelection: boolean }> = [];
  Object.entries(areaLayout).forEach(([from, l]) => {
    l.downstream.forEach((to) => {
      const active = !!(selectedAsset && (selectedAsset.area === from || cascadeFromSelected.includes(from)));
      edges.push({ from, to, activeFromSelection: active });
    });
  });

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-indigo-600" />
            Cascade dependency graph
          </h3>
          <p className="text-[11px] text-slate-600 mt-1">
            How a single-asset failure propagates downstream. Edge = material / energy flow. Node color = max failure probability in that area (Isolation-Forest output).
          </p>
        </div>
        {selectedAsset && selectedAnalytics && (
          <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] font-mono text-rose-800">
            <span className="font-bold">Cascade reach:</span> {cascadeFromSelected.length || 0} area(s) at risk
          </div>
        )}
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox="0 0 700 320" className="w-full h-auto" style={{ minWidth: 580 }}>
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const a = areaLayout[edge.from];
            const b = areaLayout[edge.to];
            if (!a || !b) return null;
            const color = edge.activeFromSelection ? "#dc2626" : "#94a3b8";
            const dash = edge.activeFromSelection ? "0" : "4 4";
            return (
              <line
                key={`edge-${idx}`}
                x1={a.x + 70} y1={a.y + 30}
                x2={b.x} y2={b.y + 30}
                stroke={color}
                strokeWidth={edge.activeFromSelection ? 3 : 1.5}
                strokeDasharray={dash}
                markerEnd={edge.activeFromSelection ? "url(#arrow-active)" : "url(#arrow-default)"}
                opacity={edge.activeFromSelection ? 1 : 0.7}
              />
            );
          })}

          {/* Nodes */}
          {Object.entries(areaLayout).map(([areaKey, layout]) => {
            const summary = areaSummary[areaKey] || { assets: [], avgFailure: 0, maxFailure: 0 };
            const colors = colorForRisk(summary.maxFailure);
            const isSelectedArea = selectedAsset?.area === areaKey;
            const inCascade = cascadeFromSelected.includes(areaKey);
            return (
              <g
                key={areaKey}
                onMouseEnter={() => setHoveredArea(areaKey)}
                onMouseLeave={() => setHoveredArea(null)}
                style={{ cursor: "pointer" }}
              >
                {(isSelectedArea || inCascade) && (
                  <rect
                    x={layout.x - 6} y={layout.y - 6}
                    width={158} height={92}
                    rx={14}
                    fill="none"
                    stroke={isSelectedArea ? "#dc2626" : "#f59e0b"}
                    strokeWidth={2}
                    strokeDasharray={isSelectedArea ? "0" : "5 3"}
                    opacity={0.85}
                  />
                )}
                <rect
                  x={layout.x} y={layout.y}
                  width={146} height={80}
                  rx={10}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={2}
                  filter={hoveredArea === areaKey ? `drop-shadow(0 0 12px ${colors.glow})` : undefined}
                />
                <text x={layout.x + 73} y={layout.y + 22} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1e293b" fontFamily="monospace">
                  {layout.label}
                </text>
                <text x={layout.x + 73} y={layout.y + 40} textAnchor="middle" fontSize="9" fill="#475569" fontFamily="monospace">
                  {summary.assets.length} asset{summary.assets.length !== 1 ? "s" : ""}
                </text>
                <text x={layout.x + 73} y={layout.y + 58} textAnchor="middle" fontSize="11" fontWeight="700" fill={colors.stroke} fontFamily="monospace">
                  P(fail) max {Math.round(summary.maxFailure * 100)}%
                </text>
                <text x={layout.x + 73} y={layout.y + 73} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">
                  avg {Math.round(summary.avgFailure * 100)}%
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <g transform="translate(20, 280)">
            <text fontSize="9" fill="#64748b" fontFamily="monospace" fontWeight="700">RISK LEGEND:</text>
            <circle cx={90}  cy={-3} r={5} fill="#dcfce7" stroke="#16a34a" strokeWidth={1.5} />
            <text x={100} y={1} fontSize="9" fill="#475569" fontFamily="monospace">Healthy &lt;35%</text>
            <circle cx={185} cy={-3} r={5} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.5} />
            <text x={195} y={1} fontSize="9" fill="#475569" fontFamily="monospace">Watch 35-50%</text>
            <circle cx={290} cy={-3} r={5} fill="#fef3c7" stroke="#d97706" strokeWidth={1.5} />
            <text x={300} y={1} fontSize="9" fill="#475569" fontFamily="monospace">Warn 50-70%</text>
            <circle cx={395} cy={-3} r={5} fill="#fee2e2" stroke="#dc2626" strokeWidth={1.5} />
            <text x={405} y={1} fontSize="9" fill="#475569" fontFamily="monospace">Critical &gt;70%</text>
          </g>
        </svg>
      </div>

      {/* Cascade callout */}
      {selectedAsset && selectedAnalytics && (
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 font-mono">
                Cascade analysis · {selectedAsset.name}
              </div>
              <div className="text-[12px] text-slate-700 mt-1 leading-relaxed">
                A failure here at <b>P={Math.round(selectedAnalytics.failureProbability * 100)}%</b> propagates from <b>{selectedAsset.area}</b> into{" "}
                {cascadeFromSelected.length > 0 ? (
                  <>downstream area(s):{" "}
                    <span className="font-mono font-bold text-rose-700">{cascadeFromSelected.join(" → ")}</span>.{" "}
                    Cumulative-exposure rank <b>{selectedAnalytics.dependencyExposure}/10</b>.
                  </>
                ) : (
                  <>no downstream areas (terminal node). Cumulative-exposure rank <b>{selectedAnalytics.dependencyExposure}/10</b>.</>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick jump to top contributor of each area */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3">
        {(Object.entries(areaSummary) as Array<[string, AreaStats]>).map(([area, s]) => (
          <button
            key={area}
            onClick={() => s.topAsset && onSelectAsset(s.topAsset.id)}
            className={`text-left p-2.5 rounded-lg border transition ${
              selectedAsset?.area === area
                ? "bg-indigo-50 border-indigo-300"
                : "bg-white border-slate-200 hover:border-indigo-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {area}
              </div>
              <Zap className="h-3 w-3 text-indigo-500" />
            </div>
            <div className="text-[11px] font-bold text-slate-800 mt-1 truncate">
              {s.topAsset?.name || "—"}
            </div>
            <div className="text-[10px] text-rose-700 font-mono mt-0.5">
              Top P(fail): {Math.round(s.maxFailure * 100)}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
