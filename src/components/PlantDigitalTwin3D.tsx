import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Layers, 
  Cpu, 
  Flame, 
  Wind, 
  Activity, 
  Workflow, 
  Compass, 
  Eye, 
  ChevronRight,
  TrendingUp,
  RotateCw
} from "lucide-react";

interface SensorDelta {
  id: string;
  name: string;
  value: string;
  unit: string;
  deltaRate: string; // Rate of change (e.g. +14 C/h)
  acceleration: string; // Rate of rate of change (e.g. +1.2 C/h2)
  riskStatus: "nominal" | "warning" | "critical";
  position: { x: number; y: number };
}

export default function PlantDigitalTwin3D() {
  const [activeCam, setActiveCam] = useState<"isometric" | "thermal" | "structural">("isometric");
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>("blast-furnace");
  const [millSpeed, setMillSpeed] = useState<number>(320); // RPM
  const [activeTime, setActiveTime] = useState<number>(0);

  // Animate virtual heat loops
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTime(prev => prev + 1);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const sensors: SensorDelta[] = [
    {
      id: "BF-T4",
      name: "Blast Furnace Tuyere Thermal Scanner",
      value: "1485",
      unit: "°C",
      deltaRate: "+18°C/hr",
      acceleration: "+2.4°C/hr² (ACCELERATING)",
      riskStatus: "warning",
      position: { x: 35, y: 42 }
    },
    {
      id: "GC-V3",
      name: "Coke Gas Compressor Rotor Vibration",
      value: "6.8",
      unit: "mm/s",
      deltaRate: "+0.45 mm/s/min",
      acceleration: "+0.12 mm/s/min² (EXPLOSIVE ANOMALY)",
      riskStatus: "critical",
      position: { x: 18, y: 72 }
    },
    {
      id: "CC-M12",
      name: "Caster Continuous Mould Play",
      value: "1.12",
      unit: "mm",
      deltaRate: "+0.02 mm/hr",
      acceleration: "0.00 mm/hr² (DECELERATED STABLE)",
      riskStatus: "nominal",
      position: { x: 62, y: 52 }
    },
    {
      id: "HSM-B9",
      name: "Hot Strip Work Roll Fatigue Delays",
      value: "72.4",
      unit: "kN",
      deltaRate: "-1.5 kN/min",
      acceleration: "-0.32 kN/min² (DECAY STEADY)",
      riskStatus: "nominal",
      position: { x: 84, y: 34 }
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-inner font-sans space-y-4 relative overflow-hidden">
      
      {/* Visual background blueprint theme grids */}
      <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1 px-1.5 bg-blue-950 text-blue-400 border border-blue-900 rounded-md">
            <Compass className="h-4.5 w-4.5 animate-spin-slow" />
          </span>
          <div>
            <h4 className="font-sans font-black text-xs uppercase tracking-wide flex items-center gap-2">
              <span>Tata Cyber-Twin pseudo-3D Hologram</span>
              <span className="text-[8px] bg-emerald-950 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded-full border border-emerald-800 uppercase animate-pulse">
                Telemetry Delta Core v1.4
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Live spatial coordinates & second-derivative (Rate of Acceleration) sensor matrices.
            </p>
          </div>
        </div>

        {/* View mode toggle controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-850 select-none">
          <button
            onClick={() => setActiveCam("isometric")}
            className={`px-2.5 py-1 text-[9.5px] font-mono font-black rounded uppercase tracking-wide flex items-center gap-1 cursor-pointer transition ${
              activeCam === "isometric" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Camera className="h-3 w-3" />
            <span>3D Isometric Ortho</span>
          </button>
          
          <button
            onClick={() => setActiveCam("thermal")}
            className={`px-2.5 py-1 text-[9.5px] font-mono font-black rounded uppercase tracking-wide flex items-center gap-1 cursor-pointer transition ${
              activeCam === "thermal" ? "bg-amber-600 text-white shadow-md shadow-amber-600/10" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Flame className="h-3 w-3" />
            <span>Thermal core</span>
          </button>

          <button
            onClick={() => setActiveCam("structural")}
            className={`px-2.5 py-1 text-[9.5px] font-mono font-black rounded uppercase tracking-wide flex items-center gap-1 cursor-pointer transition ${
              activeCam === "structural" ? "bg-teal-600 text-white shadow-md shadow-teal-600/10" : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Layers className="h-3 w-3" />
            <span>Subsystems Node</span>
          </button>
        </div>
      </div>

      {/* Main split-screen grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        
        {/* LEFT COMPONENT: Interactive 3D SVG Scene */}
        <div className="lg:col-span-8 bg-black/40 border border-slate-850 rounded-xl p-3 relative h-[250px] md:h-[320px] flex items-center justify-center">
          
          {/* Spatial Blueprint Overlay Indicator */}
          <div className="absolute top-2.5 left-2.5 font-mono text-[9px] text-slate-500 space-y-0.5">
            <div>CAMERA ANGLE: POS_GRID_ORTHO_Z</div>
            <div>FIELD ELEVATION: 104.2m AMSL</div>
            <div>VECTOR ENGINE: WEBKIT SVG RENDERING</div>
          </div>

          <div className="absolute top-2.5 right-2.5 font-mono text-[9px] text-slate-500 flex items-center gap-1.5 uppercase">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            <span>LIDAR Telemetry feeds</span>
          </div>

          {/* Isometric SVG Map of Tata Steel Mill */}
          <svg className="w-full h-full max-w-[550px] cursor-crosshair select-none" viewBox="0 0 500 280">
            {/* Ground Base grid lines inside SVG */}
            <g stroke="#334155" strokeWidth="0.5" opacity="0.3">
              <path d="M 50 140 L 450 140" />
              <path d="M 250 20 L 250 260" />
              <line x1="50" y1="60" x2="450" y2="220" />
              <line x1="50" y1="220" x2="450" y2="60" />
            </g>

            {/* FLOW PIPELINES (Glowing liquid steel gradient lines) */}
            <defs>
              <linearGradient id="moltenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path 
              d="M 100 190 L 180 120 L 260 170 L 350 100 L 430 150" 
              fill="none" 
              stroke="url(#moltenGrad)" 
              strokeWidth="3.5" 
              strokeDasharray="100"
              strokeDashoffset={-activeTime * 3}
              opacity={activeCam === "thermal" ? "1.0" : "0.7"}
            />

            {/* SUBSYSTEM 1: Coke Ovens & Compressors (Left Zone) */}
            <g onClick={() => setSelectedSubsystem("coke-gas")} className="cursor-pointer group">
              <polygon 
                points="70,165 110,145 150,165 110,185" 
                fill={selectedSubsystem === "coke-gas" ? "#1e1b4b" : "#0f172a"}
                stroke={selectedSubsystem === "coke-gas" ? "#6366f1" : "#475569"} 
                strokeWidth="1.5"
                className="transition"
              />
              {/* Vertical Compressor Cylinder columns */}
              <rect x="90" y="125" width="12" height="30" fill="#334155" stroke="#475569" strokeWidth="1" />
              <rect x="110" y="132" width="12" height="23" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <circle cx="96" cy="120" r="4" fill="#38bdf8" className="animate-pulse" />
              <text x="110" y="195" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">ZONE Utilities #3</text>
            </g>

            {/* SUBSYSTEM 2: Blast Furnace thermal Stack (Center Left Column) */}
            <g onClick={() => setSelectedSubsystem("blast-furnace")} className="cursor-pointer group">
              {/* Lower Foundation */}
              <polygon 
                points="155,120 205,100 255,120 205,140" 
                fill={selectedSubsystem === "blast-furnace" ? "#1e1b4b" : "#0f172a"}
                stroke={selectedSubsystem === "blast-furnace" ? "#6366f1" : "#475569"} 
                strokeWidth="1.5"
              />
              {/* Main smelting stack cone */}
              <path 
                d="M 180 110 L 200 40 L 210 40 L 230 110 Z" 
                fill={activeCam === "thermal" ? "url(#moltenGrad)" : "#1e293b"} 
                stroke="#64748b" 
                strokeWidth="1.5"
              />
              {/* Hot Stove tubes */}
              <rect x="172" y="70" width="8" height="40" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <rect x="230" y="70" width="8" height="40" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              {/* Flames on top indicating smelting gases burning */}
              <polygon points="201,36 205,25 209,36" fill="#f43f5e" className="animate-bounce" />
              <polygon points="204,36 207,28 210,36" fill="#fb923c" className="animate-pulse" />
              <text x="205" y="150" textAnchor="middle" fill="#f1f5f9" fontSize="8" fontFamily="monospace" fontWeight="bold">BF-04 CORE</text>
            </g>

            {/* SUBSYSTEM 3: Continuous Caster segments (Center Zone) */}
            <g onClick={() => setSelectedSubsystem("continuous-caster")} className="cursor-pointer group">
              <polygon 
                points="270,150 315,130 360,150 315,170" 
                fill={selectedSubsystem === "continuous-caster" ? "#1e1b4b" : "#0f172a"}
                stroke={selectedSubsystem === "continuous-caster" ? "#6366f1" : "#475569"} 
                strokeWidth="1.5"
              />
              {/* Solidifying rollers */}
              <line x1="290" y1="140" x2="340" y2="140" stroke="#94a3b8" strokeWidth="3" strokeDasharray="3,3" className="animate-spin-slow" />
              <line x1="295" y1="150" x2="345" y2="150" stroke="#f59e0b" strokeWidth="2.5" />
              <text x="315" y="180" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">CASTER SEG #12</text>
            </g>

            {/* SUBSYSTEM 4: Hot Strip Rolling Finishing Mill (Right Zone) */}
            <g onClick={() => setSelectedSubsystem("strip-mill")} className="cursor-pointer group">
              <polygon 
                points="365,115 415,95 465,115 415,135" 
                fill={selectedSubsystem === "strip-mill" ? "#1e1b4b" : "#0f172a"}
                stroke={selectedSubsystem === "strip-mill" ? "#6366f1" : "#475569"} 
                strokeWidth="1.5"
              />
              {/* Massive Roller stands */}
              <circle cx="395" cy="85" r="14" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              <circle cx="395" cy="85" r="9" fill="#1e293b" />
              {/* Rotating lines */}
              <line x1="395" y1="71" x2="395" y2="99" stroke="#334155" strokeWidth="1" transform={`rotate(${activeTime * 4}, 395, 85)`} />
              
              <circle cx="435" cy="90" r="14" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              <circle cx="435" cy="90" r="9" fill="#1e293b" />
              <line x1="435" y1="76" x2="435" y2="104" stroke="#334155" strokeWidth="1" transform={`rotate(${activeTime * 4}, 435, 90)`} />
              
              <text x="415" y="145" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">HS MILL ROLLS</text>
            </g>

            {/* SENSOR SIGNAL INDICATOR DOTS WITH ACCELERATING STATUS ACCENTS */}
            {sensors.map((sensor) => {
              const ringColor = sensor.riskStatus === "critical" 
                ? "stroke-rose-500 animate-ping text-rose-500" 
                : sensor.riskStatus === "warning" 
                  ? "stroke-amber-400 animate-pulse text-amber-500" 
                  : "stroke-emerald-400 text-emerald-500";
              
              return (
                <g key={sensor.id} className="cursor-pointer">
                  <circle 
                    cx={`${sensor.position.x}%`} 
                    cy={`${sensor.position.y}%`} 
                    r="8;" 
                    fill="#0f172a" 
                    className="stroke-slate-500"
                    strokeWidth="1"
                  />
                  <circle 
                    cx={`${sensor.position.x}%`} 
                    cy={`${sensor.position.y}%`} 
                    r="5" 
                    fill="currentColor" 
                    className={ringColor}
                  />
                  {/* Miniature sensor code tags */}
                  <text 
                    x={`${sensor.position.x + 2.5}%`} 
                    y={`${sensor.position.y - 1.5}%`} 
                    fill="#94a3b8" 
                    fontSize="7" 
                    fontWeight="bold" 
                    fontFamily="monospace"
                  >
                    {sensor.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* RIGHT LAYER: Subsystem Diagnostics & Predictive Delta intelligence Inspector */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col justify-between space-y-4">
          
          <div className="space-y-3 font-sans">
            <div>
              <span className="text-[8.5px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-900 font-extrabold uppercase">
                Twin Segment Diagnostics
              </span>
              <h5 className="text-xs font-black text-white mt-1 border-b border-slate-900 pb-1 uppercase tracking-tight">
                {selectedSubsystem === "blast-furnace" && "Blast Furnace Stack #4 Area"}
                {selectedSubsystem === "coke-gas" && "COGC Gas Compressor Cylinder Utilities"}
                {selectedSubsystem === "continuous-caster" && "Continuous Caster Mould Oscillation"}
                {selectedSubsystem === "strip-mill" && "Work Rolls Finishing Stage"}
              </h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                {selectedSubsystem === "blast-furnace" && "Critical thermal vessel refining pig iron ore. Connected to COG distribution stoves for hot gas blast feeds."}
                {selectedSubsystem === "coke-gas" && "Supplies fuel gas back to the sintering ignition hoods. Outliers impact ignition ratios inside 12 minutes."}
                {selectedSubsystem === "continuous-caster" && "Orchestrates mould mechanical alignment. Highly prone to bearing play and thermal lockouts if lubricants age."}
                {selectedSubsystem === "strip-mill" && "Finishing mills reducing slab material thicknesses. Heavy motor mechanical strain triggers load delays."}
              </p>
            </div>

            {/* Live Telemetry delta readings (Rate of change of rate of change) */}
            <div className="space-y-2.5">
              <span className="text-[8.5px] font-mono text-indigo-300 font-extrabold uppercase tracking-widest block">
                Acceleration Deltas (Delta-Intelligence)
              </span>

              {sensors.filter(s => {
                if (selectedSubsystem === "blast-furnace") return s.id === "BF-T4";
                if (selectedSubsystem === "coke-gas") return s.id === "GC-V3";
                if (selectedSubsystem === "continuous-caster") return s.id === "CC-M12";
                return s.id === "HSM-B9";
              }).map((sens) => {
                const statusBorder = sens.riskStatus === "critical" 
                  ? "border-rose-900 bg-rose-950/15" 
                  : sens.riskStatus === "warning" 
                    ? "border-amber-900 bg-amber-950/15" 
                    : "border-emerald-900 bg-emerald-950/15";

                const accText = sens.riskStatus === "critical" 
                  ? "text-rose-400 font-extrabold animate-pulse" 
                  : sens.riskStatus === "warning" 
                    ? "text-amber-400" 
                    : "text-emerald-400";

                return (
                  <div key={sens.id} className={`p-3 border rounded-lg ${statusBorder} space-y-1.5 font-mono text-[10.5px]`}>
                    <div className="flex justify-between font-bold border-b border-slate-900 pb-1">
                      <span className="text-white">{sens.name}</span>
                      <span className="text-indigo-400">{sens.id}</span>
                    </div>
                    
                    <div className="flex justify-between text-slate-400">
                      <span>Value Sensor:</span>
                      <strong className="text-white font-bold">{sens.value} {sens.unit}</strong>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>First Derivative (Velocity):</span>
                      <span className="text-indigo-300 font-bold">{sens.deltaRate}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Second Derivative (Accel):</span>
                      <span className={accText}>{sens.acceleration}</span>
                    </div>

                    {sens.riskStatus === "critical" && (
                      <div className="text-[8.5px] font-serif text-rose-300 bg-rose-950/60 p-1.5 rounded-md leading-normal italic font-sans flex items-start gap-1">
                        <span className="text-[10px] shrink-0 font-bold">⚠️</span>
                        <span>
                          <b>CRITICAL ACCELERATION SHOCK:</b> Log shows exponential drift in compressor rotors. Emergency automatic lubrication scheduled or shutoff backup cycles engaged.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          <div className="pt-2 border-t border-slate-850 text-[8.5px] font-mono text-indigo-400 leading-normal">
            🛡️ Cognitive Twin utilizes structural mesh alignment to predict physical bearing wear parameters 2 hours before standard SCADA alerts threshold.
          </div>

        </div>

      </div>

    </div>
  );
}
