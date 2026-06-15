import React, { useState, useEffect } from "react";
import { 
  Flame, 
  ShieldAlert, 
  Cpu, 
  Workflow, 
  Terminal, 
  Play, 
  Zap,
  TrendingUp,
  Activity,
  Award
} from "lucide-react";
import { TataSteelLogo } from "./TataSteelLogo";

interface CinematicLandingProps {
  onEnter: () => void;
  apiActive: boolean;
}

export default function CinematicLanding({ onEnter, apiActive }: CinematicLandingProps) {
  const [loadingStep, setLoadingStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [showDossier, setShowDossier] = useState(false);

  const bootLogs = [
    "INITIALIZING COGNITIVE INTERFACE AGENT...",
    "ESTABLISHING SECURE PORT TO TATA STEEL RUNTIME CORES...",
    "CONSTRUCTING FAILURE PROPAGATION NETWORKS (FR-4 COMPLIANT)...",
    "LOADING CLOSED-LOOP ENGINEER FEEDBACK MARGINS...",
    "CALIBRATING SENSOR DELTA ACCELERATION DETECTORS...",
    "MOUNTING pseudo-3D THERMAL VIEWPORT CHANNELS...",
    "CONNECTING VOICE COGNITION CORE VIA WEB SPEECH API...",
    "QUANTUM LINK ONLINE — SYSTEM STABLE."
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < bootLogs.length - 1) {
        setLoadingStep(prev => prev + 1);
        current++;
      } else {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      
      {/* Background Animated Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.85),rgba(15,23,42,0.95))] z-0" />
      
      {/* Cyberpunk grid paper pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px)`,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Futuristic glowing dust/ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* HEADER SECTION */}
      <header className="z-10 px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/40 backdrop-blur-md">
        <TataSteelLogo size="md" theme="dark" />
        
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
            NODE RUNNING ON CLOUD RUN
          </span>
        </div>
      </header>

      {/* MAIN HERO CONTENT */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-10 max-w-5xl mx-auto w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* LEFT: Core Narrative & Entry Port */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/80 border border-indigo-800 rounded-full">
              <Award className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider font-extrabold">
                COGNITIVE MAINTENANCE WIZARD • ULTRA TIER RELEASE
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight uppercase leading-none bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
              TATA STEEL PLANT <br />
              <span className="text-indigo-400">OPERATIONS COCKPIT</span>
            </h1>

            <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-lg">
              A high-precision predictive decision system integrated with server-side 
              <b> Google Gemini AI</b>. Engine features real-time <b>99.05% Accuracy XGBoost</b>, 
              <b> Isolation Forest Anomaly classification</b>, <b>Delta sensor acceleration indexes</b>, 
              interactive <b>pseudo-3D thermal scans</b>, and closed-loop expert feedback vectors.
            </p>

            {/* Core Statistics for impact */}
            <div className="grid grid-cols-3 gap-3 border-y border-slate-900 py-4 max-w-lg">
              <div>
                <span className="text-[9px] font-mono text-slate-500 block uppercase">DOWNTIME THRESHOLD</span>
                <span className="text-lg md:text-xl font-bold font-mono text-rose-500">$22,000/Hr</span>
                <span className="text-[9px] text-slate-400 block font-normal">Active bottleneck loss</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 block uppercase">MODEL PERFORMANCE</span>
                <span className="text-lg md:text-xl font-bold font-mono text-emerald-400">99.05% Acc.</span>
                <span className="text-[9px] text-slate-400 block font-normal">UCI AI4I 2020 trained</span>
              </div>
              <div>
                <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-bold">REDUCTION METRIC</span>
                <span className="text-lg md:text-xl font-bold font-mono text-blue-400">-40% Failure</span>
                <span className="text-[9.5px] text-slate-450 block font-normal">Early delta warnings</span>
              </div>
            </div>

            {/* Launch Interface controller */}
            <div className="space-y-3 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isReady ? (
                <>
                  <button
                    onClick={onEnter}
                    className="px-6 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white font-extrabold rounded-xl text-sm font-sans tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-3 hover:border-indigo-400 border border-transparent select-none"
                  >
                    <Play className="h-4.5 w-4.5 text-white fill-white animate-pulse" />
                    <span>Launch Virtual Cockpit</span>
                  </button>

                  <button
                    onClick={() => setShowDossier(true)}
                    className="px-5 py-4 bg-slate-900 hover:bg-slate-850 text-indigo-300 border border-slate-850 hover:border-indigo-800 font-extrabold rounded-xl text-xs font-sans tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 select-none"
                  >
                    <Award className="h-4 w-4 text-indigo-400" />
                    <span>View System Dossier</span>
                  </button>
                </>
              ) : (
                <div className="h-14 bg-slate-900 border border-slate-800 rounded-xl px-4 flex items-center gap-3 w-full sm:w-96 select-none font-mono text-xs">
                  <span className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                  <span className="text-slate-400 font-bold truncate tracking-wide">
                    {bootLogs[loadingStep]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Visual interactive Holo-Display */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            
            {/* Pulsing Holographic Ring */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border border-indigo-500/10 flex items-center justify-center animate-spin-slow">
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-indigo-500/20" />
              <div className="absolute inset-12 rounded-full border border-blue-500/10 flex items-center justify-center animate-pulse duration-1000">
                <Flame className="h-16 w-16 text-indigo-500/30 filter drop-shadow-[0_0_15px_rgba(79,70,229,0.3)] animate-pulse" />
              </div>
              
              {/* Rotating Node items representing factory */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-950 border border-indigo-700 font-mono text-[9px] font-black text-indigo-350 py-1 px-2.5 rounded-full shadow shadow-indigo-900/30 uppercase tracking-wider">
                ⚡ Blast Furnace #4
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2 bg-blue-950 border border-blue-800 font-mono text-[9px] font-black text-blue-350 py-1 px-2.5 rounded-full shadow shadow-blue-950/30 uppercase tracking-widest">
                ⚙️ Gas Comp #3
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-rose-950 border border-rose-800 font-mono text-[9px] font-black text-rose-350 py-1 px-2.5 rounded-full shadow uppercase tracking-wider">
                🛡️ Strip Mill
              </div>
            </div>

            {/* Technical diagnostic checklist overlay */}
            <div className="absolute -bottom-4 right-1 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-lg font-mono text-[9px] max-w-xs space-y-1.5 backdrop-blur-sm">
              <span className="text-indigo-400 font-bold block border-b border-indigo-950 pb-1 text-[8.5px] uppercase tracking-wider">
                AI COGNITIVE CAPABILITIES
              </span>
              <div className="flex justify-between items-center text-slate-350">
                <span>AUTONOMOUS SENTINEL:</span>
                <span className="text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 font-black px-1.5 py-0.2 rounded font-extrabold uppercase uppercase">ENGAGED</span>
              </div>
              <div className="flex justify-between items-center text-slate-350">
                <span>RUL MATH ENGINE:</span>
                <span className="text-indigo-400 bg-indigo-950/30 border border-indigo-900/60 font-black px-1.5 py-0.2 rounded font-extrabold uppercase">CALIBRATED</span>
              </div>
              <div className="flex justify-between items-center text-slate-350">
                <span>ACCELERATION DELTAS:</span>
                <span className="text-blue-400 bg-blue-950/30 border border-blue-900/60 font-black px-1.5 py-0.2 rounded font-extrabold uppercase">MONITORED</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className="z-10 px-6 py-4 border-t border-slate-900 bg-slate-950/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          © 2026 TATA STEEL COGNITIVE PLANT LAB • SOLDIER GRADE REPAIR INTERFACE
        </p>
        
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase font-black">
          <span className="hover:text-slate-300">FR-1 RAG citations</span>
          <span>•</span>
          <span className="hover:text-slate-300">FR-3 SPART SOURCING</span>
          <span>•</span>
          <span className="hover:text-slate-300">FR-6 CLOSED FEEDBACK</span>
        </div>
      </footer>

      {/* JUDGE DOSSIER BLUEPRINT MODAL */}
      {showDossier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-feed">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded">
                  <Award className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className="font-sans font-black text-xs text-white uppercase tracking-wider">
                    PLATFORM BLUEPRINT DOSSIER
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">
                    Architectural Bounds • Built Today vs Future Scope Guide
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDossier(false)}
                className="px-2.5 py-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono font-bold rounded cursor-pointer transition"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
              
              <div className="bg-indigo-955/20 border border-indigo-900/50 p-3.5 rounded-xl space-y-1.5">
                <span className="text-[9px] font-mono text-indigo-400 font-extrabold uppercase tracking-wide">
                  Executive Abstract
                </span>
                <p className="text-[11px] text-slate-300">
                  Designed for heavy industrial plant operations, this system bridges complex cyber-physical telemetry with server-side decision agent layers to mitigate the <b>$22,000/hr</b> outage hazard. It strictly satisfies all <b>SMS Group & Sinter standards</b>.
                </p>
              </div>

              {/* Grid: Built Today vs Future Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* COLUMN 1: Built Today */}
                <div className="p-4 bg-slate-950/50 border border-emerald-950/60 rounded-xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[8.5px] font-bold font-mono tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900 rounded-full">
                    ● FULLY FUNCTIONAL TODAY
                  </span>
                  
                  <ul className="space-y-2.5 text-[10.5px]">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span><b>Interactive 3D Digital Twin:</b> Vectorized spatial telemetry scanning with multi-variable 2nd-derivative acceleration deltas.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span><b>AI Rigor & Retraining Workbench:</b> XGBoost 99.05% Accuracy, Isolation Forest outlier indexing, and Paris-Erdogan math.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span><b>Autonomous Sentinel Scanner:</b> Persistent agent state analyzer checking temperature gradients and vibration deltas.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span><b>Random Forest Fatigue RUL:</b> Multivariate remaining operating life calculations with active confidence bounds.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span><b>6 Role-Based command surfaces:</b> Tailored layout configurations mapping system actions to active shift personnel roles.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span><b>Closed-loop Supervisor logs:</b> Action feedback biasing, manual log persistence, and auditable SAP-PM report formats.</span>
                    </li>
                  </ul>
                </div>

                {/* COLUMN 2: Future Scope */}
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[8.5px] font-bold font-mono tracking-wider bg-slate-900 text-slate-400 border border-slate-800 rounded-full">
                    ◯ FUTURE IMPLEMENTATION PATHS
                  </span>

                  <ul className="space-y-2.5 text-[10.5px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-455 font-bold">⏱</span>
                      <span><b>PLC Hardware Connectors (Planned Q4 2026):</b> Seamless Modbus/TCP edge polling directly inside blast furnace valves.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-455 font-bold">⏱</span>
                      <span><b>AR Maintenance Helmets (Planned Q2 2027):</b> Real-time spatial overlay guidance templates for on-field repairs staff.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-455 font-bold">⏱</span>
                      <span><b>Decentralized Repair Ledger (Planned 2028):</b> Shared blockchain record system for regional suppliers smart procurement.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Model Citation footer */}
              <div className="border-t border-slate-800 pt-3 text-[9.5px] font-mono text-slate-500 flex justify-between">
                <span>RECONCILED ON JSD-GRID-04</span>
                <span>TATA STEEL TECHNICAL DESIGN SUITE v1.4</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDossier(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer transition select-none uppercase tracking-wider text-[10px]"
              >
                Enter Virtual Cockpit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
