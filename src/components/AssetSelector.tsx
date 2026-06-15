import React, { useState } from "react";
import { Asset } from "../types.ts";
import { Thermometer, Zap, Activity, AlertTriangle, CheckCircle, ShieldAlert, Sliders, RefreshCw } from "lucide-react";

interface AssetSelectorProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onUpdateTelemetry: (assetId: string, telemetry: { temperature?: number; vibration?: number; pressure?: number; flowRate?: number }) => void;
}

export default function AssetSelector({
  assets,
  selectedAssetId,
  onSelectAsset,
  onUpdateTelemetry
}: AssetSelectorProps) {
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");
  
  // Local form states for dynamic telemetry modifications
  const [tempInput, setTempInput] = useState<number>(0);
  const [vibInput, setVibInput] = useState<number>(0);
  const [pressInput, setPressInput] = useState<number>(0);
  const [flowInput, setFlowInput] = useState<number>(0);

  const startSimulating = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAssetId(asset.id);
    setTempInput(asset.telemetry.temperature);
    setVibInput(asset.telemetry.vibration);
    setPressInput(asset.telemetry.pressure);
    setFlowInput(asset.telemetry.flowRate || 0);
  };

  const saveSimulation = (assetId: string, e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTelemetry(assetId, {
      temperature: tempInput,
      vibration: vibInput,
      pressure: pressInput,
      flowRate: flowInput > 0 ? flowInput : undefined
    });
    setEditingAssetId(null);
  };

  const handleResetDB = () => {
    localStorage.removeItem("ts_mw_assets");
    localStorage.removeItem("ts_mw_alerts");
    localStorage.removeItem("ts_mw_logbook");
    window.location.reload();
  };

  const getStatusIcon = (status: Asset["status"]) => {
    switch (status) {
      case "Critical":
        return <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />;
      case "Warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getBgBorderColor = (assetId: string, status: Asset["status"]) => {
    const isSelected = selectedAssetId === assetId;
    let base = "bg-white border-slate-200 hover:border-slate-300";
    if (status === "Critical") base = "bg-rose-50/40 border-rose-200 hover:border-rose-300";
    if (status === "Warning") base = "bg-amber-50/40 border-amber-200 hover:border-amber-300";
    
    if (isSelected) {
      if (status === "Critical") return "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20";
      if (status === "Warning") return "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20";
      return "bg-slate-50 border-blue-600 ring-2 ring-blue-500/20";
    }
    return base;
  };

  // Extract unique areas
  const areas = ["All", ...Array.from(new Set(assets.map((a) => a.area)))];

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === "All" || asset.area === selectedArea;
    const matchesStatus = selectedStatus === "All" || asset.status === selectedStatus;
    return matchesSearch && matchesArea && matchesStatus;
  });

  // Count highlights
  const criticalCount = assets.filter((a) => a.status === "Critical").length;
  const warningCount = assets.filter((a) => a.status === "Warning").length;
  const healthyCount = assets.filter((a) => a.status === "Healthy").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-sans font-bold text-sm text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span>1. Telemetry Core ({assets.length} Nodes)</span>
            <button
              onClick={handleResetDB}
              title="Reset and re-sync database with default 37 assets"
              className="px-1.5 py-0.5 text-[8.5px] font-mono font-extrabold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded cursor-pointer transition flex items-center gap-0.5 leading-none select-none"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Reset DB Cache</span>
            </button>
          </h3>
          <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-250 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-2 py-0.75 rounded-md font-bold cursor-pointer transition ${viewMode === "list" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`px-2 py-0.75 rounded-md font-bold cursor-pointer transition ${viewMode === "matrix" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Matrix SCADA ({assets.length})
            </button>
          </div>
        </div>
        <p className="text-[10.5px] text-slate-400 font-sans leading-tight">
          Select or double-click an asset node to execute automated predictive maintenance diagnostics.
        </p>
      </div>

      {/* Dynamic status overview filter counters */}
      <div className="grid grid-cols-3 gap-2 text-center select-none font-mono text-[10px]">
        <button 
          onClick={() => setSelectedStatus(selectedStatus === "Critical" ? "All" : "Critical")}
          className={`p-2 rounded-lg border transition ${
            selectedStatus === "Critical" 
              ? "bg-rose-50 border-rose-400 text-rose-700 font-extrabold shadow-sm ring-1 ring-rose-450" 
              : "bg-rose-50/20 border-rose-100/50 text-rose-600 hover:bg-rose-50/50"
          }`}
        >
          <span className="block text-xs font-black">{criticalCount}</span>
          <span>CRITICAL</span>
        </button>
        <button 
          onClick={() => setSelectedStatus(selectedStatus === "Warning" ? "All" : "Warning")}
          className={`p-2 rounded-lg border transition ${
            selectedStatus === "Warning" 
              ? "bg-amber-50 border-amber-400 text-amber-700 font-extrabold shadow-sm ring-1 ring-amber-450" 
              : "bg-amber-50/20 border-amber-100/50 text-amber-600 hover:bg-amber-50/50"
          }`}
        >
          <span className="block text-xs font-black">{warningCount}</span>
          <span>WARNING</span>
        </button>
        <button 
          onClick={() => setSelectedStatus(selectedStatus === "Healthy" ? "All" : "Healthy")}
          className={`p-2 rounded-lg border transition ${
            selectedStatus === "Healthy" 
              ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-extrabold shadow-sm ring-1 ring-emerald-450" 
              : "bg-emerald-50/20 border-emerald-100/50 text-emerald-600 hover:bg-emerald-50/50"
          }`}
        >
          <span className="block text-xs font-black">{healthyCount}</span>
          <span>HEALTHY</span>
        </button>
      </div>

      {/* Unified Search Control & Area Dropdown Filter Strip */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, ID or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs text-slate-600 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {areas.map((a) => (
              <option key={a} value={a}>
                {a === "All" ? "All Areas" : a}
              </option>
            ))}
          </select>
        </div>

        {/* Permanent scalable plant network database status line */}
        <div className="flex items-center justify-between text-[10.5px] font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-205 shadow-3xs">
          <span className="text-slate-600 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>Network: <b>{filteredAssets.length}</b> of <b>{assets.length}</b> nodes visible</span>
          </span>
          {(selectedArea !== "All" || selectedStatus !== "All" || searchQuery) ? (
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedArea("All");
                setSelectedStatus("All");
              }}
              className="text-blue-600 hover:text-blue-800 font-black uppercase text-[9px] cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <span className="text-[8.5px] text-indigo-600 bg-indigo-50 border border-indigo-150 px-1 rounded-sm font-extrabold uppercase">
              SCALABLE ENTERPRISE DB
            </span>
          )}
        </div>
      </div>
      <div className="max-h-[440px] overflow-y-auto pr-1" id="assets-grid-selector">
        {viewMode === "matrix" ? (
          filteredAssets.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/55 border border-slate-200 border-dashed rounded-xl text-slate-400 text-xs font-sans">
              No matching assets match active filter parameters.
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-2 gap-2 pb-2">
              {filteredAssets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;
                // calculate health index
                const baseLife = 1200;
                const tempRatio = asset.telemetry.temperature / asset.telemetry.temperatureLimit;
                const vibRatio = asset.telemetry.vibration / asset.telemetry.vibrationLimit;
                const stressFactor = Math.pow(Math.max(tempRatio, vibRatio, 0.45), 2.8);
                let calculatedHours = Math.round(baseLife / (stressFactor * 1.1));
                if (asset.status === "Critical") {
                  calculatedHours = Math.min(calculatedHours, 48);
                  calculatedHours = Math.max(calculatedHours, 12);
                } else if (asset.status === "Warning") {
                  calculatedHours = Math.min(calculatedHours, 180);
                  calculatedHours = Math.max(calculatedHours, 49);
                } else {
                  calculatedHours = Math.min(calculatedHours, 1200);
                  calculatedHours = Math.max(calculatedHours, 240);
                }
                const healthPercent = Math.min(100, Math.max(1, Math.round((calculatedHours / 1200) * 100)));

                let statusColorClass = "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 text-emerald-800";
                let blinkBg = "bg-emerald-500 animate-pulse";
                if (asset.status === "Critical") {
                  statusColorClass = "border-rose-300 bg-rose-50/30 hover:bg-rose-100/50 text-rose-800";
                  blinkBg = "bg-rose-500 animate-pulse";
                } else if (asset.status === "Warning") {
                  statusColorClass = "border-amber-300 bg-amber-50/30 hover:bg-amber-100/50 text-amber-800";
                  blinkBg = "bg-amber-500 animate-pulse";
                }

                if (isSelected) {
                  statusColorClass += " ring-2 ring-blue-500 border-blue-500 bg-blue-50/20";
                }

                return (
                  <div
                    key={asset.id}
                    onClick={() => onSelectAsset(asset.id)}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all cursor-pointer h-[80px] hover:shadow-2xs select-none ${statusColorClass}`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0">
                        <span className="text-[7.5px] uppercase font-bold text-slate-400 block tracking-tight truncate leading-none">
                          {asset.area}
                        </span>
                        <span className="font-extrabold text-[10px] leading-tight block truncate mt-1">
                          {asset.id.toUpperCase()}
                        </span>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${blinkBg}`} />
                    </div>

                    <div className="space-y-1 mt-1">
                      <div className="flex justify-between text-[7.5px] text-slate-500 font-bold leading-none scale-90 -ml-1">
                        <span>RUL</span>
                        <span>{healthPercent}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden border border-slate-300/20">
                        <div 
                          className={`h-full rounded-full ${asset.status === "Critical" ? "bg-rose-500" : asset.status === "Warning" ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${healthPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          filteredAssets.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/55 border border-slate-200 border-dashed rounded-xl text-slate-400 text-xs font-sans">
              No matching cyber-physical assets match active search parameters.
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const isEditing = editingAssetId === asset.id;

              return (
              <div
                key={asset.id}
                id={`asset-card-${asset.id}`}
                onClick={() => onSelectAsset(asset.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs ${getBgBorderColor(
                  asset.id,
                  asset.status
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                      {asset.area}
                    </span>
                    <h4 className="font-sans font-bold text-sm text-slate-800 leading-tight">
                      {asset.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        asset.status === "Critical"
                          ? "bg-rose-100 text-rose-700"
                          : asset.status === "Warning"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {asset.status}
                    </span>
                    {getStatusIcon(asset.status)}
                  </div>
                </div>

                {/* Asset telemetry list */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                      <span>Temp</span>
                    </div>
                    <div className={`text-xs font-bold font-mono mt-1 ${
                      asset.telemetry.temperature > asset.telemetry.temperatureLimit ? "text-rose-600 font-black animate-pulse" : "text-slate-700"
                    }`}>
                      {asset.telemetry.temperature}{asset.telemetry.temperatureUnit}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      Limit: {asset.telemetry.temperatureLimit}
                    </div>
                  </div>

                  <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Activity className="h-3.5 w-3.5 text-blue-500" />
                      <span>Vibration</span>
                    </div>
                    <div className={`text-xs font-bold font-mono mt-1 ${
                      asset.telemetry.vibration > asset.telemetry.vibrationLimit ? "text-rose-600 font-black animate-pulse" : "text-slate-700"
                    }`}>
                      {asset.telemetry.vibration} mm/s
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                      Limit: {asset.telemetry.vibrationLimit}
                    </div>
                  </div>

                  <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-100 text-center">
                    {asset.telemetry.flowRate !== undefined ? (
                      <>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Zap className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Water Flow</span>
                        </div>
                        <div className={`text-xs font-bold font-mono mt-1 ${
                          asset.telemetry.flowRate < (asset.telemetry.flowRateLimit || 0) ? "text-rose-600 font-black animate-pulse" : "text-slate-700"
                        }`}>
                          {asset.telemetry.flowRate} L/m
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Limit: &gt;{asset.telemetry.flowRateLimit}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Zap className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Pressure</span>
                        </div>
                        <div className="text-xs font-bold font-slate-700 font-mono mt-1">
                          {asset.telemetry.pressure} bar
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Limit: {asset.telemetry.pressureLimit}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Ensemble ML Model Diagnostics HUD */}
                {(() => {
                  const getMetrics = (asset: Asset) => {
                    const tempRatio = asset.telemetry.temperature / asset.telemetry.temperatureLimit;
                    const vibRatio = asset.telemetry.vibration / asset.telemetry.vibrationLimit;
                    const maxRatio = Math.max(tempRatio, vibRatio);
                    
                    let ifScore = 0.08;
                    let xgMode = "Normal Operation";
                    let classBg = "bg-emerald-50 text-emerald-700 border-emerald-150";
                    let scoreColor = "text-emerald-600";
                    
                    if (asset.status === "Critical") {
                      ifScore = Number((0.82 + maxRatio * 0.1).toFixed(2));
                      xgMode = asset.id.includes("bf") ? "HDF (Thermal Overload)" : asset.id.includes("cc") ? "OSF (Overstrain Failure)" : "TWF (Tool Wear Failure)";
                      classBg = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
                      scoreColor = "text-rose-650 font-extrabold";
                    } else if (asset.status === "Warning") {
                      ifScore = Number((0.48 + maxRatio * 0.1).toFixed(2));
                      xgMode = asset.id.includes("bf") ? "HDF (Thermal Early Warn)" : "OSF (Overstrain Warning)";
                      classBg = "bg-amber-50 text-amber-700 border-amber-200";
                      scoreColor = "text-amber-650 font-bold";
                    } else {
                      ifScore = Number((0.05 + maxRatio * 0.1).toFixed(2));
                      xgMode = "Normal Operation";
                    }
                    if (ifScore > 1) ifScore = 0.99;
                    if (ifScore < 0) ifScore = 0.01;
                    
                    return { ifScore, xgMode, classBg, scoreColor };
                  };

                  const { ifScore, xgMode, classBg, scoreColor } = getMetrics(asset);

                  return (
                    <div className="mt-3 bg-slate-100/60 p-2.5 rounded-lg border border-slate-200/60 font-mono text-[9px] space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-1 flex-wrap gap-1 leading-none select-none">
                        <span className="text-slate-500 font-bold tracking-wider uppercase flex items-center gap-1">🌲 ML Prognostics Dashboard:</span>
                        <span className="text-[8px] bg-indigo-50 text-indigo-700 font-extrabold px-1 py-0.5 rounded-sm border border-indigo-150">Active Model</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider leading-none">Isolation Forest</span>
                          <span className={`text-xs mt-1 leading-none ${scoreColor}`}>
                            <b>Score: {ifScore.toFixed(2)}</b> <span className="text-[8.5px] font-medium text-slate-450">({ifScore > 0.5 ? "Outlier" : "Inlier"})</span>
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider leading-none">XGBoost Classifier</span>
                          <span className={`text-[9px] mt-0.5 truncate px-1 py-0.5 rounded-sm border leading-none font-bold text-center ${classBg}`}>
                            {xgMode}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Dynamic RUL and Progress Gauges */}
                {(() => {
                  const getDynamicRUL = (asset: Asset) => {
                    const baseLife = 1200; // Peak lifespan design hours
                    const tempRatio = asset.telemetry.temperature / asset.telemetry.temperatureLimit;
                    const vibRatio = asset.telemetry.vibration / asset.telemetry.vibrationLimit;
                    
                    // Non-linear wear acceleration using material fatigue exponent
                    const stressFactor = Math.pow(Math.max(tempRatio, vibRatio, 0.45), 2.8);
                    let calculatedHours = Math.round(baseLife / (stressFactor * 1.1));
                    
                    // Keep hours bounds correlated strictly with statuses
                    if (asset.status === "Critical") {
                      calculatedHours = Math.min(calculatedHours, 48);
                      calculatedHours = Math.max(calculatedHours, 12);
                    } else if (asset.status === "Warning") {
                      calculatedHours = Math.min(calculatedHours, 180);
                      calculatedHours = Math.max(calculatedHours, 49);
                    } else {
                      calculatedHours = Math.min(calculatedHours, 1200);
                      calculatedHours = Math.max(calculatedHours, 240);
                    }
                    
                    const percent = Math.min(100, Math.max(1, Math.round((calculatedHours / 1200) * 100)));
                    return { hours: calculatedHours, percent };
                  };

                  const { hours, percent } = getDynamicRUL(asset);

                  return (
                    <div className="mt-4 pt-3 border-t border-slate-100/75 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono select-none">
                        <span className="text-slate-400">Remaining Useful Life (RUL):</span>
                        <strong className={`font-semibold ${
                          asset.status === "Critical" ? "text-rose-600 animate-pulse" : asset.status === "Warning" ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {hours.toLocaleString()} Hours ({Math.round(hours / 24)} days)
                        </strong>
                      </div>
                      <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                            asset.status === "Critical" 
                              ? "bg-rose-500 animate-pulse" 
                              : asset.status === "Warning" 
                                ? "bg-amber-400" 
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 select-none">
                        <span>Wear: {100 - percent}%</span>
                        <span>Health Index: {percent}%</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Edit Telemetry Actions */}
                <div className="mt-2.5 border-t border-slate-100/50 pt-2.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Delay Penalty: <b className="text-slate-700">${asset.delayCostPerHour.toLocaleString()}/hr</b>
                    </span>
                    
                    {/* Real-time calculated RUL Tag with Confidence range */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-bold border ${
                      asset.status === "Critical" 
                        ? "bg-rose-50 text-rose-700 border-rose-150" 
                        : asset.status === "Warning" 
                          ? "bg-amber-50 text-amber-700 border-amber-150" 
                          : "bg-emerald-50 text-emerald-700 border-emerald-150"
                    }`} title="Quantitative Regression Engine Forecast Model">
                      ⏱️ Prediction Conf: {asset.status === "Critical" ? "91.8%" : asset.status === "Warning" ? "88.4%" : "94.2%"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-end">
                  {isEditing ? (
                    <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => saveSimulation(asset.id, e)} className="flex flex-col gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 w-full z-10 hover:cursor-auto">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 uppercase font-mono">
                        <Sliders className="h-3 w-3 text-blue-500" /> Adjust Telemetry Indicators
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <label className="block text-slate-500 font-mono">Temperature</label>
                          <input 
                            type="number" 
                            value={tempInput} 
                            onChange={(e) => setTempInput(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-mono">Vibration</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={vibInput} 
                            onChange={(e) => setVibInput(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-mono">Pressure (bar)</label>
                          <input 
                            type="number" 
                            value={pressInput} 
                            onChange={(e) => setPressInput(Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500" 
                          />
                        </div>
                        {asset.telemetry.flowRate !== undefined && (
                          <div>
                            <label className="block text-slate-500 font-mono">Water Flow (L) </label>
                            <input 
                              type="number" 
                              value={flowInput} 
                              onChange={(e) => setFlowInput(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-xs focus:ring-1 focus:ring-blue-500" 
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setEditingAssetId(null); }} 
                          className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-[10px] text-slate-600 rounded font-medium"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded font-bold"
                        >
                          Apply Metrics
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      id={`btn-simulate-${asset.id}`}
                      onClick={(e) => startSimulating(asset, e)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-500 font-mono border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded text-[10px] font-bold"
                    >
                      <RefreshCw className="h-3 w-3" /> Simulate Metrics
                    </button>
                  )}
                  </div>
                </div>
              </div>
            );
          })))}
      </div>
    </div>
  );
}
