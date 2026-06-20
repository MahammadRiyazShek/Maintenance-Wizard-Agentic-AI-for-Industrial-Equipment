import React, { useState, useEffect } from "react";
import { Asset } from "../types.ts";
import { 
  Zap, 
  Cpu, 
  HelpCircle, 
  TrendingDown, 
  Activity, 
  Flame, 
  Sparkles,
  RefreshCw,
  Compass,
  Smile,
  Frown,
  CheckCircle2,
  FileText
} from "lucide-react";

interface SandboxSimulatorProps {
  asset: Asset | null;
  onApplySimulatedTelemetry?: (assetId: string, telemetry: { temperature: number; vibration: number; pressure: number }) => void;
}

export default function SandboxSimulator({ asset, onApplySimulatedTelemetry }: SandboxSimulatorProps) {
  if (!asset) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm h-full flex flex-col justify-center items-center">
        <Compass className="h-10 w-10 text-slate-300 animate-spin-slow mb-2" />
        <p className="text-xs text-slate-500 font-sans">
          Select an active control room asset node to boot the Fatigue Engineering Twin.
        </p>
      </div>
    );
  }

  // Operating variables for What-If Co-Simulation
  const [operatingSpeed, setOperatingSpeed] = useState<number>(100); // 50% - 150% (Nominal is 100%)
  const [coolantPressure, setCoolantPressure] = useState<number>(5.0); // 1.0 - 10.0 bar (Nominal is 5.0)
  const [loadFactor, setLoadFactor] = useState<number>(100); // 50% - 150% (Nominal is 100%)
  const [greaseFlushSim, setGreaseFlushSim] = useState<boolean>(false);

  // Auto reset sliders when asset changes
  useEffect(() => {
    setOperatingSpeed(100);
    setCoolantPressure(asset.id === "bf-04" ? 4.8 : 5.0);
    setLoadFactor(100);
    setGreaseFlushSim(false);
  }, [asset.id]);

  // Physics-based wear propagation calculations (Paris-Erdogan and Arrhenius approximations)
  const calculateSimulatedMetrics = () => {
    const baseTemp = asset.telemetry.temperature;
    const baseVib = asset.telemetry.vibration;
    const basePress = asset.telemetry.pressure;

    // Linear/Exponential thermal and load scaling coefficients
    const speedRatio = operatingSpeed / 100;
    const loadRatio = loadFactor / 100;
    const pressureCoolingCoeff = Math.max(0.1, 12 - coolantPressure) / 7; // Lower pressure = less cooling

    let simulatedTemp = baseTemp;
    let simulatedVib = baseVib;
    let simulatedPress = basePress;

    if (asset.id === "bf-04") {
      // Tuyere Thermal / Gas Path model
      simulatedTemp = Math.floor(baseTemp * speedRatio * 1.05 * pressureCoolingCoeff);
      simulatedPress = Number((basePress * speedRatio * 0.95).toFixed(1));
      simulatedVib = Number((baseVib * speedRatio * loadRatio).toFixed(1));
    } else if (asset.id === "cc-02") {
      // Caster Mould Oscillator model
      simulatedVib = Number((baseVib * Math.pow(speedRatio, 1.8) * loadRatio * (greaseFlushSim ? 0.6 : 1.0)).toFixed(1));
      simulatedTemp = Math.floor(baseTemp * speedRatio * 1.08);
      simulatedPress = Number((basePress * loadRatio).toFixed(0));
    } else if (asset.id === "hsm-01") {
      // Roughing Rolling stand work rolls model
      simulatedTemp = Math.floor(baseTemp * loadRatio * 1.15 * speedRatio);
      simulatedVib = Number((baseVib * loadRatio * 1.25).toFixed(1));
      simulatedPress = Number((basePress * loadRatio).toFixed(0));
    } else {
      // Coke Oven compressor rotor
      simulatedVib = Number((baseVib * speedRatio * 1.1).toFixed(1));
      simulatedTemp = Math.floor(baseTemp * speedRatio);
      simulatedPress = Number((basePress * speedRatio * pressureCoolingCoeff).toFixed(1));
    }

    // Safety clamps
    simulatedTemp = Math.max(15, simulatedTemp);
    simulatedVib = Math.max(0.1, simulatedVib);
    simulatedPress = Math.max(0.1, simulatedPress);

    // Calculate simulated Wear Factor (%)
    // Mechanical wear of the bearing/assembly progresses proportionally to thermal (Arrhenius) and vibration limits
    const tempRatio = simulatedTemp / asset.telemetry.temperatureLimit;
    const vibRatio = simulatedVib / asset.telemetry.vibrationLimit;
    
    // Combining thermal stress + vibration stress to calculate physical load metric
    const fatigueLoad = Math.min(100, Math.floor(((tempRatio * 0.4) + (vibRatio * 0.6)) * 100 * (greaseFlushSim ? 0.75 : 1.0)));

    // Calculate predictive useful life curves:
    // Safe remaining operating hours diminishes exponentially as load is applied
    const normalMaxHours = asset.id === "bf-04" ? 2200 : asset.id === "cc-02" ? 1800 : asset.id === "hsm-01" ? 480 : 4500;
    const effectiveWearRate = Math.max(0.2, (fatigueLoad / 40) * (speedRatio * 1.2));
    const simulatedRulHours = Math.max(0, Math.floor(normalMaxHours / (effectiveWearRate * 2)));

    // Risk Classification based on calculated Wear Factor
    let predictedRisk: "Nominal" | "Warning" | "Critical" = "Nominal";
    if (fatigueLoad > 80 || simulatedTemp > asset.telemetry.temperatureLimit || simulatedVib > asset.telemetry.vibrationLimit) {
      predictedRisk = "Critical";
    } else if (fatigueLoad > 55) {
      predictedRisk = "Warning";
    }

    // Real dynamic MPI for What-If parameters
    let critValue = 30;
    if (asset.processCriticality === "Critical") critValue = 100;
    else if (asset.processCriticality === "High") critValue = 80;
    else if (asset.processCriticality === "Medium") critValue = 50;

    const penaltyRank = Math.min(100, Math.round((asset.delayCostPerHour / 22000) * 100));
    
    // Combining Criticality 35%, simulated thermal-vibratory wear 40%, and lost production penalty 25%
    const simulatedMPI = Math.min(100, Math.round((critValue * 0.35) + (fatigueLoad * 0.40) + (penaltyRank * 0.25)));

    return {
      simulatedTemp,
      simulatedVib,
      simulatedPress,
      fatigueLoad,
      simulatedRulHours,
      predictedRisk,
      simulatedMPI
    };
  };

  const sims = calculateSimulatedMetrics();

  // Draw simulated wear curves
  const generateCurvePoints = () => {
    const points = [];
    // Model wear degradation curve: Wear(t) = base_wear + fatigue_growth * t^2
    const growthCoeff = sims.fatigueLoad / 100;
    for (let t = 0; t <= 10; t++) {
      const x = (t / 10) * 160; 
      const wearY = 100 - (t * t * growthCoeff * 0.95); // 100 is top (healthy), degrades downwards
      points.push(`${x},${Math.max(5, Math.min(100, wearY))}`);
    }
    return points.join(" ");
  };

  const handleApplyToControlRoom = () => {
    if (onApplySimulatedTelemetry) {
      onApplySimulatedTelemetry(asset.id, {
        temperature: sims.simulatedTemp,
        vibration: sims.simulatedVib,
        pressure: sims.simulatedPress
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-5">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Cpu className="h-4 w-4 text-indigo-600 animate-spin-slow" />
            <span>Co-Simulation Engineering Sandbox</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">
            Proactive "What-If" Cyber-Physical Stress Modeling • Asset: {asset.id.toUpperCase()}
          </p>
        </div>
        <span className="text-[9px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full border border-slate-200">
          Paris-Refractory Coeff: 1.48
        </span>
      </div>

      {/* Slide Controllers */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
        <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider font-mono">
          Adjust Operating Stress Variables
        </h4>

        {/* Slider 1: Speed */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-slate-600">
              {asset.id === "bf-04" ? "Oxygen Blast Volume (Flow Rate)" : "Generator/Rotor Kinematic RPM"}
            </span>
            <span className="font-bold text-slate-800">{operatingSpeed}%</span>
          </div>
          <input 
            type="range"
            min="50"
            max="150"
            value={operatingSpeed}
            onChange={(e) => setOperatingSpeed(Number(e.target.value))}
            className="w-full accent-indigo-600 hover:cursor-pointer"
          />
          <div className="flex justify-between text-[8.5px] text-slate-400 font-mono">
            <span>50% (Eco/Idle)</span>
            <span>100% (Nominal)</span>
            <span>150% (Max Throughput)</span>
          </div>
        </div>

        {/* Slider 2: Coolant Pressure */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-slate-600">Coolant Water Back-Pressure / Purge</span>
            <span className="font-bold text-slate-800">{coolantPressure} bar</span>
          </div>
          <input 
            type="range"
            min="1.0"
            max="10.0"
            step="0.1"
            value={coolantPressure}
            onChange={(e) => setCoolantPressure(Number(e.target.value))}
            className="w-full accent-indigo-600 hover:cursor-pointer"
          />
          <div className="flex justify-between text-[8.5px] text-slate-400 font-mono">
            <span>1.0 bar (Choked Flow)</span>
            <span>5.0 bar (Nominal)</span>
            <span>10.0 bar (Peak Flush)</span>
          </div>
        </div>

        {/* Slider 3: Mechanical Load */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[10.5px]">
            <span className="text-slate-600">Dynamic Shear Load Coeff (Slab Force)</span>
            <span className="font-bold text-slate-800">{loadFactor}%</span>
          </div>
          <input 
            type="range"
            min="50"
            max="150"
            value={loadFactor}
            onChange={(e) => setLoadFactor(Number(e.target.value))}
            className="w-full accent-indigo-600 hover:cursor-pointer"
          />
          <div className="flex justify-between text-[8.5px] text-slate-400 font-mono">
            <span>50% (Underload)</span>
            <span>100% (Nominal)</span>
            <span>150% (Overload Force)</span>
          </div>
        </div>

        {/* Bonus Toggle for Lubricant */}
        {asset.id === "cc-02" && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
            <span className="font-mono text-slate-600 text-[10.5px]">Force Manual Grease Viscosity Flush</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={greaseFlushSim}
                onChange={() => setGreaseFlushSim(!greaseFlushSim)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        )}
      </div>

      {/* Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Graph display */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-400">Physical Fatigue Decay Curve</span>
            <span className={`text-[10px] font-mono font-bold tracking-wide ${
              sims.predictedRisk === "Critical" ? "text-rose-400 animate-pulse" : sims.predictedRisk === "Warning" ? "text-amber-400" : "text-emerald-400"
            }`}>
              {sims.predictedRisk.toUpperCase()} RISK
            </span>
          </div>

          {/* SVG Line representation of wear decay */}
          <div className="h-24 w-full flex items-center justify-center relative mt-2 border-b border-l border-slate-800">
            <div className="absolute top-1.5 left-2 text-[8px] font-mono text-slate-500">Wear Cap</div>
            <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-500">Time → (SOP Changeover)</div>
            
            <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
              {/* Grids */}
              <line x1="0" y1="24" x2="160" y2="24" stroke="#1e293b" strokeWidth="1" strokeDasharray="2" />
              <line x1="0" y1="48" x2="160" y2="48" stroke="#1e293b" strokeWidth="1" strokeDasharray="2" />
              <line x1="0" y1="72" x2="160" y2="72" stroke="#1e293b" strokeWidth="1" strokeDasharray="2" />

              {/* Stress Line */}
              <polyline
                fill="none"
                stroke={sims.predictedRisk === "Critical" ? "#f43f5e" : sims.predictedRisk === "Warning" ? "#f59e0b" : "#10b981"}
                strokeWidth="2.5"
                points={generateCurvePoints()}
              />
            </svg>
          </div>

          <div className="mt-2 flex justify-between text-[9px] font-mono text-slate-400">
            <span>Estimated Stress Load:</span>
            <span className="font-extrabold text-white text-xs">{sims.fatigueLoad}%</span>
          </div>
        </div>
        <div className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-white text-xs space-y-3">
          <div className="space-y-2.5">
            <span className="text-[9px] font-mono uppercase text-indigo-600 block font-bold tracking-wider">Simulated Output Telemetry</span>
            
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Est. Body Temp</span>
              <span className={`font-mono font-bold ${sims.simulatedTemp > asset.telemetry.temperatureLimit ? "text-rose-600 animate-pulse font-extrabold" : "text-slate-800"}`}>
                {sims.simulatedTemp}{asset.telemetry.temperatureUnit}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Est. Mechanical Vib</span>
              <span className={`font-mono font-bold ${sims.simulatedVib > asset.telemetry.vibrationLimit ? "text-rose-600 font-extrabold" : "text-slate-800"}`}>
                {sims.simulatedVib} mm/s
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Predicted Safe RUL</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                ~{sims.simulatedRulHours} Hours
              </span>
            </div>

            {/* LIVE DYNAMIC MAINTENANCE PRIORITY INDEX ENERGETIC INTEGRATION */}
            <div className="border-t border-slate-200 pt-3 mt-1.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-mono uppercase text-indigo-600 font-bold tracking-wider">Live Sim MPI Score</span>
                <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                  {sims.simulatedMPI} / 100
                </span>
              </div>

              {/* Progress dynamic slice */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    sims.simulatedMPI >= 70 
                      ? "bg-rose-500" 
                      : sims.simulatedMPI >= 45 
                        ? "bg-amber-500" 
                        : "bg-emerald-500"
                  }`} 
                  style={{ width: `${sims.simulatedMPI}%` }}
                ></div>
              </div>

              {/* Smart Directive AI Coprocessor Dispatch Box */}
              <div className={`p-2 rounded-lg border text-[10px] leading-relaxed ${
                sims.simulatedMPI >= 70
                  ? "bg-rose-50 border-rose-150 text-rose-800"
                  : sims.simulatedMPI >= 45
                    ? "bg-amber-50 border-amber-150 text-amber-800"
                    : "bg-emerald-50 border-emerald-150 text-emerald-800"
              }`}>
                <div className="font-bold uppercase tracking-wide flex items-center gap-1 mb-0.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    sims.simulatedMPI >= 70 ? "bg-rose-500 animate-ping" : sims.simulatedMPI >= 45 ? "bg-amber-500" : "bg-emerald-500"
                  }`}></span>
                  <span>
                    {sims.simulatedMPI >= 70
                      ? "Emergency Dispatch Directive"
                      : sims.simulatedMPI >= 45
                        ? "Run to Scheduled Shutdown"
                        : "Nominal Operations (Optimal)"
                    }
                  </span>
                </div>
                <p className="font-sans">
                  {sims.simulatedMPI >= 70
                    ? `Risk threshold violated at ${sims.simulatedMPI} MPI. Restrict process rollers speed, increase coolant flow above 8 bar, and dispatch emergency shift crew.`
                    : sims.simulatedMPI >= 45
                      ? "Fatigue load buffer stabilized. Activate supplementary grease-purging schedules to bridge operations until upcoming planned turn."
                      : "Operating within safe physical parameters. Maintain standard autonomous supervision and complete scheduled weekend inspections."
                  }
                </p>
              </div>

            </div>
          </div>

          {/* Action to synchronize with app state */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-apply-whatif-telemetry"
              onClick={handleApplyToControlRoom}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-mono font-bold hover:bg-indigo-700 transition text-[10.5px] cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="h-3 w-3 animate-spin-slow text-indigo-200" />
              <span>Override Virtual Control Room Telemetry</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
