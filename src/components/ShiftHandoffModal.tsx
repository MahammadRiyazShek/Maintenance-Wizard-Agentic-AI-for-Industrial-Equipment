import React, { useState } from "react";
import { Asset, ControlRoomAlert, LogbookEntry } from "../types.ts";
import { 
  FileText, 
  Printer, 
  Copy, 
  X, 
  ShieldAlert, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Flame,
  User,
  Clock,
  Sparkles,
  Zap
} from "lucide-react";

interface ShiftHandoffModalProps {
  assets: Asset[];
  alerts: ControlRoomAlert[];
  logbook: LogbookEntry[];
}

export default function ShiftHandoffModal({ assets, alerts, logbook }: ShiftHandoffModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Statistics calculation for the current 12-hour shift block
  const stats = {
    total: assets.length,
    critical: assets.filter(a => a.status === "Critical").length,
    warning: assets.filter(a => a.status === "Warning").length,
    healthy: assets.filter(a => a.status === "Healthy").length,
    unackAlerts: alerts.filter(a => a.status === "Unacknowledged").length,
    totalLossCascade: assets.reduce((sum, a) => {
      if (a.status === "Critical") return sum + a.delayCostPerHour;
      if (a.status === "Warning") return sum + (a.delayCostPerHour * 0.3);
      return sum;
    }, 0)
  };

  const currentShiftLogs = logbook.slice(0, 5); // Fetch recent actions logged during this shift

  const generateReportText = () => {
    return `================================================================================
TATA STEEL INTEGRATED OPERATIONS - CONSOLIDATED SHIFT METALLURGY DIGEST
SHIFT ID: TS-JSD-${new Date().toISOString().substring(0,10)}-SH1
GENERATED ON: ${new Date().toUTCString()}
STATUS: COMPLETED WITH SYSTEM INTELLIGENCE SUPPORT
================================================================================

1. PLANT RISK STATUS SUMMATION
--------------------------------------------------
- Total Supervised Asset Nodes : ${stats.total}
- CRITICAL Status Interruptions : ${stats.critical}
- WARNING Wear Degradations     : ${stats.warning}
- HEALTHY/NOMINAL Operations    : ${stats.healthy}
- Unresolved Control Room Alerts: ${stats.unackAlerts}
- Estimated Active Downtime Loss: $${stats.totalLossCascade.toLocaleString()}/Hr

2. ASSET SPECIFIC METRICS SUMMARY
--------------------------------------------------
${assets.map(a => `• Asset ID: ${a.id.toUpperCase()} - ${a.name}
  - Area Context: ${a.area}
  - Technical Health: [${a.status.toUpperCase()}]
  - Telemetry: Temp: ${a.telemetry.temperature}${a.telemetry.temperatureUnit} | Vib: ${a.telemetry.vibration} mm/s | Pres: ${a.telemetry.pressure} bar`).join("\n\n")}

3. COMPLETED MAINTENANCE OPERATIONS LOG
--------------------------------------------------
${currentShiftLogs.length === 0 
  ? " - No physical logs logged during this 12-hour shift window yet."
  : currentShiftLogs.map((log, i) => `[Action #${i+1}] ${log.timestamp.substring(11, 16)} UTC • Asset: ${log.assetName}
  - Authorized Engineer: ${log.engineerName}
  - Action taken: ${log.actionTaken}
  - Status: ${log.status.toUpperCase()}`).join("\n\n")}

4. IMMEDIATE COMMAND STRATEGIC ALIGNMENTS
--------------------------------------------------
${stats.critical > 0 
  ? `CRITICAL RISK WARNING OVERVIEW:
Our ironmaking or steelmaking flowline is currently bottlenecked by ${stats.critical} active asset interruptions. Downstream starvation is imminent in the rolling mills group. Allocate senior crews for immediate cooling water purge and backpulsing SOP alignment.`
  : "NOMINAL HANDOFF LEVEL: No immediate critical bottleneck is propagating. Maintain regular standard thermo-vibrational auditing schedules."}

--------------------------------------------------
Logged by Integrated Operations Control Room Coordinator
Tata Steel AI-Wizard Enterprise Dispatch Integration
================================================================================`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tata Steel Consolidated Handoff Report</title>
            <style>
              body { font-family: 'Courier New', monospace; line-height: 1.4; padding: 25px; color: #1e293b; background: #fff; }
              pre { white-space: pre-wrap; font-size: 13px; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <pre>${generateReportText().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        id="btn-trigger-handoff-modal"
        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
      >
        <FileText className="h-4 w-4 animate-pulse text-blue-100" />
        <span>Generate Handoff Digest</span>
      </button>

      {/* Modal Popup overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-feed">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal header bar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="font-sans font-extrabold text-sm uppercase tracking-wide">
                  Autonomous Shift Hand-Off Digest
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <p className="text-slate-500 leading-normal font-sans">
                Below is the consolidated operating report aggregating active plant stress levels, documented workforce repairs, and estimated downtime loss cascades. Export or copy this report for shift huddles or plant ERP integration.
              </p>

              {/* Graphical mini stats card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Critical Disrupt</span>
                  <span className={`text-sm font-extrabold block mt-0.5 ${stats.critical > 0 ? "text-rose-600 font-extrabold animate-pulse" : "text-emerald-600"}`}>
                    {stats.critical}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Active Warnings</span>
                  <span className={`text-sm font-extrabold block mt-0.5 ${stats.warning > 0 ? "text-amber-600" : "text-slate-600"}`}>
                    {stats.warning}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Unack Alarms</span>
                  <span className="text-sm font-extrabold text-blue-600 block mt-0.5">
                    {stats.unackAlerts}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase">Hourly Delay Cost</span>
                  <span className={`text-sm font-extrabold block mt-0.5 ${stats.totalLossCascade > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ${stats.totalLossCascade.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Raw printable text prebox */}
              <div className="relative">
                <pre className="bg-slate-950 text-slate-250 border border-slate-800 rounded-xl p-4 font-mono text-[9px] leading-relaxed overflow-x-auto whitespace-pre select-all max-h-[38vh]">
                  {generateReportText()}
                </pre>
                
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    onClick={handleCopyText}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wide border flex items-center gap-1.5 transition ${
                      copied 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
                    }`}
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copied ? "Copied!" : "Copy Raw"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wide inline-flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="h-3 w-3" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-50 px-4 md:px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Report Dossier
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
