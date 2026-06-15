import React, { useState, useMemo } from "react";
import { Asset } from "../types.ts";
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ArrowUpDown, 
  Search, 
  Wrench, 
  Activity, 
  PackageOpen, 
  DollarSign, 
  Flame, 
  FileSpreadsheet, 
  RefreshCw 
} from "lucide-react";

interface RiskPrioritizationMatrixProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onViewSpares: () => void;
}

export default function RiskPrioritizationMatrix({
  assets,
  selectedAssetId,
  onSelectAsset,
  onViewSpares
}: RiskPrioritizationMatrixProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedRiskTier, setSelectedRiskTier] = useState("All");
  const [sortField, setSortField] = useState<"mpi" | "name" | "delayCost" | "stress">("mpi");
  const [sortAsc, setSortAsc] = useState(false);

  // Extract unique areas for filtering
  const areas = useMemo(() => {
    return ["All", ...Array.from(new Set(assets.map(a => a.area)))];
  }, [assets]);

  // Load spares catalogue to check stock level and lead times for math calculations
  const sparesCatalog = useMemo(() => {
    try {
      const raw = localStorage.getItem("ts_mw_spares_catalog");
      if (raw) return JSON.parse(raw);
    } catch {}
    
    // High fidelity fallbacks matching sparesMaster
    return [
      { id: "sp-001", safetyLevel: 1, leadTimeDays: 30, compatibleAssets: ["bf-04"], currentStock: 0 },
      { id: "sp-002", safetyLevel: 1, leadTimeDays: 45, compatibleAssets: ["cc-02"], currentStock: 1 },
      { id: "sp-003", safetyLevel: 2, leadTimeDays: 60, compatibleAssets: ["hsm-01"], currentStock: 1 },
      { id: "sp-004", safetyLevel: 1, leadTimeDays: 7, compatibleAssets: ["cogc-03"], currentStock: 2 }
    ];
  }, [assets]);

  // Comprehensive mathematical triangulation for ALL assets
  const assetsMpiData = useMemo(() => {
    return assets.map(asset => {
      // 1. Criticality Factor (C) - Range: 2 to 5
      let c_factor = 2;
      if (asset.processCriticality === "Critical") c_factor = 5;
      else if (asset.processCriticality === "High") c_factor = 4;
      else if (asset.processCriticality === "Medium") c_factor = 3;

      // 2. Sensor Stress Level (Failure Probability - P_f) - Range: 0.1 to 1.0 (Mapped from telemetry stress)
      let stress = 35;
      if (asset.telemetry) {
        const tempLimit = asset.telemetry.temperatureLimit || 100;
        const vibLimit = asset.telemetry.vibrationLimit || 5.0;
        const tRatio = asset.telemetry.temperature / tempLimit;
        const vRatio = asset.telemetry.vibration / vibLimit;
        stress = Math.min(100, Math.round(((tRatio + vRatio) / 2) * 100));
      }
      const pf_factor = Number((stress / 100).toFixed(2));

      // 3. Delay Penalty Severity (S_d) - Range: 2 to 10 (Derived from stoppage costs)
      let sd_factor = 2;
      if (asset.delayCostPerHour >= 20000) sd_factor = 10;
      else if (asset.delayCostPerHour >= 15000) sd_factor = 8;
      else if (asset.delayCostPerHour >= 10000) sd_factor = 6;
      else if (asset.delayCostPerHour >= 5000) sd_factor = 4;

      // 4. Spare Availability Scarcity Coefficient (A_s) - Range: 2 to 10
      let stock = 2;
      let leadTimeDays = 7;
      let safetyLevel = 1;
      
      const relatedSpare = sparesCatalog.find((s: any) => s.compatibleAssets.includes(asset.id));
      if (relatedSpare) {
        stock = relatedSpare.currentStock !== undefined ? relatedSpare.currentStock : relatedSpare.safetyLevel;
        leadTimeDays = relatedSpare.leadTimeDays;
        safetyLevel = relatedSpare.safetyLevel;
      } else {
        // Area-based heuristics for uncatalogued spares
        if (asset.area === "Ironmaking") { stock = 1; leadTimeDays = 30; safetyLevel = 1; }
        else if (asset.area === "Steelmaking") { stock = 1; leadTimeDays = 45; safetyLevel = 1; }
        else if (asset.area === "Rolling Mill") { stock = 0; leadTimeDays = 60; safetyLevel = 2; }
        else { stock = 2; leadTimeDays = 7; safetyLevel = 1; }
      }

      let as_factor = 2; // Stock Level is secure
      if (stock === 0) as_factor = 10; // Max lack of spares
      else if (stock < safetyLevel) as_factor = 6; // Minor deficit

      // Section 5.2 Deterministic Multiplicative Formula:
      // Raw MPI = C * P_f * S_d * A_s
      const rawMpi = Number((c_factor * pf_factor * sd_factor * as_factor).toFixed(2));
      // Normalized Score (Raw ÷ 500 * 100 = Raw ÷ 5)
      const mpi = Math.min(100, Math.max(1, Math.round(rawMpi * 0.2)));

      // Risk level mapping
      let riskTier: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (mpi >= 70) riskTier = "CRITICAL";
      else if (mpi >= 48) riskTier = "HIGH";
      else if (mpi >= 25) riskTier = "MEDIUM";

      return {
        asset,
        mpi,
        rawMpi,
        c_factor,
        pf_factor,
        sd_factor,
        as_factor,
        crit: c_factor * 20, // keep for UI compatibility
        stress,
        penalty: sd_factor,
        stock,
        leadTimeDays,
        sparesAvailability: stock === 0 ? 0 : stock < safetyLevel ? 50 : 100,
        riskTier
      };
    });
  }, [assets, sparesCatalog]);

  // Handler for sorting
  const handleSort = (field: "mpi" | "name" | "delayCost" | "stress") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Filter and sort calculated dataset
  const processedData = useMemo(() => {
    const query = searchTerm.toLowerCase();
    
    let result = assetsMpiData.filter(item => {
      const matchesSearch = item.asset.name.toLowerCase().includes(query) || 
                            item.asset.id.toLowerCase().includes(query);
      const matchesArea = selectedArea === "All" || item.asset.area === selectedArea;
      const matchesTier = selectedRiskTier === "All" || item.riskTier === selectedRiskTier;
      
      return matchesSearch && matchesArea && matchesTier;
    });

    result.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === "mpi") {
        valA = a.mpi;
        valB = b.mpi;
      } else if (sortField === "name") {
        valA = a.asset.name;
        valB = b.asset.name;
      } else if (sortField === "delayCost") {
        valA = a.asset.delayCostPerHour;
        valB = b.asset.delayCostPerHour;
      } else if (sortField === "stress") {
        valA = a.stress;
        valB = b.stress;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [assetsMpiData, searchTerm, selectedArea, selectedRiskTier, sortField, sortAsc]);

  // Export dataset to CSV
  const handleExportCSV = () => {
    const headers = "Asset ID,Asset Name,Area,Criticality,Failure Probability (Stress),Delay Cost Per Hr ($),Spares Availability %,Lead Time (Days),Overall MPI Score,Risk Tier\n";
    const rows = assetsMpiData.map(item => 
      `"${item.asset.id}","${item.asset.name}","${item.asset.area}","${item.asset.processCriticality}",${item.stress}%,$${item.asset.delayCostPerHour},${item.sparesAvailability}%,${item.leadTimeDays},${item.mpi},"${item.riskTier}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Tata_Steel_Jamshedpur_Risk_MPI_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadgeStyle = (tier: string) => {
    switch (tier) {
      case "CRITICAL":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "HIGH":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getStatusIcon = (status: Asset["status"]) => {
    switch (status) {
      case "Critical":
        return <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />;
      case "Warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden select-none flex flex-col h-full animate-feed" id="mpi-prioritization-matrix">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-4 pb-4.5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-950/45 border border-rose-800/40 text-rose-400 rounded-lg">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-black text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <span>Section 5.1 & 5.2: Risk-Priority MPI Multi-Factor Triangulation Matrix</span>
              <span className="text-[9px] bg-red-650 text-white font-mono px-1 rounded inline-block animate-pulse">LIVE MONITOR</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1 leading-normal max-w-xl">
              Calculates deterministic maintenance sequence scores. Combines sensor wear indices, safety weights, financial delayed losses, spares stockout ratios, and international supply-line lead times.
            </p>
          </div>
        </div>

        {/* Quick CSV Export button */}
        <button
          onClick={handleExportCSV}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white rounded-lg text-[10px] font-mono font-bold cursor-pointer transition flex items-center gap-1.5"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Export Master CSV ({assets.length} Assets)</span>
        </button>
      </div>

      {/* Explicit Equation & Problem Statement Section 5.2 Header Banner */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 text-slate-300 font-sans leading-relaxed text-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-900 border border-indigo-750 text-indigo-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                Problem Statement Formula (Section 5.2)
              </span>
              <span className="text-slate-400 font-bold text-[10.5px]">DETERMINISTIC MULTI-FACTOR MATHEMATICAL COUPLING</span>
            </div>
            
            <div className="mt-2 text-slate-100 font-mono text-[11px] bg-slate-900/90 border border-slate-800 rounded-lg p-3 inline-block font-extrabold max-w-full overflow-x-auto whitespace-nowrap">
              <span className="text-indigo-400">MPI Score</span> = 
              <span className="text-rose-450"> Criticality (C)</span> × 
              <span className="text-amber-450 font-bold"> Failure Prob (P<sub>f</sub>)</span> × 
              <span className="text-emerald-400"> Delay Severity (S<sub>d</sub>)</span> × 
              <span className="text-blue-400"> Spare Avail (A<sub>s</sub>)</span>
            </div>
            
            <p className="text-[9.5px] text-slate-400 leading-normal max-w-3xl">
              This scoring system calculates the exact risk profile of a failure event. Raw score is the multiplicative product of <span className="font-mono text-indigo-400 font-bold">C × P<sub>f</sub> × S<sub>d</sub> × A<sub>s</sub></span> (Max: 500, Min: 0.8), which is normalized directly to. a <span className="font-mono font-bold text-slate-200">0 - 100% Normalized Index</span> (Product × 0.20).
            </p>
          </div>
          
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 max-w-xs shrink-0 self-stretch flex flex-col justify-center">
            <span className="text-[8.5px] font-mono text-slate-400 uppercase font-bold tracking-wider block border-b border-slate-800 pb-1">Factor Values Mapping Range:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[8px] text-slate-350">
              <div>• <span className="text-rose-400 font-bold">C:</span> 2 (Low) to 5 (Critical)</div>
              <div>• <span className="text-amber-400 font-bold">P<sub>f</sub>:</span> 0.1 to 1.0 (Sensor wear)</div>
              <div>• <span className="text-emerald-400 font-bold">S<sub>d</sub>:</span> 2 to 10 (Loss hourly rate)</div>
              <div>• <span className="text-blue-400 font-bold">A<sub>s</sub>:</span> 2 (Onhand) to 10 (Shortage)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-slate-50 p-3 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search by asset identifier or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Area */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Sector:</span>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-600 font-semibold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500 flex-1"
          >
            {areas.map(area => (
              <option key={area} value={area}>
                {area === "All" ? "All Areas" : area}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Risk level */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Risk:</span>
          <select
            value={selectedRiskTier}
            onChange={(e) => setSelectedRiskTier(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-600 font-semibold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500 flex-1"
          >
            <option value="All">All Risk Tiers</option>
            <option value="CRITICAL">Critical Tier (MPI ≥ 75)</option>
            <option value="HIGH">High Tier (55 ≤ MPI &lt; 75)</option>
            <option value="MEDIUM">Medium Tier (35 ≤ MPI &lt; 55)</option>
            <option value="LOW">Low Tier (MPI &lt; 35)</option>
          </select>
        </div>

        {/* Active Stats Ticker */}
        <div className="text-right font-mono text-[10px] text-slate-500">
          Showing <span className="font-extrabold text-slate-800">{processedData.length}</span> of {assets.length} assets mapped
        </div>
      </div>

      {/* Grid Table Workspace */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[450px]">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead className="bg-slate-100 border-b border-slate-200 font-mono text-[9px] text-slate-500 uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th 
                className="p-3 pl-4 cursor-pointer hover:bg-slate-150 transition"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Steel Asset Identifier</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3">SOP Sector</th>
              <th className="p-3">Safety Criticality</th>
              <th 
                className="p-3 cursor-pointer hover:bg-slate-150 transition text-center"
                onClick={() => handleSort("stress")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Wear Stress (Prob)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th 
                className="p-3 cursor-pointer hover:bg-slate-150 transition text-right"
                onClick={() => handleSort("delayCost")}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Stoppage Loss ($/hr)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3 text-center">Spares / Lead-Time Constraints</th>
              <th 
                className="p-3 text-center cursor-pointer hover:bg-slate-150 transition"
                onClick={() => handleSort("mpi")}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-black text-rose-800">MPI Score</span>
                  <ArrowUpDown className="h-3 w-3 text-rose-800" />
                </div>
              </th>
              <th className="p-3 pr-4 text-right">Integrations Cockpit Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 text-[11px] font-sans">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400 font-mono">
                  No assets parsed matching filter criteria. Check search parameters.
                </td>
              </tr>
            ) : (
              processedData.map(({ asset, mpi, rawMpi, c_factor, pf_factor, sd_factor, as_factor, crit, stress, penalty, stock, leadTimeDays, sparesAvailability, riskTier }) => {
                const isSelected = selectedAssetId === asset.id;
                return (
                  <tr 
                    key={asset.id}
                    className={`transition-colors hover:bg-slate-50/70 border-l-2 ${
                      isSelected ? "bg-indigo-50/25 border-l-blue-600" : "border-l-transparent"
                    }`}
                  >
                    {/* Identifier */}
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(asset.status)}
                        <div>
                          <strong className="text-slate-800 font-extrabold block text-[11.5px] leading-tight">
                            {asset.name}
                          </strong>
                          <span className="text-[9.5px] text-slate-400 font-mono leading-none block mt-0.5">
                            ID: {asset.id} • {asset.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="p-3 font-mono text-[10px] text-slate-500">
                      {asset.area}
                    </td>

                    {/* Criticality */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wide uppercase border inline-block ${
                          asset.processCriticality === "Critical" 
                            ? "bg-rose-50 border-rose-100 text-rose-700 font-extrabold" 
                            : asset.processCriticality === "High"
                            ? "bg-amber-50 border-amber-100 text-amber-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}>
                          {asset.processCriticality}
                        </span>
                        <div className="text-[9px] font-mono text-indigo-650 font-bold">
                          Factor C = <span className="font-extrabold bg-slate-100 px-1 py-0.2 rounded border text-indigo-700">{c_factor}</span>
                        </div>
                      </div>
                    </td>

                    {/* Sensor Wear Pressure */}
                    <td className="p-3 text-center">
                      <div className="max-w-[75px] mx-auto space-y-1">
                        <span className="font-mono font-bold text-slate-700 text-[10px] block">
                          Stress {stress}%
                        </span>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full transition-all duration-300 rounded-full ${
                              stress >= 75 ? "bg-rose-500" : stress >= 50 ? "bg-amber-500" : "bg-emerald-500"
                            }`} 
                            style={{ width: `${stress}%` }}
                          />
                        </div>
                        <div className="text-[9px] font-mono text-amber-750 font-bold leading-none">
                          P<sub>f</sub> = <span className="bg-amber-50 px-0.8 border border-amber-200 rounded">{pf_factor}</span>
                        </div>
                      </div>
                    </td>

                    {/* Financial Loss */}
                    <td className="p-3 text-right">
                      <div className="font-mono font-bold text-slate-800 text-[10.5px]">
                        ${asset.delayCostPerHour.toLocaleString()}/hr
                      </div>
                      <div className="text-[9px] font-mono text-emerald-700 font-bold mt-0.5">
                        S<sub>d</sub> = <span className="bg-emerald-50 px-0.8 border border-emerald-150 rounded">{sd_factor}</span>
                      </div>
                    </td>

                    {/* Spares Outage constraints */}
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center gap-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-tight border font-extrabold ${
                          stock === 0 
                            ? "bg-rose-950/20 text-rose-700 border-rose-250 font-black animate-pulse" 
                            : stock < 2 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {stock} pcs onhand
                        </span>
                        <div className="text-[9px] font-mono text-blue-700 font-bold mt-0.5">
                          A<sub>s</sub> = <span className="bg-blue-50 px-0.8 border border-blue-200 rounded">{as_factor}</span> • LT:{leadTimeDays}d
                        </div>
                      </div>
                    </td>

                    {/* Overall Math MPI */}
                    <td className="p-3 text-center">
                      <div className="inline-flex flex-col items-center justify-center">
                        <span className={`px-2 py-0.5 text-[10px] font-black font-mono rounded border shadow-xs ${getRiskBadgeStyle(riskTier)}`}>
                          MPI: {mpi}%
                        </span>
                        <span className="text-[8px] text-slate-400 block font-mono mt-0.5 leading-none">
                          Product: <b>{rawMpi}</b>
                        </span>
                        <span className="text-[7.5px] bg-slate-900 text-slate-300 font-mono px-1 py-0.2 rounded mt-1 font-bold">
                          C×P<sub>f</sub>×S<sub>d</sub>×A<sub>s</sub>
                        </span>
                      </div>
                    </td>

                    {/* Interactive quick action pipeline */}
                    <td className="p-3 pr-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectAsset(asset.id)}
                          className={`px-2.5 py-1 font-mono text-[9.5px] rounded-md font-extrabold border transition cursor-pointer select-none ${
                            isSelected 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                          }`}
                        >
                          <span className="flex items-center gap-0.5">
                            <Activity className="h-3 w-3" />
                            <span>Diagnose</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={onViewSpares}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono text-[9.5px] rounded-md font-extrabold transition cursor-pointer select-none"
                        >
                          <span className="flex items-center gap-0.5">
                            <PackageOpen className="h-3 w-3" />
                            <span>Sourcing</span>
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Summary footer counts */}
      <div className="bg-slate-900 border-t border-slate-800 p-3.5 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-white font-mono text-[10px]">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Plant Risk Profile Summary:</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Critical: <b>{assetsMpiData.filter(i => i.riskTier === "CRITICAL").length}</b></span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>High: <b>{assetsMpiData.filter(i => i.riskTier === "HIGH").length}</b></span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Medium: <b>{assetsMpiData.filter(i => i.riskTier === "MEDIUM").length}</b></span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Low: <b>{assetsMpiData.filter(i => i.riskTier === "LOW").length}</b></span>
          </span>
        </div>
        <div className="text-slate-400">
          Max Delay Exposure: <strong className="text-rose-400 font-bold">$22,000/hr (Crop Shear / Mill Bearings)</strong>
        </div>
      </div>
    </div>
  );
}
