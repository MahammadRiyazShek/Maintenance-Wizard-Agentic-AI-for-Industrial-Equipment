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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-bold text-sm text-slate-700 tracking-wider uppercase">
          1. Plant Assets Telemetry Core
        </h3>
        <p className="text-[11px] text-slate-400 font-mono">
          Interactive Nodes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4" id="assets-grid-selector">
        {assets.map((asset) => {
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

              {/* Edit Telemetry Actions */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  Delay Penalty: <b className="text-slate-700">${asset.delayCostPerHour.toLocaleString()}/hr</b>
                </span>
                
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
                            className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 font-slate text-xs focus:ring-1 focus:ring-blue-500" 
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
          );
        })}
      </div>
    </div>
  );
}
