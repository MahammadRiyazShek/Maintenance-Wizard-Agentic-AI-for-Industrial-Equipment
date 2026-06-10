import React from "react";
import { Asset } from "../types.ts";
import { 
  ArrowRight, 
  GitCommit, 
  Settings, 
  AlertOctagon, 
  Flame, 
  Boxes, 
  TrendingUp, 
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  XOctagon
} from "lucide-react";

interface PlantFlowVisualizerProps {
  assets: Asset[];
}

export default function PlantFlowVisualizer({ assets }: PlantFlowVisualizerProps) {
  // Mapping of plant stages to our asset IDs
  // cokeoven -> utilities (cogc-03)
  // blastfurnace -> ironmaking (bf-04)
  // caster -> steelmaking (cc-02)
  // rollingmill -> rolling (hsm-01)
  
  const getAssetByArea = (area: "Ironmaking" | "Steelmaking" | "Rolling Mill" | "Utilities") => {
    return assets.find(a => a.area === area);
  };

  const utIndex = getAssetByArea("Utilities");
  const bfIndex = getAssetByArea("Ironmaking");
  const ccIndex = getAssetByArea("Steelmaking");
  const hsmIndex = getAssetByArea("Rolling Mill");

  // Calculate total downtime cost cascade if any component fails
  const getCascadingRisk = () => {
    let activeLoss = 0;
    let criticalNodes = 0;
    let warningNodes = 0;

    assets.forEach(a => {
      if (a.status === "Critical") {
        activeLoss += a.delayCostPerHour;
        criticalNodes += 1;
      } else if (a.status === "Warning") {
        activeLoss += a.delayCostPerHour * 0.3; // Estimated warning partial loss
        warningNodes += 1;
      }
    });

    return { activeLoss, criticalNodes, warningNodes };
  };

  const { activeLoss, criticalNodes, warningNodes } = getCascadingRisk();

  const getStatusColor = (status?: "Healthy" | "Warning" | "Critical") => {
    switch (status) {
      case "Critical":
        return "border-rose-500 bg-rose-50 text-rose-700 ring-rose-500/20";
      case "Warning":
        return "border-amber-500 bg-amber-50 text-amber-700 ring-amber-500/20";
      default:
        return "border-emerald-500 bg-emerald-50 text-emerald-700 ring-emerald-500/10";
    }
  };

  const getFlowStatusLine = () => {
    if (criticalNodes > 0) return "bg-rose-500";
    if (warningNodes > 0) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-sans font-bold text-xs text-slate-700 uppercase tracking-wider">
              Plant Bottleneck & Delay Cascade
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Live Interdependence Modeling • Tata Steel Integrated Operations
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Estimated Loss Cascade</span>
          <span className={`text-xs font-mono font-bold ${activeLoss > 0 ? "text-rose-600 font-extrabold animate-pulse" : "text-emerald-600"}`}>
            ${activeLoss.toLocaleString()}/Hr
          </span>
        </div>
      </div>

      {/* Graphical Flowchain */}
      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative items-center">
          
          {/* Stage 1: Coke Oven / Utilities */}
          <div className={`p-3 rounded-lg border text-center transition-all relative ${getStatusColor(utIndex?.status)} shadow-xs`}>
            <div className="absolute top-1.5 right-1.5 font-mono text-[8px] text-slate-400">01</div>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 block">Coke Ovens</span>
            <span className="text-xs font-extrabold block font-sans truncate">{utIndex?.name.split(" ")[0]} COGC</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono">
              <span className={`h-1.5 w-1.5 rounded-full ${utIndex?.status === "Critical" ? "bg-rose-500 animate-ping" : utIndex?.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              <span>{utIndex?.status || "Healthy"}</span>
            </div>
          </div>

          {/* Connect 1 */}
          <div className="hidden md:flex items-center justify-center text-slate-300">
            <ArrowRight className={`h-5 w-5 ${utIndex?.status === "Critical" ? "text-rose-400 animate-pulse" : "text-slate-300"}`} />
          </div>

          {/* Stage 2: Blast Furnace */}
          <div className={`p-3 rounded-lg border text-center transition-all relative ${getStatusColor(bfIndex?.status)} shadow-xs`}>
            <div className="absolute top-1.5 right-1.5 font-mono text-[8px] text-slate-400">02</div>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 block font-sans">Ironmaking</span>
            <span className="text-xs font-extrabold block font-sans truncate">Blast Furnace #4</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono">
              <span className={`h-1.5 w-1.5 rounded-full ${bfIndex?.status === "Critical" ? "bg-rose-500 animate-ping" : bfIndex?.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              <span>{bfIndex?.status || "Healthy"}</span>
            </div>
          </div>

          {/* Connect 2 */}
          <div className="hidden md:flex items-center justify-center text-slate-300">
            <ArrowRight className={`h-5 w-5 ${bfIndex?.status === "Critical" ? "text-rose-400 animate-pulse" : "text-slate-300"}`} />
          </div>

          {/* Stage 3: Casting */}
          <div className={`p-3 rounded-lg border text-center transition-all relative ${getStatusColor(ccIndex?.status)} shadow-xs`}>
            <div className="absolute top-1.5 right-1.5 font-mono text-[8px] text-slate-400">03</div>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 block font-sans">Steelmaking</span>
            <span className="text-xs font-extrabold block font-sans truncate">Continuous Caster</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono">
              <span className={`h-1.5 w-1.5 rounded-full ${ccIndex?.status === "Critical" ? "bg-rose-500 animate-ping" : ccIndex?.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              <span>{ccIndex?.status || "Healthy"}</span>
            </div>
          </div>

          {/* Connect 3 */}
          <div className="hidden md:flex items-center justify-center text-slate-300">
            <ArrowRight className={`h-5 w-5 ${ccIndex?.status === "Critical" ? "text-rose-400 animate-pulse" : "text-slate-300"}`} />
          </div>

          {/* Stage 4: Hot Rolling */}
          <div className={`p-3 rounded-lg border text-center transition-all relative ${getStatusColor(hsmIndex?.status)} shadow-xs`}>
            <div className="absolute top-1.5 right-1.5 font-mono text-[8px] text-slate-400">04</div>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 block font-sans">Rolling Mills</span>
            <span className="text-xs font-extrabold block font-sans truncate">Hot Strip Mill #1</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-mono">
              <span className={`h-1.5 w-1.5 rounded-full ${hsmIndex?.status === "Critical" ? "bg-rose-500 animate-ping" : hsmIndex?.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
              <span>{hsmIndex?.status || "Healthy"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottleneck evaluation narrative */}
      <div className="text-xs leading-normal text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans space-y-1">
        <strong className="text-[10px] text-slate-400 font-mono block uppercase">Cascading Bottleneck Assessment:</strong>
        {criticalNodes > 0 ? (
          <p className="text-rose-700 flex items-start gap-1">
            <AlertOctagon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-500" />
            <span>
              <b>CRITICAL SHUTDOWN RISK:</b> High process delays detected at {criticalNodes === 1 ? "an active" : `${criticalNodes} active`} plant block. Upstream starvation will impact final slab delivery in downstream Rolling Mills stands within hours if unresolved. Focus emergency crew resources instantly.
            </span>
          </p>
        ) : warningNodes > 0 ? (
          <p className="text-amber-700 flex items-start gap-1">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
            <span>
              <b>PROCESS RISK WARNING:</b> Mild throughput restrictions in process cooling or mechanics. Delay impacts are buffered momentarily; however, long-standing wear threatens continuous flow operations.
            </span>
          </p>
        ) : (
          <p className="text-emerald-700 flex items-start gap-1">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
            <span>
              <b>NOMINAL INTEGRATION:</b> Integrated operations running smoothly. Upstream blast furnace gas yield aligns perfectly with casting heats.
            </span>
          </p>
        )}
      </div>

    </div>
  );
}
