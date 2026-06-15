import React, { useState, useEffect } from "react";
import { Asset } from "../types.ts";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench, 
  TrendingUp, 
  Coins, 
  Truck, 
  RefreshCw, 
  Building,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Info
} from "lucide-react";
import { ClientStore } from "../utils/dataStore.ts";

interface SpareItem {
  id: string;
  name: string;
  model: string;
  currentStock: number;
  safetyLevel: number;
  leadTimeDays: number;
  unitCostUSD: number;
  compatibleAssets: string[];
  supplierName: string;
}

interface SparesProcurementPanelProps {
  asset?: Asset;
  onStockUpdate?: () => void;
}

export default function SparesProcurementPanel({ asset, onStockUpdate }: SparesProcurementPanelProps) {
  // Client-persistent spares list
  const [spares, setSpares] = useState<SpareItem[]>([
    {
      id: "sp-001",
      name: "BF High-Grade Copper Tuyere Body",
      model: "BF-COP-T4",
      currentStock: 0, // Out of stock to highlight risk!
      safetyLevel: 1,
      leadTimeDays: 30,
      unitCostUSD: 12500,
      compatibleAssets: ["bf-04"],
      supplierName: "SMS Group Germany"
    },
    {
      id: "sp-002",
      name: "Oscillator Spherical Roller Bearing",
      model: "FAG 22352-TB",
      currentStock: 1,
      safetyLevel: 1,
      leadTimeDays: 45,
      unitCostUSD: 8900,
      compatibleAssets: ["cc-02"],
      supplierName: "FAG Bearings (Sweden)"
    },
    {
      id: "sp-003",
      name: "Work Roll Heavy Radial Bearing",
      model: "WRB-SL90",
      currentStock: 1, // Below safety level 2
      safetyLevel: 2,
      leadTimeDays: 60,
      unitCostUSD: 14500,
      compatibleAssets: ["hsm-01"],
      supplierName: "NSK Japan Ltd"
    },
    {
      id: "sp-004",
      name: "Gas Compressor Intake Solenoid Valve",
      model: "SV-COGC",
      currentStock: 2,
      safetyLevel: 1,
      leadTimeDays: 7,
      unitCostUSD: 1800,
      compatibleAssets: ["cogc-03"],
      supplierName: "Rotex Solenoids India"
    }
  ]);

  // Load from local storage if exists
  useEffect(() => {
    const saved = localStorage.getItem("ts_mw_spares_catalog");
    if (saved) {
      try {
        setSpares(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load spares: ", err);
      }
    }
  }, []);

  const saveToLocal = (updatedList: SpareItem[]) => {
    setSpares(updatedList);
    localStorage.setItem("ts_mw_spares_catalog", JSON.stringify(updatedList));
    if (onStockUpdate) onStockUpdate();
  };

  // Selection state for order simulations
  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "risk-rank">("inventory");
  const [selectedSpareId, setSelectedSpareId] = useState<string>("sp-001");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [selectedSupplierRoute, setSelectedSupplierRoute] = useState<"standard" | "regional" | "local_emergency">("standard");
  const [orderLogs, setOrderLogs] = useState<{ id: string; timestamp: string; item: string; qty: number; route: string; estDelivery: string; costINR: number }[]>([]);

  // Simulation parameters for Jamshedpur local logistics
  const supplierRoutes = {
    standard: {
      name: "Global OEM Air-Freight (Baseline)",
      premiumCoeff: 1.0,
      leadTimeReduction: 0 // Base days
    },
    regional: {
      name: "Adityapur Regional Machining Zone",
      premiumCoeff: 1.15, // 15% rush surcharge
      leadTimeReductionMs: 0.70 // 70% time reduction
    },
    local_emergency: {
      name: "Jamshedpur Local Fabrication Hub (24Hr)",
      premiumCoeff: 1.30, // 30% emergency premium
      leadTimeReductionMs: 0.95 // 95% time reduction (24-48 hours)
    }
  };

  const getActiveSpare = () => {
    return spares.find(s => s.id === selectedSpareId) || spares[0];
  };

  const activeSpare = getActiveSpare();

  // Handle Ordering / Procurement Simulation
  const handlePlaceOrder = () => {
    const active = activeSpare;
    if (!active) return;

    // Calculate details
    const routeInfo = supplierRoutes[selectedSupplierRoute];
    const unitPrice = active.unitCostUSD * routeInfo.premiumCoeff;
    const totalCostUSD = unitPrice * orderQuantity;
    const usdToInr = 83.40;
    const totalCostINR = Math.round(totalCostUSD * usdToInr);

    let finalLeadTime = active.leadTimeDays;
    if (selectedSupplierRoute === "regional") {
      finalLeadTime = Math.max(2, Math.round(active.leadTimeDays * 0.30));
    } else if (selectedSupplierRoute === "local_emergency") {
      finalLeadTime = 1; // 24 hours emergency sourcing
    }

    // Deduce simulated arrival timestamp
    const now = new Date();
    const arrivalDate = new Date();
    arrivalDate.setDate(now.getDate() + finalLeadTime);
    const dateString = arrivalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Deduct standard local warehouse capacity and save items
    const updatedList = spares.map(item => {
      if (item.id === active.id) {
        return {
          ...item,
          currentStock: item.currentStock + orderQuantity
        };
      }
      return item;
    });

    saveToLocal(updatedList);

    // Track log actions
    const newLog = {
      id: `so-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: now.toLocaleTimeString(),
      item: active.name,
      qty: orderQuantity,
      route: routeInfo.name,
      estDelivery: `${dateString} (${finalLeadTime} Days)`,
      costINR: totalCostINR
    };

    setOrderLogs([newLog, ...orderLogs]);
  };

  // Compute Lead-Time Outage Risk for judges overview (Section 5.2/5.3 compliance)
  // If stock is 0 and it fails, the theoretical penalty = Lead Time × 24h × Cost/Hour
  const calculateRiskProjections = (item: SpareItem) => {
    const relatedAsset = ClientStore.getAssets().find(a => item.compatibleAssets.includes(a.id));
    if (!relatedAsset) return { hoursText: "N/A", potentialLossUSD: 0, potentialLossINR: 0, criticalRisk: false };

    const delayHours = item.leadTimeDays * 24;
    const potentialLossUSD = delayHours * relatedAsset.delayCostPerHour;
    const usdToInr = 83.40;
    const potentialLossINR = potentialLossUSD * usdToInr;
    
    // Critical risk flags if item stock is below safety Level AND the related asset status is Warning or Critical
    const criticalRisk = item.currentStock < item.safetyLevel && (relatedAsset.status === "Warning" || relatedAsset.status === "Critical");

    return {
      assetId: relatedAsset.id,
      assetName: relatedAsset.name,
      delayCost: relatedAsset.delayCostPerHour,
      hoursText: `${delayHours} Hrs`,
      potentialLossUSD: potentialLossUSD,
      potentialLossINR: potentialLossINR,
      criticalRisk
    };
  };

  const getSourcingRouteLeadTime = (item: SpareItem, route: "standard" | "regional" | "local_emergency") => {
    if (route === "standard") return item.leadTimeDays;
    if (route === "regional") return Math.max(2, Math.round(item.leadTimeDays * 0.30));
    return 1; // local_emergency
  };

  // Dynamic Sourcing Priority Index (SPI) Sourcing Squeeze Ranking
  const getRankedSourcingPriority = () => {
    return spares.map(item => {
      const relatedAsset = ClientStore.getAssets().find(a => item.compatibleAssets.includes(a.id));
      const delayCost = relatedAsset ? relatedAsset.delayCostPerHour : 10000;
      
      // Sourcing Priority Index Formula: (Lead Time in Days) * (Asset stoppages cost / 500) * (Stock multiplier)
      // Multiplier is 5.0 for OUT OF STOCK, 2.5 for DEFICIT, and 0.5 for SECURE
      const stockDeficit = Math.max(0, item.safetyLevel - item.currentStock);
      const stockMultiplier = item.currentStock === 0 ? 5.0 : stockDeficit > 0 ? 2.5 : 0.5;
      
      const priorityScore = Math.round(item.leadTimeDays * (delayCost / 500) * stockMultiplier);
      const riskDetails = calculateRiskProjections(item);

      return {
        ...item,
        priorityScore,
        assetName: relatedAsset ? relatedAsset.name : "Auxiliary Systems",
        assetStatus: relatedAsset ? relatedAsset.status : "Healthy",
        potentialLossINR: riskDetails ? riskDetails.potentialLossINR : 0,
        hoursText: riskDetails ? riskDetails.hoursText : "N/A"
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  };

  const usdToInr = 83.40;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm flex flex-col h-full space-y-5 animate-feed">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
        <div>
          <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Package className="h-4.5 w-4.5 text-indigo-600" />
            <span>Spares Sourcing & Warehouse Optimizer</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">
            Lead-Time Defense Matrices • Adityapur Logistics Integrations • Section 5.2/5.3
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase">
          Closed-Loop Supply
        </div>
      </div>

      {/* Selector Subtabs */}
      <div className="flex border-b border-slate-100 pb-1.5 gap-2 flex-shrink-0">
        <button
          onClick={() => setActiveSubTab("inventory")}
          type="button"
          className={`flex-1 py-1.5 px-2.5 rounded-md text-[10.5px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
            activeSubTab === "inventory"
              ? "bg-slate-100 text-slate-800 border-slate-350"
              : "bg-white border-transparent text-slate-500 hover:text-slate-705 hover:bg-slate-50"
          }`}
        >
          <Building className="h-3.5 w-3.5 text-slate-550" />
          <span>Sourcing Inventory</span>
        </button>

        <button
          onClick={() => setActiveSubTab("risk-rank")}
          type="button"
          className={`flex-1 py-1.5 px-2.5 rounded-md text-[10.5px] font-mono font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
            activeSubTab === "risk-rank"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-white border-transparent text-slate-500 hover:text-rose-700 hover:bg-rose-50/20"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
          <span>Lead-Time Risk Ranking</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 text-xs pr-1">
        
        {activeSubTab === "inventory" ? (
          <>
            {/* Dynamic Critical Spares Catalogue Table */}
            <div className="space-y-2 font-sans">
              <h4 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wider">
                Critical Warehouse Inventory & Stock Levels
              </h4>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50/50">
                <div className="grid grid-cols-12 gap-1 bg-slate-200/65 px-3 py-2 font-mono text-[9px] text-slate-500 font-bold uppercase">
                  <span className="col-span-5">Critical Component</span>
                  <span className="col-span-3 text-center">Stock / safety</span>
                  <span className="col-span-2 text-center">Lead Time</span>
                  <span className="col-span-2 text-right">Cost (Unit)</span>
                </div>

                <div className="divide-y divide-slate-150 bg-white">
                  {spares.map((item) => {
                    const hasAlert = item.currentStock < item.safetyLevel;
                    
                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-1 px-3 py-2.5 items-center hover:bg-slate-50 transition">
                        {/* Component Info */}
                        <div className="col-span-5 space-y-0.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <span>{item.name}</span>
                            {hasAlert && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            )}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-400">
                            {item.model} • Compatibility: {item.compatibleAssets.join(", ").toUpperCase()}
                          </div>
                        </div>

                        {/* Stock level indicators */}
                        <div className="col-span-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold border ${
                            item.currentStock === 0 
                              ? "bg-rose-50 border-rose-200 text-rose-700" 
                              : item.currentStock < item.safetyLevel 
                                ? "bg-amber-50 border-amber-200 text-amber-700" 
                                : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            {item.currentStock} / {item.safetyLevel}
                          </span>
                        </div>

                        {/* Supplier Baseline Lead Time */}
                        <div className="col-span-2 text-center text-slate-600 font-mono font-medium">
                          {item.leadTimeDays} days
                        </div>

                        {/* Unit Cost */}
                        <div className="col-span-2 text-right font-mono font-extrabold text-slate-800">
                          ${item.unitCostUSD.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Closed-Loop Interactive Procurement Simulator */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4.5 w-4.5 text-indigo-600" />
                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-705">
                    Dynamic Supply Sourcing Router
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Simulate fast regional sourcing to mitigate multi-day shutdown cycles
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1: Selection info */}
                <div className="space-y-3 font-sans">
                  
                  {/* Part selector */}
                  <div className="space-y-1">
                    <label className="block text-[9.5px] font-bold text-slate-500 font-mono uppercase">
                      Select Target Component:
                    </label>
                    <select
                      value={selectedSpareId}
                      onChange={(e) => setSelectedSpareId(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      {spares.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.model})</option>
                      ))}
                    </select>
                  </div>

                  {/* Route selections */}
                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-bold text-slate-500 font-mono uppercase">
                      Select Logistics Dispatch Route:
                    </label>
                    <div className="space-y-1">
                      {Object.entries(supplierRoutes).map(([key, route]) => {
                        const days = getSourcingRouteLeadTime(activeSpare, key as any);
                        const surcharge = Math.round((route.premiumCoeff - 1.0) * 100);
                        
                        return (
                          <label 
                            key={key} 
                            className={`flex items-center justify-between p-2 rounded-lg border-2 hover:bg-slate-100/60 transition cursor-pointer select-none ${
                              selectedSupplierRoute === key 
                                ? "bg-indigo-50/50 border-indigo-500 text-indigo-900 font-bold" 
                                : "bg-white border-slate-200 text-slate-600"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <input
                                type="radio"
                                name="route-option"
                                checked={selectedSupplierRoute === key}
                                onChange={() => setSelectedSupplierRoute(key as any)}
                                className="accent-indigo-600 mr-1"
                              />
                              <div className="space-y-0.5">
                                <p className="text-[11px] leading-snug">{route.name}</p>
                                <p className="text-[9px] text-slate-400 font-mono">
                                  {surcharge > 0 ? `+${surcharge}% Surcharge` : "Standard pricing OEM"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 font-mono text-[10.5px]">
                              <strong>{days} {days === 1 ? 'Day' : 'Days'}</strong>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 2: Checkout calculation summary */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">
                      Sourcing Surcharge & Budget Quote
                    </span>

                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-slate-600">
                        <span>Baseline unit:</span>
                        <span className="font-mono text-slate-800">${activeSpare.unitCostUSD.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Logistics route:</span>
                        <span className="font-mono text-slate-800">
                          {selectedSupplierRoute === "standard" ? "Standard (1.0x)" : selectedSupplierRoute === "regional" ? "Regional (1.15x)" : "Emergency (1.30x)"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 border-t border-slate-150 pt-1.5">
                        <span>Unit price:</span>
                        <span className="font-mono text-slate-800">
                          ${Math.round(activeSpare.unitCostUSD * supplierRoutes[selectedSupplierRoute].premiumCoeff).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-slate-250 pt-1.5 text-indigo-700">
                        <span>Procurement Total:</span>
                        <span className="font-mono text-indigo-700 font-bold">
                          ₹{Math.round(activeSpare.unitCostUSD * supplierRoutes[selectedSupplierRoute].premiumCoeff * usdToInr).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-2 border border-amber-200/60 rounded-lg text-[10px] text-amber-800 flex items-start gap-1.5">
                      <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600 animate-pulse" />
                      <span>
                        <b>Mitigation Impact:</b> Shipping via {supplierRoutes[selectedSupplierRoute].name} shortens outage windows from <b>{activeSpare.leadTimeDays * 24} hours</b> down to <b>{getSourcingRouteLeadTime(activeSpare, selectedSupplierRoute) * 24} hours</b>.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-confirm-secure-purchase"
                    onClick={handlePlaceOrder}
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-mono font-bold py-2 px-3 text-[10.5px] rounded-lg shadow-sm transition hover:cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Dispatch Procurement Order</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Warehouse Receipt logs */}
            {orderLogs.length > 0 && (
              <div className="space-y-2 animate-feed pb-2">
                <h4 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wider">
                  Warehouse Purchase & Sourced Invoices Trail
                </h4>
                
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-0.5 font-sans divide-y divide-slate-150">
                  {orderLogs.map((log) => (
                    <div key={log.id} className="pt-2 text-[10.5px] text-slate-600 flex justify-between items-center bg-indigo-50/10 p-2 rounded-lg border border-indigo-50">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">
                          Ordered {log.qty}x {log.item}
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono">
                          Route: {log.route} • Est. Arrival: {log.estDelivery}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-indigo-700">₹{log.costINR.toLocaleString()}</span>
                        <span className="block text-[8px] text-emerald-600 font-bold font-mono">ORDER RECONCILED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Risk Prioritizations Under Lead-Time Constraints */
          <div className="space-y-5 text-xs animate-feed">
            {/* Mathematical explanation block */}
            <div className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-4 text-rose-900 space-y-1.5 shadow-2xs font-sans">
              <span className="text-[9px] font-mono uppercase bg-rose-105 text-rose-850 px-2.5 py-0.5 rounded font-extrabold tracking-wider">
                Sourcing Priority Index (SPI) Squeeze Math
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                The <b>Sourcing Squeeze Ranker</b> prioritizes warehouse spare acquisitions by evaluating combined operational delay risks. It computes an active <b>SPI Score</b> combining machine cost per hour, supplier distance (days), and current catalog deficit levels:
              </p>
              <div className="bg-white/80 text-center font-mono py-1.5 rounded text-[10.5px] border border-rose-100 font-bold text-slate-700 italic">
                SPI Score = Lead Time (Days) &times; [Downtime Cost / 500] &times; Stock Deficit Multiplier
              </div>
            </div>

            {/* Rank List */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wider">
                Lead-Time Sourcing Criticality Rank (Ordered by Squeeze Risk)
              </h4>

              <div className="space-y-3 font-sans">
                {getRankedSourcingPriority().map((item, index) => {
                  const remainsDeficit = item.currentStock < item.safetyLevel;
                  const isCrit = remainsDeficit && (item.assetStatus === "Warning" || item.assetStatus === "Critical");
                  const rankTextColor = index === 0 ? "text-rose-700 bg-rose-100" : index === 1 ? "text-amber-700 bg-amber-100" : "text-slate-700 bg-slate-100";
                  
                  return (
                    <div key={item.id} className={`p-4 rounded-xl border relative flex flex-col md:flex-row justify-between gap-4 transition shadow-2xs ${
                      isCrit 
                        ? "bg-gradient-to-br from-rose-50/30 to-white border-rose-300" 
                        : remainsDeficit 
                          ? "bg-gradient-to-br from-amber-50/30 to-white border-amber-300" 
                          : "bg-slate-50/30 border-slate-200 hover:bg-slate-50/60"
                    }`}>
                      {/* Floating Rank indicators */}
                      <div className="absolute top-3.5 right-4 flex items-center gap-2 font-mono text-[9px] uppercase font-bold">
                        <span className={`px-2 py-0.5 rounded-full font-black ${rankTextColor}`}>
                          RANK #{index + 1}
                        </span>
                        <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          SPI Score: {item.priorityScore}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-800 text-xs font-sans font-bold leading-tight">{item.name}</strong>
                          <span className="text-[9.5px] text-slate-400 font-mono">({item.model})</span>
                        </div>
                        
                        <p className="text-[10.5px] text-slate-500 font-sans leading-normal">
                          <b>Logistical Squeeze Details:</b> Orders take <span className="font-bold font-mono text-slate-700">{item.leadTimeDays} days</span> to reach Jamshedpur from OEM international distribution hubs. Fits <b>{item.assetName}</b> (Operational delay penalty: <span className="text-indigo-800 font-bold font-mono">${item.delayCost?.toLocaleString()}/Hr</span>). Safety stock deficit multiplier is scaled at <span className="font-bold text-slate-700 font-mono">{item.currentStock === 0 ? "5.0x (Out of Stock)" : remainsDeficit ? "2.5x (Deficit)" : "0.5x (Secure)"}</span>.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-slate-500">
                          <div>Stock / safety: <strong className={item.currentStock === 0 ? "text-rose-600 font-bold" : "text-slate-750 font-bold"}>{item.currentStock} / {item.safetyLevel}</strong></div>
                          <div>Deficit: <strong className="text-slate-755 font-bold">{Math.max(0, item.safetyLevel - item.currentStock)} units</strong></div>
                          <div>Status: <span className={`font-bold uppercase ${item.currentStock === 0 ? "text-rose-650" : remainsDeficit ? "text-amber-600" : "text-emerald-600"}`}>{item.currentStock === 0 ? "OUT OF STOCK" : remainsDeficit ? "DEFICIT" : "SECURE"}</span></div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-end md:shrink-0 md:border-l md:border-slate-150 md:pl-4 self-stretch justify-center">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">Projected Outage Lost</span>
                        <strong className="text-slate-850 text-xs font-mono font-bold block">₹{(item.potentialLossINR / 10000000).toFixed(2)} Crore</strong>
                        <span className="text-[9px] text-slate-400 font-mono">(USD ${(item.potentialLossUSD / 1000).toFixed(0)}k)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Liabilities Overview (Section 5.3) */}
            <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 text-white space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase text-rose-455 tracking-wider font-extrabold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-450 animate-bounce" />
                  <span>Lead-Time Outage Financial Penalties (Section 5.3)</span>
                </span>
                <div className="bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-mono text-[9px] text-rose-300">
                  Unmitigated Deficit Risk
                </div>
              </div>

              <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                If a machinery block fails while warehouse stock is 0, the steel production line suffers an unmitigated stoppage during the entire vendor lead time. Below is the unmitigated financial liabilities layout:
              </p>

              <div className="space-y-2.5">
                {spares.map((item) => {
                  const r = calculateRiskProjections(item);
                  
                  return (
                    <div key={item.id} className={`p-2.5 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                      r.criticalRisk 
                        ? "bg-rose-950/40 border-rose-500/30 text-rose-100" 
                        : "bg-slate-950/60 border-slate-850 text-slate-300"
                    }`}>
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="text-white text-xs">{item.name}</span>
                          {r.criticalRisk && (
                            <span className="text-[8.5px] bg-rose-500 text-white font-extrabold px-1.5 py-0.25 rounded uppercase font-mono animate-pulse">
                              Critical Sourcing Deficit
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] font-mono text-slate-400">
                          outage window: {r.hoursText} ({item.leadTimeDays} days) • Line Delay penalty: ${r.delayCost?.toLocaleString()}/Hr
                        </div>
                      </div>
                      
                      <div className="text-right sm:shrink-0">
                        <div className={`font-mono font-black text-xs ${r.criticalRisk ? "text-rose-405" : "text-slate-200"}`}>
                          ₹{(r.potentialLossINR / 10000000).toFixed(2)} Crore
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono">
                          (USD ${Math.round(r.potentialLossUSD / 1000).toLocaleString()}k)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
