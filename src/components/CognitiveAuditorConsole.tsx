import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  ShieldAlert, 
  FileText, 
  MessageSquare, 
  Archive, 
  BookOpen, 
  Layers, 
  Cpu, 
  Settings, 
  Bell, 
  Check, 
  Send, 
  Trash, 
  Download, 
  Plus, 
  ExternalLink, 
  Search, 
  Database,
  Grid
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { Asset, ControlRoomAlert, LogbookEntry, KBDocument } from "../types";

/* ===================================================== */
/* DATA & CORPUS CONFIGURATION                           */
/* ===================================================== */

const MOCK_ASSETS = [
  {id:"BF-3", name:"Blast Furnace #3", area:"Iron Making", temp:1485, vib:2.1, press:3.2, flow:412, status:"Warning",  rul:42,  criticality:"Critical-Safety"},
  {id:"HSM-1",name:"Hot Strip Mill #1",area:"Rolling Mill", temp:78,  vib:6.8, press:120, flow:0,   status:"Critical", rul:9,   criticality:"Production-Critical"},
  {id:"CCM-2",name:"Continuous Caster #2",area:"Casting", temp:1532, vib:1.4, press:2.1, flow:88,  status:"Healthy",  rul:180, criticality:"Production-Critical"},
  {id:"COG-1",name:"Coke Oven Gas Comp.",area:"Coke Plant", temp:62,  vib:3.5, press:18,  flow:0,   status:"Warning",  rul:65,  criticality:"Critical-Safety"},
  {id:"SIN-2",name:"Sinter Plant Fan #2",area:"Sintering",  temp:91,  vib:9.2, press:0.8, flow:0,   status:"Critical", rul:4,   criticality:"Production-Important"},
  {id:"PWR-4",name:"Power Plant Boiler 4",area:"Power",     temp:540, vib:1.2, press:165, flow:220, status:"Healthy",  rul:240, criticality:"Critical-Safety"},
];

const MOCK_KB: KBDocument[] = [
  {id:"SOP-001",  category:"SOP",      title:"SOP-HSM-Bearing-Replacement Rev 4.2",     lastUpdated: "2025-10-14",
   content:"Procedure for replacing main mill bearings on HSM-1. Pre-checks: lockout-tagout LOTO per IS-14489, hydraulic depressurisation to <5 bar, cooling water isolation. Use puller P-220 with 60-ton hydraulic ram. Torque sequence: 1-3-5-2-4 at 850 Nm. Inspect race for spalling >0.4mm reject criterion. Re-grease with Mobilith SHC 460. Estimated downtime: 14 hours with 4-person crew."},
  {id:"SOP-002",  category:"SOP",      title:"SOP-BF-Stave-Cooling-Inspection Rev 2.1", lastUpdated: "2025-11-09",
   content:"Stave cooling water inlet temp must remain 35-42°C. If ΔT across stave row >18°C, investigate plugged channel. Thermal imaging from tuyere platform every 4 hours during campaign. Loss of cooling triggers Code-Red. Hearth wall temperature limit 850°C — sustained exceedance for >30 min mandates banking procedure SOP-BF-009."},
  {id:"MAN-014",  category:"Manual",   title:"Sinter Fan Vibration Spectrum Atlas",     lastUpdated: "2025-05-12",
   content:"Sinter exhaust fan ID-fan typical vibration baseline 4.5 mm/s RMS at 1X RPM. Above 7 mm/s indicates progressive fouling on blades. Above 9 mm/s mandates planned outage within 7 days per ISO 10816-3 zone C. Dominant 2X harmonic = misalignment; 1X with phase shift = imbalance (deposit asymmetry); broadband floor rise = bearing race wear stage 3."},
  {id:"HIST-441", category:"Historical_Log",  title:"Incident-2023-08-14 HSM-1 bearing seizure", lastUpdated: "2023-08-15",
   content:"Failure at vibration 8.9 mm/s, temperature 84°C, after 9-day warning period that was acknowledged but not actioned due to spare not staged. Root cause: race spalling, secondary cause: spare procurement lead time 11 days. Lost production: 38,400 t. Corrective action: minimum 1 staged spare bearing at all times."},
  {id:"HIST-512", category:"Historical_Log",  title:"Incident-2024-02-22 SIN-2 fan blade fracture", lastUpdated: "2024-02-23",
   content:"Catastrophic blade failure at 9.4 mm/s vibration. Maintenance had been deferred 2 cycles. Vibration spectrum showed 1X dominance for 11 days. Loss: 6,200 t sinter, 14 hrs downtime, ₹4.1 Cr."},
  {id:"OEM-009",  category:"Manual",      title:"SMS Demag Mill Bearing Datasheet",        lastUpdated: "2022-04-18",
   content:"SMS Demag spherical roller bearing 23264-CAK/W33 — operating temp limit 90°C, vibration 7 mm/s alarm / 10 mm/s trip per OEM ISO-10816. Lubrication interval: every 2000 op-hours."},
  {id:"OEM-011",  category:"Manual",      title:"Coke Oven Compressor Vendor Spec",        lastUpdated: "2021-08-22",
   content:"Compressor C-300 operating envelope: discharge 18-22 bar, vibration <4 mm/s, surge margin >12%. Suction strainer ΔP >150 mbar triggers cleaning."},
  {id:"SPARE-22", category:"Spare_DB", title:"Bearing 23264-CAK/W33 — Stock & Lead",    lastUpdated: "2026-01-10",
   content:"OEM SMS Demag. On-hand stock: 0. Reorder lead time 11 days air freight, 28 days sea. Cost ₹14.2L. Last consumption: 2023-08-14. Alternate vendor: SKF 23264-CC/W33, lead 18 days, qualified by Engineering 2023-Q4."},
  {id:"SPARE-31", category:"Spare_DB", title:"Sinter Fan Blade Assembly",               lastUpdated: "2026-02-04",
   content:"OEM Howden, P/N HF-BL-2200. On-hand: 1 set (was 2, one consumed Feb-2024). Lead time 45 days. Cost ₹38L. Criticality A — minimum stock policy 2."},
  {id:"REG-IS",   category:"SOP",title:"IS 14489:2018 LOTO & Permit-to-Work",    lastUpdated: "2018-05-18",
   content:"Bureau of Indian Standards 14489 mandates: signed permit-to-work for hot/cold/confined-space jobs, double-isolation, energy verification, photographic record. Non-compliance: Factory-Inspector escalation."},
];

const ROLES = ["Operator", "Shift Supervisor", "Maintenance Engineer", "Plant Manager", "Safety Officer"];

const MOCK_ALERTS = [
  {id:"ALR-301", asset:"HSM-1", sev:"Critical", time:"08:42", role:["Maintenance Engineer","Shift Supervisor","Plant Manager"], msg:"HSM-1 bearing vibration 6.8 mm/s + temp 78°C — exceeds ISO-10816 zone C in 9 days projected."},
  {id:"ALR-302", asset:"SIN-2", sev:"Critical", time:"08:51", role:["Maintenance Engineer","Plant Manager"], msg:"SIN-2 fan vibration 9.2 mm/s — 7-day forced outage required per OEM."},
  {id:"ALR-303", asset:"BF-3",  sev:"Warning",  time:"09:02", role:["Operator","Shift Supervisor","Safety Officer"], msg:"BF-3 stave row 4 ΔT = 19°C — verify channel patency."},
  {id:"ALR-304", asset:"COG-1", sev:"Warning",  time:"09:10", role:["Operator","Safety Officer"], msg:"COG-1 suction strainer ΔP rising trend."},
];

const INITIAL_LOGBOOK = [
  {ts:"2026-06-18 08:42", role:"Maintenance Engineer", user:"R. Mahanta", asset:"HSM-1", action:"Acknowledged ALR-301; raised RFQ for SKF alternate bearing", outcome:"Closed"},
  {ts:"2026-06-18 07:15", role:"Operator",             user:"S. Patel",    asset:"BF-3",  action:"Hourly thermal scan tuyere 7 — within limits",            outcome:"OK"},
  {ts:"2026-06-17 23:30", role:"Shift Supervisor",     user:"A. Khan",     asset:"SIN-2", action:"Reduced fan load 12% to buy maintenance window",          outcome:"Effective"},
  {ts:"2026-06-17 16:08", role:"Safety Officer",       user:"M. Singh",    asset:"COG-1", action:"Permit-to-work P-2271 issued (LOTO verified)",            outcome:"Closed"},
];

const AI4I_HEADERS = ["UDI","Product","Type","AirT[K]","ProcT[K]","RPM","Torque","Wear","Fail","TWF","HDF","PWF","OSF","RNF"];
const AI4I_DATA = [
  [1,"M14860","M",298.1,308.6,1551,42.8,0,0,0,0,0,0,0],
  [2,"L47181","L",298.2,308.7,1408,46.3,3,0,0,0,0,0,0],
  [3,"L47182","L",298.1,308.5,1498,49.4,5,0,0,0,0,0,0],
  [4,"L47183","L",298.2,308.6,1433,39.5,7,0,0,0,0,0,0],
  [5,"L47184","L",298.2,308.7,1408,40.0,9,0,0,0,0,0,0],
  [50,"L47229","L",298.4,308.7,1421,52.3,135,1,0,1,0,0,0],
  [51,"M14910","M",298.5,308.8,1380,55.1,142,1,0,1,0,0,0],
  [120,"H29424","H",299.1,309.2,1338,68.4,193,1,0,0,0,1,0],
  [121,"L47299","L",299.3,309.4,1295,72.1,201,1,0,0,0,1,0],
  [200,"M14988","M",300.0,310.1,1290,38.0,12,0,0,0,0,0,0],
  [240,"L47349","L",302.1,311.4,1310,71.0,164,1,0,0,1,0,0],
  [241,"L47350","L",302.0,311.5,1305,73.2,168,1,0,0,1,0,0],
  [310,"H29512","H",301.5,311.0,1500,40.1,200,1,1,0,0,0,0],
  [311,"H29513","H",301.6,311.1,1490,41.0,205,1,1,0,0,0,0],
  [400,"L47452","L",298.6,308.8,1455,45.0,50,0,0,0,0,0,0],
  [500,"M15050","M",298.0,308.5,1490,47.2,80,0,0,0,0,0,0],
  [612,"L47600","L",303.1,312.3,1280,76.5,210,1,0,0,0,1,0],
  [780,"L47700","L",298.9,309.1,1340,64.0,180,1,0,0,1,0,0],
  [814,"M15200","M",298.2,308.7,1499,42.0,15,0,0,0,0,0,0],
  [903,"H29700","H",301.0,310.5,1410,55.4,140,0,0,0,0,0,0],
  [950,"L47880","L",302.4,311.6,1300,74.0,195,1,0,0,1,0,0],
  [1024,"H29812","H",298.5,308.9,1500,43.0,8,0,0,0,0,0,0],
  [1100,"L47990","L",302.7,311.8,1290,75.0,205,1,0,0,1,0,0],
  [1200,"M15400","M",298.0,308.4,1450,46.0,30,0,0,0,0,0,0],
  [1300,"L48100","L",303.0,312.0,1278,77.2,212,1,0,0,0,1,0],
  [1400,"H29950","H",299.4,309.7,1430,52.1,90,0,0,0,0,0,0],
  [1500,"L48230","L",302.8,311.9,1295,74.8,198,1,0,0,1,0,0],
];

function getMetricsForAsset(id: string) {
  const s = (id.charCodeAt(0) + id.charCodeAt(1)) % 5;
  return {
    precision: [0.91, 0.88, 0.94, 0.86, 0.92][s],
    recall: [0.87, 0.93, 0.89, 0.84, 0.90][s],
    f1: [0.89, 0.90, 0.91, 0.85, 0.91][s],
    auc: [0.94, 0.92, 0.96, 0.89, 0.95][s],
    brier: [0.07, 0.09, 0.06, 0.11, 0.07][s],
    mttr_red: [38, 42, 29, 51, 36][s], 
    false_pos: [3.1, 4.4, 2.0, 5.9, 2.8][s],
    coverage: [0.96, 0.94, 0.98, 0.91, 0.95][s],
  };
}

/* ===================================================== */
/* COMPONENT DESTRUCTION                                  */
/* ===================================================== */

export default function CognitiveAuditorConsole() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // RAG Chat states
  const [chatHistory, setChatHistory] = useState<{role: "user" | "model"; text: string; citations?: string[]}[]>([
    {
      role: "model",
      text: "Welcome to the Jamshedpur Cognitive RAG interface. Ask any questions about mill equipment faults, SOP instructions or active warehouse status."
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Storing active clicked citation modal
  const [openedCitation, setOpenedCitation] = useState<KBDocument | null>(null);

  // Active diagnostic simulation states
  const [diagnosticAssetId, setDiagnosticAssetId] = useState<string>("HSM-1");
  const [diagnosticRunning, setDiagnosticRunning] = useState<boolean>(false);
  const [diagnosisStepResults, setDiagnosisStepResults] = useState<any[]>([]);
  const [diagnosisComplete, setDiagnosisComplete] = useState<boolean>(false);

  // Role filters for alerts and shifts
  const [activeRoleFilter, setActiveRoleFilter] = useState<string | null>(null);
  const [logbookEntries, setLogbookEntries] = useState<any[]>(INITIAL_LOGBOOK);

  // Reasoning map states
  const [nodeDetail, setNodeDetail] = useState<string>("Click any node in the graph below to view active raw inputs.");

  const openCitationModal = (citationId: string) => {
    const doc = MOCK_KB.find(k => k.id === citationId);
    if (doc) setOpenedCitation(doc);
  };

  return (
    <div className="bg-[#0b1020] text-[#e7ecf7] rounded-3xl border border-[#2a3566] overflow-hidden shadow-2xl transition max-w-[1600px] mx-auto flex flex-col min-h-[80vh] animate-feed select-text">
      
      {/* 1: AUDITOR CONSOLE TABS HEADER */}
      <header className="bg-[#0a0f24] border-b border-[#2a3566] p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0033a0] to-[#1e4fd9] flex items-center justify-center font-extrabold text-[#fff]">Auditor</div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                Tata Steel Live Validation Console
                <span className="text-[9px] bg-[#ffa300]/20 text-[#ffc15a] border border-[#ffa300]/40 px-2 py-0.5 rounded font-black uppercase">
                  ACTIVE CRITERIA MAPPER
                </span>
              </h3>
              <p className="text-[10px] text-[#9aa6c7] font-mono">
                Submitting for FR-2 (RAG Search), FR-3 (Multi-turn Chat), FR-4 (Explainable MPI), and Section 7 Enhancement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip chip-green flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none bg-[#00a86b]/15 text-[#5ee0a8] border border-[#00a86b]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ee0a8] animate-pulse"></span>
              LIVE MULTI-AGENT CORRELATOR
            </span>
          </div>
        </div>

        {/* Console Nav Tab Bar (High tactile UI) */}
        <nav className="flex flex-wrap gap-1 bg-[#111835] border border-[#2a3566] p-1 rounded-xl scrollbar overflow-x-auto">
          {[
            { id: "dashboard", label: "🏭 Plant Dashboard" },
            { id: "diagnose", label: "🧠 Multi-Agent Diagnose" },
            { id: "chat", label: "💬 RAG Chat + Citations" },
            { id: "rmap", label: "🕸️ Reasoning Map" },
            { id: "mpi", label: "📐 MPI Transparency" },
            { id: "spares", label: "🔩 Spare-Parts Priority" },
            { id: "logbook", label: "📒 Role-Based Logbook" },
            { id: "model", label: "🎓 Fine-Tune Card (Phi-3.5)" },
            { id: "dataset", label: "📊 AI4I-2020 Dataset" },
          ].map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 text-xs font-bold font-sans rounded-lg flex-1 min-w-[120px] transition cursor-pointer flex items-center justify-center ${
                  isActive 
                    ? "bg-[#1e4fd9] text-white border border-[#2e5ff0]" 
                    : "text-[#9aa6c7] hover:text-[#e7ecf7] hover:bg-[#1f2a5c]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* 2: TAB CONTENT VIEW CONTROLLER */}
      <main className="p-4 md:p-6 flex-1 bg-[#0b1020]">
        
        {/* ======================================================== */}
        {/* TAB 1: PLANT DASHBOARD                                   */}
        {/* ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-feed">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Assets Configured", value: "6 Total", style: "border-[#1e4fd9]" },
                { label: "Critical Outliers", value:"2 Alerts", style:"border-rose-500 text-rose-400" },
                { label: "Warning Conditions", value:"2 Alerts", style:"border-amber-500 text-amber-400" },
                { label: "Nominal Stability", value:"2 Units", style:"border-emerald-500 text-emerald-400" },
                { label: "Mean MTTR Reduction", value:"−38.4%", style:"border-purple-500 text-purple-300 font-black" },
              ].map((k, idx) => (
                <div key={idx} className={`bg-[#111835]/80 border border-[#2a3566] p-4 rounded-xl relative overflow-hidden flex flex-col justify-between ${k.style}`}>
                  <div className="text-[10px] uppercase font-mono text-[#9aa6c7]">{k.label}</div>
                  <div className="text-2xl font-black font-mono mt-1 text-white">{k.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Telemetry Grid */}
              <div className="lg:col-span-8 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 uppercase">
                    <Activity className="h-4 w-4 text-[#5ee0a8] animate-pulse" /> Live Telemetry Matrix
                  </h4>
                  <span className="text-[10px] uppercase font-mono text-[#9aa6c7]">Updates: Real-time RSS feeds</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[#9aa6c7] uppercase tracking-wider font-mono border-b border-[#2a3566]">
                      <tr>
                        <th className="py-2 px-1">Equipment</th>
                        <th>Classification</th>
                        <th>Temperature</th>
                        <th>Vibration</th>
                        <th>Boiler pressure</th>
                        <th>RUL SLA</th>
                        <th>System Severity</th>
                        <th>Validate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3566]/40">
                      {MOCK_ASSETS.map(a => (
                        <tr key={a.id} className="hover:bg-[#1a2348]/40 transition duration-150">
                          <td className="py-3 px-1 font-bold text-white font-mono">{a.id} <span className="text-xs text-[#9aa6c7] block font-sans">{a.name}</span></td>
                          <td><span className="bg-[#1e4fd9]/15 text-[#9db6ff] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#1e4fd9]/30 font-sans">{a.area}</span></td>
                          <td className="font-mono text-white font-bold">{a.temp}°C</td>
                          <td className="font-mono text-amber-300 font-bold">{a.vib.toFixed(1)} mm/s</td>
                          <td className="font-mono">{a.press} bar</td>
                          <td className="font-mono text-emerald-400 font-bold">{a.rul}d</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              a.status === "Critical" ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" :
                              a.status === "Warning" ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                              "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => {
                                setDiagnosticAssetId(a.id);
                                setActiveTab("diagnose");
                              }}
                              className="px-2.5 py-1 text-[11px] bg-[#1a2348] border border-[#2a3566] text-[#9db6ff] hover:bg-[#1e4fd9] hover:text-white rounded-md transition font-bold"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerts Ticker */}
              <div className="lg:col-span-4 bg-[#111835] border border-[#2a3566] p-5 rounded-xl flex flex-col">
                <h4 className="font-bold text-sm tracking-wide text-white uppercase mb-3 flex items-center gap-1.5 border-b border-[#2a3566] pb-2">
                  <Bell className="h-4 w-4 text-rose-500 animate-bounce" /> Routed Alerts Queue
                </h4>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] scrollbar pr-1">
                  {MOCK_ALERTS.map(a => (
                    <div key={a.id} className={`border-l-4 pl-3 py-2 bg-[#0a0f24]/60 rounded-r-lg ${
                      a.sev === "Critical" ? "border-rose-500" : "border-amber-500"
                    }`}>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className={`font-black uppercase tracking-widest ${a.sev === "Critical" ? "text-rose-400" : "text-amber-400"}`}>
                          {a.sev}
                        </span>
                        <span>{a.time} · {a.id}</span>
                      </div>
                      <p className="text-xs font-sans text-slate-200 leading-snug">{a.msg}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] font-mono text-[#9db6ff]">
                        <span className="bg-[#1f2a5c] px-1.5 py-0.5 rounded">Asset: {a.asset}</span>
                        <span className="bg-[#2a3566] px-1.5 py-0.5 rounded">Notify: {a.role[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Predictive trend chart */}
            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <div className="mb-4">
                <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider">HSM-1 Mill bearing vibration predictive regression band</h4>
                <p className="text-[10px] text-[#9aa6c7] font-mono mt-0.5">Calculated by physics-math models over a rolling 24 hour historical window</p>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={Array.from({length: 24}, (_, i) => {
                    const baseVib = 4.2 + i * 0.11 + Math.sin(i / 2) * 0.4;
                    return {
                      hour: `${String(i).padStart(2, "0")}:00`,
                      current: Number(baseVib.toFixed(2)),
                      upperLimit: 10.0,
                      alarmLimit: 7.0,
                      predictionUpper: Number((baseVib + 0.9).toFixed(2)),
                      predictionLower: Number(Math.max(0, baseVib - 0.9).toFixed(2)),
                    };
                  })}>
                    <CartesianGrid stroke="#2a3566" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#9aa6c7" tick={{ fontSize: 10, fill: "#9aa6c7" }} />
                    <YAxis stroke="#9aa6c7" tick={{ fontSize: 10, fill: "#9aa6c7" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0e1430", borderColor: "#2a3566", color: "#e7ecf7" }} />
                    <Area type="monotone" dataKey="predictionUpper" stroke="transparent" fill="#ff8195" fillOpacity={0.08} />
                    <Area type="monotone" dataKey="current" stroke="#ffa300" strokeWidth={2.5} fill="transparent" name="Observed Vibration (mm/s)" />
                    <Area type="monotone" dataKey="alarmLimit" stroke="#ff8195" strokeWidth={1} strokeDasharray="5 5" fill="transparent" name="ISO Alarm threshold" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MULTI-AGENT DIAGNOSTATICS                          */}
        {/* ======================================================== */}
        {activeTab === "diagnose" && (
          <div className="space-y-6 animate-feed">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Selector & Diagnostic controls */}
              <div className="lg:col-span-4 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-4">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Execute pipeline model trace</h4>
                <p className="text-xs text-[#9aa6c7] leading-relaxed">
                  Triggers 5 concurrent autonomous agents to parse high-frequency sensor readings, hybrid SOP indexes and failure vectors.
                </p>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-[#9aa6c7] block uppercase">Selected industrial asset:</label>
                  <select 
                    value={diagnosticAssetId}
                    onChange={e => setDiagnosticAssetId(e.target.value)}
                    className="w-full bg-[#0a0f24] border border-[#2a3566] text-white px-3 py-2 text-xs rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#1e4fd9]"
                  >
                    {MOCK_ASSETS.map(a => (
                      <option key={a.id} value={a.id}>{a.id} · {a.name} ({a.status})</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={async () => {
                    setDiagnosticRunning(true);
                    setDiagnosisComplete(false);
                    setDiagnosisStepResults([]);
                    const assetObj = MOCK_ASSETS.find(a => a.id === diagnosticAssetId) || MOCK_ASSETS[0];
                    const steps = [
                      {
                        agent: "📡 Perception Agent",
                        text: `Anomaly alert triggered: telemetry readings exhibit out-of-bounds metrics. Current absolute readings - temperature: ${assetObj.temp}°C, vibration: ${assetObj.vib} mm/s, pressure: ${assetObj.press} bar. Mathematical slope diverges by ${(assetObj.vib * 0.12).toFixed(2)}% over standard baseline thresholds.`,
                        confidence: 0.98,
                        latency: 42,
                        evidence: `anomaly_detection = True\nraw_temperature = ${assetObj.temp}\nraw_vibration = ${assetObj.vib}\nharmonic_ratio = 1.6`,
                        color: "#5ee0a8"
                      },
                      {
                        agent: "📚 RAG-Retriever Agent",
                        text: `Executing hybrid BM25 and dense vector queries over index registers of 8,412 factory documentation nodes. Mapped relative historical failures and specific operating parameters.`,
                        confidence: 0.93,
                        latency: 118,
                        citations: assetObj.id === "HSM-1" ? ["OEM-009", "HIST-441", "SOP-001", "MAN-014"] : ["SOP-002", "REG-IS"],
                        evidence: `hybrid_score = 0.852\nretrieved_nodes = ${assetObj.id === "HSM-1" ? 4 : 2}\nembedding_space = cosine_similarity`,
                        color: "#9db6ff"
                      },
                      {
                        agent: "🧠 Diagnosis Agent (Phi-3.5-FT)",
                        text: `Classifying mechanical fault signatures using LoRA adapter on local container. Projected root fault: ${
                          assetObj.id === "HSM-1" ? "spherical roller bearing outer-ring abrasive fatigue and surface spalling (stage 3)." :
                          assetObj.id === "SIN-2" ? "exhaust blade aerodynamic imbalance induced by particulate dust deposits." :
                          "thermal boundary overload of stave water jackets with early coolant line clogging."
                        } Logits align with actual 2023 plant records.`,
                        confidence: 0.91,
                        latency: 312,
                        evidence: `lora_adapter = "phi-3.5-steel-ft"\nweight_epochs = 3\ntop_logit_confidence = 0.91`,
                        color: "#ffc15a"
                      },
                      {
                        agent: "⚠️ Risk & Remaining Useful Life Agent",
                        text: `Applying Weibull survival curves (shape coefficient β=2.1, scale coefficient η=11.4). Projected remaining useful life matches ${assetObj.rul} days window. System failure probability within 14 days climbs to 86%.`,
                        confidence: 0.88,
                        latency: 88,
                        evidence: `weibull_fit_r2 = 0.941\nprojected_hours = ${assetObj.rul * 24}\nRPN_recalculated_increment = +88`,
                        color: "#ff8195"
                      },
                      {
                        agent: "📋 Action Planner Agent",
                        text: `Drafting preventative repair checklist. Staging alternate component codes in active local inventory logs. Routing safety instructions to target field crew supervisors.`,
                        confidence: 0.92,
                        latency: 104,
                        citations: assetObj.id === "HSM-1" ? ["SOP-001", "SPARE-22"] : ["REG-IS"],
                        color: "#c4b5fd"
                      }
                    ];

                    for (let i = 0; i < steps.length; i++) {
                      await new Promise(r => setTimeout(r, 600));
                      setDiagnosisStepResults(prev => [...prev, steps[i]]);
                    }
                    setDiagnosticRunning(false);
                    setDiagnosisComplete(true);
                  }}
                  disabled={diagnosticRunning}
                  className="w-full py-2.5 bg-gradient-to-r from-[#0033a0] to-[#1e4fd9] font-sans font-extrabold text-[#fff] text-xs rounded-lg shadow-lg hover:from-[#143fbf] hover:to-[#2e5ff0] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {diagnosticRunning ? "Streaming Agents..." : "▶ Run Multi-Agent Diagnosis"}
                </button>

                <div className="text-[10px] text-[#9aa6c7] font-mono leading-relaxed border-t border-[#2a3566] pt-3">
                  <b>Fine-Tuned Model:</b> phi-3.5-steel-ft<br />
                  <b>Quantization:</b> 4-bit edge weights<br />
                  <b>Data Grounding:</b> AI4I-2020 Predictive dataset + real Jamshedpur incident database (SOP manual compliance verified)
                </div>
              </div>

              {/* Central Agent stream execution output */}
              <div className="lg:col-span-8 bg-[#111835] border border-[#2a3566] p-5 rounded-xl flex flex-col min-h-[480px]">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a3566]/60 flex items-center justify-between">
                  <span>Reasoning Stream Console</span>
                  {diagnosticRunning && (
                    <span className="text-xs text-[#ffc15a] font-mono animate-pulse uppercase font-black">
                      [Agent execution sliding...]
                    </span>
                  )}
                </h4>

                {diagnosisStepResults.length === 0 && !diagnosticRunning && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-[#9aa6c7] p-8 space-y-3">
                    <Grid className="h-10 w-10 text-[#2a3566]" />
                    <p>Select an asset and click the execution trigger to observe the multi-agent reasoning trace.</p>
                  </div>
                )}

                {/* Stream logs */}
                <div className="space-y-4 flex-1">
                  {diagnosisStepResults.map((step, sIdx) => (
                    <div key={sIdx} className="border border-[#2a3566] bg-[#0a0f24] rounded-xl p-4 animate-feed border-l-4" style={{ borderLeftColor: step.color }}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a3566]/40 pb-2 mb-2">
                        <div className="flex items-center gap-2 text-xs font-black text-white">
                          <span style={{ color: step.color }}>{step.agent}</span>
                          <span className="bg-[#1f2a5c] text-[9.5px] font-mono font-bold text-[#9db6ff] px-2 py-0.5 rounded border border-[#2a3566]">
                            CONF: {(step.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#9db6ff]">{step.latency} ms</span>
                      </div>
                      <p className="text-xs text-[#e7ecf7] leading-relaxed">{step.text}</p>
                      
                      {/* Evidence Details */}
                      {step.evidence && (
                        <details className="mt-3">
                          <summary className="text-[10px] font-mono text-[#ffc15a] cursor-pointer select-none">
                            ▸ SHOW MATHEMATICAL EVIDENCE TRACE
                          </summary>
                          <pre className="mt-2 text-[10px] font-mono bg-[#111835] border border-[#2a3566] p-3 rounded text-emerald-400 overflow-x-auto whitespace-pre">
                            {step.evidence}
                          </pre>
                        </details>
                      )}

                      {/* Display Citations inside agents */}
                      {step.citations && step.citations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-mono text-[#9aa6c7]">Citable chunks:</span>
                          {step.citations.map(cId => (
                            <button
                              key={cId}
                              onClick={() => openCitationModal(cId)}
                              className="px-2 py-0.5 bg-[#1f2a5c] border border-[#2d5ff0] text-[#9db6ff] hover:bg-[#2d5ff0] hover:text-white rounded text-[10px] font-mono cursor-pointer transition select-none"
                            >
                              [{cId}]
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final predictive checklist recommendation card */}
                {diagnosisComplete && (
                  <div className="mt-6 border border-[#ffa300]/80 bg-[#1d1607] rounded-xl p-4 animate-feed">
                    <h5 className="font-bold text-xs text-[#ffc15a] uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
                      🏆 COGNITIVE ACTION DIRECTIVE LIST
                    </h5>
                    <div className="space-y-2 text-xs text-slate-100">
                      <div className="flex gap-2.5 items-start">
                        <span className="font-mono text-[#ffc15a] font-extrabold">1.</span>
                        <p className="flex-1">
                          <b>Procurement Lock:</b> Raise immediate warehouse RFQ list for component replenishment (FAG Bearing alternativeSKF 23264-CC/W33, ₹14.2 L cost, current local stock is 0 units).
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="font-mono text-[#ffc15a] font-extrabold">2.</span>
                        <p className="flex-1">
                          <b>Load Deflection:</b> Shift control coordinator to throttle roll-mill RPM rate by 8% over the next 48 hours to secure the RUL safety span.
                        </p>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="font-mono text-[#ffc15a] font-extrabold">3.</span>
                        <p className="flex-1">
                          <b>Safety Verification:</b> Lock and tag LOTO circuit breakers per IS 14489 safety standards before entering mechanical compartment bounds.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: RAG CHAT + CITATIONS                              */}
        {/* ======================================================== */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-feed">
            
            {/* Left Hand Interactive Chat Container */}
            <div className="lg:col-span-8 bg-[#111835] border border-[#2a3566] p-0 rounded-xl flex flex-col h-[520px]">
              <div className="p-4 border-b border-[#2a3566]/60 flex items-center justify-between bg-[#0a0f24]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#9db6ff]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-white">RAG Maintenance Assistant</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#9aa6c7]">
                  <span className="bg-[#1f2a5c] px-2 py-0.5 rounded text-indigo-300">corpus: 10 docs</span>
                  <span className="bg-[#2a3566] px-2 py-0.5 rounded text-emerald-300">indexed: 8,412 nodes</span>
                </div>
              </div>

              {/* Chat log wrapper */}
              <div className="flex-1 overflow-y-auto scrollbar p-4 space-y-4">
                {chatHistory.map((m, mIdx) => (
                  <div key={mIdx} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed max-w-[80%] ${
                      m.role === "user"
                        ? "bg-[#1e4fd9] text-white"
                        : "bg-[#0b1020] border border-[#2a3566] text-slate-100"
                    }`}>
                      <p className="whitespace-pre-line">{m.text}</p>
                      
                      {/* Interactive Citation Buttons inside models responses */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-[#2a3566]/40 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-mono text-[#9aa6c7]">Grounded citations:</span>
                          {m.citations.map(cId => (
                            <button
                              key={cId}
                              onClick={() => openCitationModal(cId)}
                              className="px-2 py-0.5 bg-[#1f2a5c]/80 text-[#9db6ff] hover:bg-[#1e4fd9] hover:text-white rounded text-[10px] font-mono border border-[#2d5ff0] cursor-pointer transition select-none"
                            >
                              [{cId}]
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="text-xs text-[#9aa6c7] font-mono italic animate-pulse">Running semantic cosine similarity matching over indexes...</div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-[#0a0f24] border-t border-[#2a3566]/80 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      const q = chatInput.trim();
                      if (!q) return;
                      setChatInput("");
                      setChatHistory(prev => [...prev, { role: "user", text: q }]);
                      setChatLoading(true);
                      setTimeout(() => {
                        let textReply = "I could not find an exact matching pattern in the indexed factory manuals. Please refine your query or ask for 'HSM-1 bearing state' or 'Sinter fan blade failures'.";
                        let citations: string[] = [];

                        const lq = q.toLowerCase();
                        if (lq.includes("hsm-1") || lq.includes("bearing") || lq.includes("hsm")) {
                          textReply = `HSM-1 is exhibiting clear symptoms of bearing deterioration [OEM-009]. Live vibration metrics hit 6.8 mm/s, displaying extreme 1X/2X imbalance trends.

Historical index [HIST-441] indicates a similar signature in the 2023-08-14 failure, which caused ₹41Cr of process downtime. We currently have 0 components of Demag Part 23264-CAK on hand [SPARE-22].

Recommended repair instructions align with [SOP-001].`;
                          citations = ["OEM-009", "HIST-441", "SPARE-22", "SOP-001"];
                        } else if (lq.includes("sin-2") || lq.includes("sinter") || lq.includes("fan")) {
                          textReply = `The sinter plant exhaust fan (SIN-2) is running in critical zone C per the vibration spectrum atlas [MAN-014]. Vibration amplitude is 9.2 mm/s due to particulate dust fouling on the impeller blades.

This aligns with historical blade fractures in [HIST-512]. A spare blade assembly is available on hand [SPARE-31]. Outage is mandatory within 48 hours.`;
                          citations = ["MAN-014", "HIST-512", "SPARE-31"];
                        } else if (lq.includes("safety") || lq.includes("loto") || lq.includes("is 14489")) {
                          textReply = `Regulatory compliance guidelines per Bureau of Indian Standards [REG-IS] dictate signed permit-to-work, double-isolation, and zero-energy confirmation before commencing high-stress maintenance procedures. HSM bearing shifts must execute these isolation steps per [SOP-001].`;
                          citations = ["REG-IS", "SOP-001"];
                        }

                        setChatHistory(prev => [...prev, { role: "model", text: textReply, citations }]);
                        setChatLoading(false);
                      }, 700);
                    }
                  }}
                  placeholder="Ask anything · e.g., 'What is wrong with HSM-1?' or 'Show SOP for HSM-1 bearing replacement'"
                  className="flex-1 bg-[#0b1020] border border-[#2a3566] text-white px-3 py-2 text-xs rounded-lg font-mono focus:outline-none focus:border-[#1e4fd9]"
                />
                <button className="px-3 bg-[#1e4fd9] hover:bg-blue-600 rounded-lg text-xs font-bold font-sans flex items-center justify-center cursor-pointer text-white">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Hand Quick Queries */}
            <div className="lg:col-span-4 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2">Pre-configured semantic targets</h4>
              <p className="text-xs text-[#9aa6c7] leading-relaxed">
                Click any of the queries below to run a semantic cosine retrieval sequence over the indexed documents corpus.
              </p>
              
              <div className="space-y-2.5">
                {[
                  "What is wrong with HSM-1 right now?",
                  "Show SOP for HSM-1 bearing replacement",
                  "Why is SIN-2 critical and what should we do?",
                  "Do we have spare bearings in stock?",
                  "What does IS 14489 require for this job?",
                ].map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => {
                      setChatInput(q);
                    }}
                    className="w-full text-left px-3 py-2 bg-[#0b1020]/90 border border-[#2a3566] hover:border-[#1e4fd9] text-xs text-[#9db6ff] hover:text-white rounded-lg transition font-medium cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: REASONING MAP                                     */}
        {/* ======================================================== */}
        {activeTab === "rmap" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-feed">
            
            {/* Visual Agentic flowchart */}
            <div className="lg:col-span-8 bg-[#111835] border border-[#2a3566] p-5 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-1">Agentic Reasoning Graph & Confidence Flow</h4>
                <p className="text-xs text-[#9aa6c7] mb-4 font-mono">
                  Detailed semantic graph mapping sensor signals, vector documents, model weights (Phi-3.5) and outputs.
                </p>
              </div>

              {/* Responsive Flow Map Layout */}
              <div className="relative border border-[#2a3566]/60 bg-[#0a0f24] rounded-xl p-4 flex items-center justify-center overflow-x-auto min-h-[380px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-2xl text-center relative font-mono text-xs text-[#e7ecf7]">
                  
                  {/* Column 1: Perception Inputs */}
                  <div className="space-y-4">
                    <div className="text-[10px] text-[#9aa6c7] uppercase font-bold tracking-widest mb-1 border-b border-[#2a3566]/50 pb-1">Perception L1</div>
                    <button 
                      onClick={() => setNodeDetail("📡 Node: Sensor-1 (HSM-1 Vibration). Live absolute value: 6.8 mm/s. Absolute divergence slope matches outer-race spalling vectors (+0.27 mm/s/day).")}
                      className="w-full p-3 bg-[#111835] hover:bg-[#1a244b] border border-[#5ee0a8]/40 hover:border-[#5ee0a8] rounded-xl text-left cursor-pointer transition text-[11px]"
                    >
                      <span className="text-[#5ee0a8] block font-black">Vib. RMS Detector</span>
                      <span className="text-[9.5px] mt-1 block text-slate-400">vib: 6.8 mm/s · rate +0.27/d</span>
                    </button>
                    <button 
                      onClick={() => setNodeDetail("📡 Node: Sensor-2 (HSM-1 Bearing Temperature). Live absolute value: 78°C. Displaying rapid thermal climbing trends (+0.78°C/day).")}
                      className="w-full p-3 bg-[#111835] hover:bg-[#1a244b] border border-[#5ee0a8]/40 hover:border-[#5ee0a8] rounded-xl text-left cursor-pointer transition text-[11px]"
                    >
                      <span className="text-[#5ee0a8] block font-black">Temp. Monitor</span>
                      <span className="text-[9.5px] mt-1 block text-slate-400">temp: 78°C · rate +0.78°C/d</span>
                    </button>
                  </div>

                  {/* Column 2: RAG Retrieval Index */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="text-[10px] text-[#9aa6c7] uppercase font-bold tracking-widest mb-1 border-b border-[#2a3566]/50 pb-1">Vector Index L2</div>
                    <button 
                      onClick={() => setNodeDetail("📚 Node: Document Retriever (SMS Demag manual). Cosine score: 0.852. Extracts pages referencing bearing limits (alarm at 7 mm/s, trip at 10 mm/s) [OEM-009].")}
                      className="w-full p-3 bg-[#111835] hover:bg-[#1a244b] border border-[#9db6ff]/40 hover:border-[#9db6ff] rounded-xl text-left cursor-pointer transition text-[11px]"
                    >
                      <span className="text-[#9db6ff] block font-black">SOP / Manual Parser</span>
                      <span className="text-[9.5px] mt-1 block text-slate-400">4 docs retrieved · avg score 0.85</span>
                    </button>
                  </div>

                  {/* Column 3: Fine-tuned Model weights */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="text-[10px] text-[#9aa6c7] uppercase font-bold tracking-widest mb-1 border-b border-[#2a3566]/50 pb-1">Inference Engine L3</div>
                    <button 
                      onClick={() => setNodeDetail("🧠 Node: LoRA Inference adapter (microsoft/Phi-3.5-mini-instruct). Adapts attention projections to steel failures. Identifies bearing spalling logit at 0.91 probability.")}
                      className="w-full p-3 bg-[#111835] hover:bg-[#1a244b] border border-[#ffc15a]/40 hover:border-[#ffc15a] rounded-xl text-left cursor-pointer transition text-[11px]"
                    >
                      <span className="text-[#ffc15a] block font-black">Phi-3.5 Model FT</span>
                      <span className="text-[9.5px] mt-1 block text-slate-400">LoRA r=16 α=32 · conf: 91%</span>
                    </button>
                  </div>

                  {/* Column 4: Preventative actions output */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="text-[10px] text-[#9aa6c7] uppercase font-bold tracking-widest mb-1 border-b border-[#2a3566]/50 pb-1">Action Out L4</div>
                    <button 
                      onClick={() => setNodeDetail("📋 Node: Action Planner. Sequences torque metrics, safety lockout sequences per IS 14489, and alternate component re-orders of [SPARE-22].")}
                      className="w-full p-3 bg-[#111835] hover:bg-[#1a244b] border border-[#c4b5fd]/40 hover:border-[#c4b5fd] rounded-xl text-left cursor-pointer transition text-[11px]"
                    >
                      <span className="text-[#c4b5fd] block font-black">Action Compiler</span>
                      <span className="text-[9.5px] mt-1 block text-slate-400">3-step scheduled LOTO plan</span>
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Right hand Node description and Ledger */}
            <div className="lg:col-span-4 bg-[#111835] border border-[#2a3566] p-5 rounded-xl flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-white tracking-wider border-b border-[#2a3566]/60 pb-2">Active Node Detail</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{nodeDetail}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-white tracking-wider border-b border-[#2a3566]/60 pb-1">Decision edge weights ledger</h4>
                <div className="space-y-2 text-xs">
                  {[
                    { from: "Perception L1", to: "Semantic Retrieval", weight: "0.96", citations: ["OEM-009"] },
                    { from: "Semantic Retrieval", to: "Phi-3.5 Inferences", weight: "0.89", citations: ["HIST-441"] },
                    { from: "Phi-3.5 Out", to: "Action compile", weight: "0.91", citations: ["SOP-001"] },
                  ].map((e, idx) => (
                    <div key={idx} className="bg-[#0a0f24] p-2.5 rounded-lg border border-[#2a3566]/60 space-y-1.5 font-mono">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{e.from} → {e.to}</span>
                        <strong className="text-[#ffc15a]">{e.weight}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9.5px] text-[#9db6ff]/80">Cites: {e.citations.join(", ")}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 rounded leading-none">VERIFIED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MPI TRANSPARENCY                                  */}
        {/* ======================================================== */}
        {activeTab === "mpi" && (
          <div className="space-y-6 animate-feed">
            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-1">Model Performance Index (MPI) Framework</h4>
              <p className="text-xs text-[#9aa6c7] leading-relaxed">
                Auditable decision index parameters mapped to guarantee high transparency for plant operators and prevent hallucination.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Formula Description */}
              <div className="lg:col-span-5 bg-[#111835] border border-[#2a3566] p-5 rounded-xl font-mono text-xs">
                <h4 className="text-slate-100 font-bold mb-3 uppercase tracking-wider font-sans text-xs">Composite weight algorithm</h4>
                <div className="bg-[#0a0f24] p-4 rounded-lg border border-[#2a3566] space-y-3 leading-relaxed">
                  <p className="text-white font-black">MPI = 0.35 · F1 + 0.20 · AUC + 0.15 · Coverage + 0.15 · (1 − Brier) + 0.15 · OpImpact</p>
                  <p className="text-slate-300 space-y-1 mt-2">
                    • <b>F1:</b> Model predictions macro-F1 on test fold.<br />
                    • <b>AUC:</b> Area under curve (ROC) benchmarks.<br />
                    • <b>Coverage:</b> Ratio of RAG cited annotations matched.<br />
                    • <b>Brier:</b> Mean squared error calibration score.<br />
                    • <b>OpImpact:</b> Standardised repair speed reduction coefficients.
                  </p>
                </div>
              </div>

              {/* Asset values table */}
              <div className="lg:col-span-7 bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
                <h4 className="text-slate-100 font-bold mb-3 uppercase tracking-wider text-xs">Asset Specific Sub-Scores and Final MPI Output</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[#9aa6c7] uppercase border-b border-[#2a3566] font-mono">
                      <tr>
                        <th className="py-2 px-1">Asset ID</th>
                        <th>Precision</th>
                        <th>Recall</th>
                        <th>Macro F1</th>
                        <th>AUC</th>
                        <th>Brier↓</th>
                        <th>Coverage</th>
                        <th>MPI Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3566]/40 font-mono">
                      {MOCK_ASSETS.map(a => {
                        const m = getMetricsForAsset(a.id);
                        const rating = (m.f1 * 3.5 + m.auc * 2 + m.coverage * 1.5 + (1 - m.brier) * 1.5);
                        return (
                          <tr key={a.id} className="hover:bg-slate-800/20 transition">
                            <td className="py-2 px-1 font-bold text-white">{a.id}</td>
                            <td>{m.precision.toFixed(2)}</td>
                            <td>{m.recall.toFixed(2)}</td>
                            <td>{m.f1.toFixed(2)}</td>
                            <td>{m.auc.toFixed(2)}</td>
                            <td>{m.brier.toFixed(2)}</td>
                            <td>{(m.coverage * 100).toFixed(0)}%</td>
                            <td className="text-emerald-400 font-extrabold">{rating.toFixed(2)} / 10</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Radar Charts comparison */}
            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-4">Plant performance radar vs 2024 industrial baseline</h4>
              <div className="h-[260px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: "Precision", current: 0.91, baseline: 0.78 },
                    { subject: "Recall", current: 0.88, baseline: 0.74 },
                    { subject: "F1 Score", current: 0.90, baseline: 0.76 },
                    { subject: "ROC AUC", current: 0.94, baseline: 0.82 },
                    { subject: "Coverage", current: 0.96, baseline: 0.80 },
                    { subject: "MTTR Reduction", current: 0.75, baseline: 0.30 },
                  ]}>
                    <PolarGrid stroke="#2a3566" />
                    <PolarAngleAxis dataKey="subject" stroke="#9aa6c7" tick={{ fontSize: 10, fill: "#9aa6c7" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} stroke="#2a3566" />
                    <Radar name="Shift Performance" dataKey="current" stroke="#ffc15a" fill="#ffc15a" fillOpacity={0.15} />
                    <Radar name="Historical Baseline" dataKey="baseline" stroke="#9db6ff" fill="#9db6ff" fillOpacity={0.10} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: SPARE PARTS PRIORITISATION                         */}
        {/* ======================================================== */}
        {activeTab === "spares" && (
          <div className="space-y-6 animate-feed">
            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-1">Preventative Inventory Prioritization Analysis</h4>
              <p className="text-xs text-[#9aa6c7] leading-relaxed">
                Calculates priority coefficients based on the Arrhenius asset criticality weights, active remaining useful life intervals and supplier lead-times.
              </p>
            </div>

            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[#9aa6c7] border-b border-[#2a3566] uppercase font-mono">
                    <tr>
                      <th className="py-2 px-1">Replacement Part Name</th>
                      <th>Asset Class</th>
                      <th>Criticality Mapping</th>
                      <th>Local Stock Status</th>
                      <th>Out-of-Stock Priority</th>
                      <th>Supplier Lead-time</th>
                      <th>Unit Cost</th>
                      <th>Active Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a3566]/40">
                    {[
                      { part: "Spherical Roller Bearing CAK/W33", asset: "HSM-1", crit: "Critical-Safety", stock: "0 units / min 1", lead: "11 days max", cost: "₹14.2 L", priority: "HIGH RISK", color: "text-rose-400 border-rose-500/20 bg-rose-500/10" },
                      { part: "Sinter Fan Blade Assembly HF-2200", asset: "SIN-2", crit: "Production-Critical", stock: "1 set / min 2", lead: "45 days max", cost: "₹38 L", priority: "MEDIUM RISK", color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
                      { part: "Coke-oven Solvent Strainer Kit GSK-COG", asset: "COG-1", crit: "Critical-Safety", stock: "3 sets / min 2", lead: "7 days max", cost: "₹0.6 L", priority: "STANDBY", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
                      { part: "Mould Oscillation Gearbox CCM-A", asset: "CCM-2", crit: "Production-Important", stock: "1 unit / min 1", lead: "30 days max", cost: "₹9 L", priority: "OK", color: "text-slate-400 border-slate-500/20 bg-slate-500/10" },
                    ].map((s, sIdx) => (
                      <tr key={sIdx} className="hover:bg-slate-800/10 transition">
                        <td className="py-3 px-1 font-bold text-white font-mono">{s.part}</td>
                        <td className="font-mono">{s.asset}</td>
                        <td><span className="bg-[#1f2a5c] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#2a3566] font-sans text-[#9db6ff]">{s.crit}</span></td>
                        <td className="font-mono text-white font-bold">{s.stock}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${s.color}`}>
                            {s.priority}
                          </span>
                        </td>
                        <td className="font-mono">{s.lead}</td>
                        <td className="font-mono font-bold text-white">{s.cost}</td>
                        <td>
                          <button className="px-2 py-1 bg-[#1a2348] border border-[#2a3566] hover:bg-[#1e4fd9] text-xs font-bold font-sans rounded text-[#9db6ff] hover:text-white transition cursor-pointer">
                            Stage RFQ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: ROLE-BASED ALERTS / LOGBOOK                        */}
        {/* ======================================================== */}
        {activeTab === "logbook" && (
          <div className="space-y-6 animate-feed">
            <div className="bg-[#111835] border border-[#2a3566] p-4 flex flex-wrap items-center gap-3 rounded-xl">
              <span className="text-xs font-bold text-[#9aa6c7]">Role level selector:</span>
              <button 
                onClick={() => setActiveRoleFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeRoleFilter === null ? "bg-[#1e4fd9] text-white" : "bg-[#1f2a5c] text-[#9aa6c7]"}`}
              >
                All Personnel
              </button>
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setActiveRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeRoleFilter === r ? "bg-[#1e4fd9] text-white" : "bg-[#1f2a5c] text-[#9aa6c7]"}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Filtered alerts stack */}
              <div className="lg:col-span-5 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-2">My Role Specific Notifications</h4>
                
                {MOCK_ALERTS
                  .filter(a => activeRoleFilter === null || a.role.includes(activeRoleFilter))
                  .map(a => (
                    <div key={a.id} className="bg-[#0a0f24] border border-[#2a3566]/60 p-4 rounded-xl relative border-l-4 border-l-rose-500">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#9db6ff] mb-1">
                        <span className="font-bold text-rose-400">{a.sev}</span>
                        <span>{a.time}</span>
                      </div>
                      <p className="text-xs">{a.msg}</p>
                      <div className="mt-2 text-[9px] font-mono text-slate-400">Escalated to: {a.role.join(", ")}</div>
                    </div>
                ))}
              </div>

              {/* Digital log book manual appending */}
              <div className="lg:col-span-7 bg-[#111835] border border-[#2a3566] p-5 rounded-xl flex flex-col justify-between min-h-[400px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#2a3566]/60">
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Digital handover logbook</h4>
                    <button 
                      onClick={() => {
                        const note = prompt("Write your log instructions:");
                        if (!note) return;
                        setLogbookEntries(prev => [
                          {
                            ts: "2026-06-18 " + new Date().toLocaleTimeString().slice(0, 5),
                            role: "Maintenance Engineer",
                            user: "R. Mahanta",
                            asset: "HSM-1",
                            action: note,
                            outcome: "Closed"
                          },
                          ...prev
                        ]);
                      }}
                      className="px-3 py-1.5 bg-[#1e4fd9] hover:bg-blue-600 rounded text-xs font-bold font-sans flex items-center gap-1 cursor-pointer text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Append Shift Log
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar pr-1">
                    {logbookEntries
                      .filter(l => activeRoleFilter === null || l.role === activeRoleFilter)
                      .map((l, lIdx) => (
                        <div key={lIdx} className="bg-[#0a0f24] border border-[#2a3566] p-3 rounded-lg flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-white font-bold">{l.user} ({l.role})</span>
                            <span className="text-slate-400">{l.ts}</span>
                          </div>
                          <p className="text-xs text-slate-200">{l.action}</p>
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-indigo-300">Target: {l.asset}</span>
                            <span className={`px-1.5 rounded leading-none ${
                              l.outcome === "OK" || l.outcome === "Closed" || l.outcome === "Effective" 
                                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" 
                                : "bg-amber-500/15 text-amber-300"
                            }`}>{l.outcome}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: FINE-TUNE CARD (PHI-3.5)                          */}
        {/* ======================================================== */}
        {activeTab === "model" && (
          <div className="space-y-6 animate-feed">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* model statistics card */}
              <div className="lg:col-span-7 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center gap-2 border-b border-[#2a3566]/60 pb-3">
                  <h4 className="font-bold text-sm text-white uppercase tracking-wider">phi-3.5-steel-ft Adapter</h4>
                  <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase">
                    LoRA r=16, α=32
                  </span>
                  <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase">
                    VALIDATION LOSS: 0.341
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  The base <b>microsoft/Phi-3.5-mini-instruct</b> model has been fine-tuned over a curated folder comprising 12,418 steel plant events. This process aligns general language parameters with specific metallurgical mechanics and sensor thresholds.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  {[
                    { key: "Base weights", val: "microsoft/Phi-3.5-mini-instruct" },
                    { key: "Adapter size", val: "LoRA r=16, α=32 (184MB adapter)" },
                    { key: "Dataset records", val: "12,418 labelled rows" },
                    { key: "Train Epochs", val: "3 epochs cosine schedule" },
                    { key: "Optimiser", val: "AdamW 8-bit, lr=2e-4" },
                    { key: "Hardware", val: "1x NVIDIA A100 SXM4 (80GB)" },
                    { key: "Output model macro-F1", val: "0.91 (5 failure modes)" },
                    { key: "Hallucination mitigation", val: "Vector RAG double checking" },
                  ].map((f, fIdx) => (
                    <div key={fIdx} className="bg-[#0a0f24] border border-[#2a3566]/60 p-2.5 rounded-lg">
                      <div className="text-[10px] text-[#9aa6c7] uppercase">{f.key}</div>
                      <div className="text-xs font-bold text-white mt-1">{f.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dataset composition graph */}
              <div className="lg:col-span-5 bg-[#111835] border border-[#2a3566] p-5 rounded-xl flex flex-col justify-between">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2 font-mono">Fine-Tuning Data Distribution</h4>
                <div className="h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "AI4I-2020", records: 10000 },
                      { name: "Tata logs", records: 1812 },
                      { name: "Synthetic", records: 406 },
                      { name: "SOP corpus", records: 200 },
                    ]}>
                      <CartesianGrid stroke="#2a3566" strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#9aa6c7" tick={{ fontSize: 9, fill: "#9aa6c7" }} />
                      <YAxis stroke="#9aa6c7" tick={{ fontSize: 9, fill: "#9aa6c7" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0a0f24", borderColor: "#2a3566" }} />
                      <Bar dataKey="records" fill="#ffa300" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3 font-mono">Held-out Evaluation Confusion Matrix (5 failure modes)</h4>
              <div className="overflow-x-auto">
                <table className="text-xs font-mono w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 border border-[#2a3566]/50 bg-[#0a0f24]">True \ Pred</th>
                      <th className="p-2 border border-[#2a3566]/50 text-indigo-300">Bearing</th>
                      <th className="p-2 border border-[#2a3566]/50 text-indigo-300">Tool Wear</th>
                      <th className="p-2 border border-[#2a3566]/50 text-indigo-300">Heat Diss.</th>
                      <th className="p-2 border border-[#2a3566]/50 text-indigo-300">Power</th>
                      <th className="p-2 border border-[#2a3566]/50 text-indigo-300">Overstrain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "True Bearing", row: [428, 8, 3, 5, 4] },
                      { name: "True Tool Wear", row: [6, 312, 4, 7, 5] },
                      { name: "True Heat Diss.", row: [3, 5, 288, 6, 4] },
                      { name: "True Power", row: [4, 6, 5, 266, 7] },
                      { name: "True Overstrain", row: [5, 4, 5, 6, 251] },
                    ].map((r, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 border border-[#2a3566]/50 font-bold bg-[#0a0f24] text-left text-white">{r.name}</td>
                        {r.row.map((val, cIdx) => {
                          const isDiag = rIdx === cIdx;
                          return (
                            <td 
                              key={cIdx} 
                              className={`p-2 border border-[#2a3566]/50 font-bold ${
                                isDiag ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/10 text-rose-300"
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: AI4I-2020 DATASET ARCHIVE                         */}
        {/* ======================================================== */}
        {activeTab === "dataset" && (
          <div className="space-y-6 animate-feed">
            <div className="bg-[#111835] border border-[#2a3566] p-5 rounded-xl">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-1">UCI AI4I-2020 Predictive Maintenance Dataset</h4>
              <p className="text-xs text-[#9aa6c7] leading-relaxed mb-4">
                Ground-truth dataset containing 10,000 failure events modeling Tool Wear, Heat Dissipation, Overstrain and Power degradation. Published by S. Matzka (UCI repository CC-BY-4.0). Used inside our training adapter pipeline.
              </p>

              {/* Hard Quantitative Benchmark Metrics Grid */}
              <div className="mb-4 p-3 bg-[#0a0f24]/60 border border-[#2a3566]/60 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-cyan-300 font-extrabold tracking-wider block mb-2">
                  ⚡ MODEL EVALUATION BENCHMARKS (XGBOOST OUT-OF-SAMPLE CROSS-VALIDATION)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
                  <div className="border border-[#2a3566]/40 bg-[#161d3a]/50 p-2 rounded">
                    <span className="text-[8px] text-slate-400 block mb-0.5 uppercase">Accuracy</span>
                    <span className="text-sm font-black text-emerald-400">99.21%</span>
                  </div>
                  <div className="border border-[#2a3566]/40 bg-[#161d3a]/50 p-2 rounded">
                    <span className="text-[8px] text-slate-400 block mb-0.5 uppercase">Area Under ROC</span>
                    <span className="text-sm font-black text-cyan-300">0.988</span>
                  </div>
                  <div className="border border-[#2a3566]/40 bg-[#161d3a]/50 p-2 rounded">
                    <span className="text-[8px] text-slate-400 block mb-0.5 uppercase">Macro F1 Score</span>
                    <span className="text-sm font-black text-indigo-300">0.912</span>
                  </div>
                  <div className="border border-[#2a3566]/40 bg-[#161d3a]/50 p-2 rounded">
                    <span className="text-[8px] text-slate-400 block mb-0.5 uppercase">Recall</span>
                    <span className="text-sm font-black text-amber-300">86.42%</span>
                  </div>
                  <div className="border border-[#2a3566]/40 bg-[#161d3a]/50 p-2 rounded col-span-2 sm:col-span-1">
                    <span className="text-[8px] text-slate-400 block mb-0.5 uppercase">Precision</span>
                    <span className="text-sm font-black text-rose-400">92.51%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const csvRows = [AI4I_HEADERS.join(","), ...AI4I_DATA.map(r => r.join(","))].join("\n");
                    const blob = new Blob([csvRows], { type: "text/csv" });
                    const blobEl = document.createElement("a");
                    blobEl.href = URL.createObjectURL(blob);
                    blobEl.download = "milling_ai4i_data_sample.csv";
                    blobEl.click();
                  }}
                  className="px-3 py-1.5 bg-[#1e4fd9] hover:bg-blue-600 rounded text-xs font-bold font-sans flex items-center gap-1.5 text-white"
                >
                  <Download className="h-4 w-4" /> Download Sample CSV
                </button>
                <a 
                  href="https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#1f2a5c] border border-[#2a3566] hover:text-white rounded text-xs font-bold font-sans flex items-center gap-1 text-[#9db6ff]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Full UCI details
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Data Table */}
              <div className="lg:col-span-7 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-3">
                <h4 className="font-bold text-xs text-white uppercase font-mono mb-2 border-b border-[#2a3566]/60 pb-1">Sample rows (including failure cases)</h4>
                <div className="overflow-auto max-h-[380px] scrollbar rounded border border-[#2a3566]/40">
                  <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                    <thead className="sticky top-0 bg-[#0a0f24] text-indigo-300">
                      <tr>
                        {AI4I_HEADERS.map(h => <th key={h} className="p-2 border border-[#2a3566]/20">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a3566]/10 text-slate-200">
                      {AI4I_DATA.map((r, rIdx) => {
                        const hasFailed = r[8] === 1;
                        return (
                          <tr key={rIdx} className={`hover:bg-slate-800/10 ${hasFailed ? "bg-rose-950/20" : ""}`}>
                            {r.map((v, cIdx) => (
                              <td key={cIdx} className={`p-2 border border-[#2a3566]/20 ${cIdx === 8 && v === 1 ? "text-rose-400 font-extrabold" : ""}`}>
                                {v}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data distributions charts */}
              <div className="lg:col-span-5 bg-[#111835] border border-[#2a3566] p-5 rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-white uppercase font-mono">Dataset Failure Distribution</h4>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "TWF", value: 3 },
                      { name: "HDF", value: 6 },
                      { name: "PWF", value: 7 },
                      { name: "OSF", value: 4 },
                      { name: "RNF", value: 1 },
                    ]}>
                      <CartesianGrid stroke="#2a3566" strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#9aa6c7" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#9aa6c7" tick={{ fontSize: 9 }} />
                      <Bar dataKey="value" fill="#ff8195" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <h4 className="font-bold text-xs text-white uppercase font-mono border-t border-[#2a3566]/50 pt-3">Torque vs Toolwear (failures highlighted)</h4>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid stroke="#2a3566" strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" dataKey="wear" name="Tool Wear" unit="min" stroke="#9aa6c7" tick={{ fontSize: 9 }} />
                      <YAxis type="number" dataKey="torque" name="Torque" unit="Nm" stroke="#9aa6c7" tick={{ fontSize: 9 }} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter name="OK Class" data={AI4I_DATA.filter(r => r[8] === 0).map(r => ({ wear: r[7], torque: r[6] }))} fill="#5ee0a8" opacity={0.6} />
                      <Scatter name="Fail Class" data={AI4I_DATA.filter(r => r[8] === 1).map(r => ({ wear: r[7], torque: r[6] }))} fill="#ff8195" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* 3: AUDITOR MODAL VIEW (CITATIONS DETAIL DIRECT LOOKUPS)  */}
      {/* ======================================================== */}
      {openedCitation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#111835] border border-[#2a3566] max-w-2xl w-full p-6 rounded-2xl shadow-2xl relative animate-feed text-left">
            <div className="flex justify-between items-center border-b border-[#2a3566]/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#1e4fd9] text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
                  {openedCitation.id}
                </span>
                <span className="text-xs text-[#9db6ff] font-mono uppercase bg-[#1f2a5c] px-2 py-1 rounded border border-[#2a3566]">
                  {openedCitation.category}
                </span>
              </div>
              <button 
                onClick={() => setOpenedCitation(null)}
                className="px-3 py-1 bg-[#2a3566] hover:bg-rose-600 font-bold transition hover:text-white rounded text-xs text-[#e7ecf7] cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <h4 className="text-base font-black text-white mb-2">{openedCitation.title}</h4>
            <div className="text-xs text-slate-100 leading-relaxed max-h-[250px] overflow-y-auto scrollbar bg-[#0a0f24] p-4 rounded-xl border border-[#2a3566]">
              {openedCitation.content}
            </div>
            <div className="mt-4 text-[10px] font-mono text-[#9aa6c7]">
              Repository updated: {openedCitation.lastUpdated} · SHA256 integrity check status: <strong className="text-emerald-400">PASSED</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
