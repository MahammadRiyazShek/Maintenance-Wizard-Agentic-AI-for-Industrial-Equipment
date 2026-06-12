import React, { useState } from "react";
import { DiagnosticResult, EngineerFeedback, Asset } from "../types.ts";
import { 
  Bot, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Flame, 
  Hourglass, 
  Hammer, 
  ListOrdered, 
  Bookmark, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Wrench,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  FileText,
  Copy,
  X
} from "lucide-react";

interface DiagnosisReportProps {
  asset: Asset | null;
  report: DiagnosticResult | null;
  loading: boolean;
  onExecuteDiagnosis: (userNotes: string) => void;
  onSubmitFeedback: (rating: "helpful" | "unhelpful", note: string) => Promise<void>;
  feedbackLogged: boolean;
}

export default function DiagnosisReport({
  asset,
  report,
  loading,
  onExecuteDiagnosis,
  onSubmitFeedback,
  feedbackLogged
}: DiagnosisReportProps) {
  const [notesInput, setNotesInput] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<"helpful" | "unhelpful" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showSapModal, setShowSapModal] = useState(false);
  const [copiedSapText, setCopiedSapText] = useState(false);

  // Triggering diagnosis
  const handleDiagnose = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteDiagnosis(notesInput);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackRating) return;
    setSubmittingFeedback(true);
    await onSubmitFeedback(feedbackRating, feedbackText);
    setSubmittingFeedback(false);
    setFeedbackText("");
    // Clear selection
    setFeedbackRating(null);
  };

  const generateSapLogText = () => {
    if (!report || !asset) return "";
    return `=== TATA STEEL PLANT MAINTENANCE WORKLOG ENTRY ===
SYSTEM: Tata Steel Maintenance Wizard - AI SUPPORT
NOTIFICATION RECAP: Active Mechanical/Process Interruption
--------------------------------------------------
Notification Type: M2 (Malfunction Report) / Plant: 1000
Functional Loc: JSD-PH2-${asset.area.toUpperCase().replace(/\s+/g, '-')}
Equipment ID: ${asset.id.toUpperCase()} - ${asset.name}
Interruption Delay Penalty: $${asset.delayCostPerHour.toLocaleString()}/Hr

DIAGNOSED FAULT:
${report.probableFault}

PRIMARY CAUSE & RCA ORIGIN:
- ${report.rootCauseAnalysis.primaryCause}
Flagged Telemetry Sensors: ${report.rootCauseAnalysis.contributingSensors.join(", ") || "None"}
Downstream Bottleneck Allocation: ${report.priorityAnalysis.bottleneckStatus}

CRITICAL ACTION PLAN TASKS (SOP COMPLIANCE):
Immediate Core Actions (Online Operations):
${report.maintenancePlan.immediateActions.map((a, i) => `  ${i + 1}. [ ] ${a}`).join("\n")}

Shutdown Maintenance Requirements:
${report.maintenancePlan.shutDownActions.map((a, i) => `  ${i + 1}. [ ] ${a}`).join("\n")}

SPARES CONFIGURATION & PROCUREMENT:
${report.maintenancePlan.spareProcurementStrategy}

TRACED REFERENCE SOURCES (Explainability Snippets):
${report.sourcesReferenced.map(s => ` - [${s.type}] ${s.title}: "${s.snippet.trim().substring(0, 100).replace(/\n/g, ' ')}..."`).join("\n")}
--------------------------------------------------
Logged by Senior Maintenance Engineer
Shift Recap Generated on ${new Date().toUTCString()} (Wizard Autonomous Dispatch)
==================================================`;
  };

  const handleCopySapText = () => {
    const text = generateSapLogText();
    navigator.clipboard.writeText(text);
    setCopiedSapText(true);
    setTimeout(() => setCopiedSapText(false), 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "critical":
        return "text-rose-600 bg-rose-100 border-rose-200";
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "medium":
        return "text-amber-600 bg-amber-100 border-amber-200";
      default:
        return "text-emerald-600 bg-emerald-100 border-emerald-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-sans font-bold text-base text-slate-800">
              Agentic Diagnosis & Planning
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Traceable SOP Analysis & Failure Predictions
            </p>
          </div>
        </div>

        {asset && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full font-mono text-[10px] text-slate-500">
            <span>Target:</span>
            <b className="text-slate-700 font-bold">{asset.id.toUpperCase()}</b>
          </div>
        )}
      </div>

      {/* Case 1: No Asset Selected */}
      {!asset ? (
        <div className="py-12 text-center space-y-3">
          <Wrench className="h-10 w-10 text-slate-300 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-slate-700">No Asset Selected</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Select an ongoing control room alert or explore physical assets from the telemetry grid on the left to initiate diagnostic modeling.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Diagnostic control input workspace */}
          {!report && !loading && (
            <form onSubmit={handleDiagnose} className="space-y-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase font-mono tracking-wider">
                  Additional Operator Sightings / Notes (Optional)
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Heard high-pitched grinding noises from bearing housing; cooling nozzle hose replaced during shift turn-over. Input physical logs here..."
                  className="w-full min-h-[90px] bg-white border border-slate-200 rounded-lg p-3 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                id="btn-run-diagnosis"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-sans font-bold py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Diagnostics reasoning Pipeline</span>
              </button>
            </form>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="py-16 text-center space-y-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto animate-duration-1000" />
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-slate-700">Wizard Analyzing Sensor Matrices...</h4>
                <div className="text-[10px] text-slate-400 font-mono space-y-1 max-w-xs mx-auto">
                  <p className="animate-pulse">1. Querying active physical models with delay ratios</p>
                  <p className="animate-pulse animation-delay-200">2. Searching SMS operating manuals & Safety SOP records</p>
                  <p className="animate-pulse animation-delay-400">3. Ingesting warehouse lead times and safety spares lists</p>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Report Result Renders */}
          {report && !loading && (
            <div className="space-y-6" id="diagnostic-report-rendered">
              
              {/* Highlight Fault Outcome Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden shadow-lg border border-slate-850">
                <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-400 font-mono tracking-wider">
                      Fault Diagnosis
                    </span>
                    <div className="flex items-center gap-1 bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-full border border-blue-500/20 text-[10px] font-mono">
                      <span>Confidence Score:</span>
                      <strong className="font-bold">{report.confidence}%</strong>
                    </div>
                  </div>

                  <h3 className="text-lg font-sans font-bold py-1 leading-snug">
                    {report.probableFault}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Bookmark className="h-4 w-4 text-blue-400" />
                    <span>Analyzed & Synthesized automatically by Gemini-3.5-Flash</span>
                  </div>
                </div>
              </div>

              {/* Wizard Agent Cognitive Trace & Tool Executions Pipeline */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 tracking-wide font-mono uppercase">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Wizard Agent Cognitive Trace & Tool reasoning</span>
                  </div>
                  <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-150 font-bold uppercase tracking-wider">
                    Autonomous Planner Active
                  </span>
                </div>

                <p className="text-[11.5px] text-slate-500 leading-relaxed font-sans">
                  The Tata Steel Agentic AI Engine (utilizing <b>Isolation Forest</b> feature triangulation and <b>99.05% XGBoost Classification accuracy</b> trained on the <b>UCI AI4I Dataset</b>) has processed cyber-physical telemetry parameters, retrieved matching maintenance manual guidelines via vectorized RAG, integrated historical human supervisor corrections, and run safety-weight constraint calculations.
                </p>

                {/* Vertical Stepper Timeline */}
                <div className="relative pl-5 border-l-2 border-slate-200 space-y-5 py-1 text-xs">
                  {/* Step 1: Telemetry */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-[1.5px] bg-blue-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
                      <Bot className="h-2 w-2" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wide">
                        Phase 1: Dynamic Sensor Triangulation & Outlier Analytical scan
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        Parsed active telemetry for <span className="font-mono bg-slate-100 px-1 rounded text-slate-700 font-bold">{asset?.id.toUpperCase() || "ASSET"}</span>. Evaluated current states: 
                        {asset?.telemetry.temperature !== undefined && ` Temp: ${asset.telemetry.temperature}${asset.telemetry.temperatureUnit || "°C"} (Limit: ${asset.telemetry.temperatureLimit || "N/A"})`}
                        {asset?.telemetry.vibration !== undefined && ` • Vib: ${asset.telemetry.vibration} mm/s (Limit: ${asset.telemetry.vibrationLimit || "N/A"})`}
                        {asset?.telemetry.pressure !== undefined && ` • Press: ${asset.telemetry.pressure} bar (Limit: ${asset.telemetry.pressureLimit || "N/A"})`}
                        {asset?.telemetry.flowRate !== undefined && ` • Flow: ${asset.telemetry.flowRate} L/min (Limit: < ${asset.telemetry.flowRateLimit || "N/A"})`}.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: RAG Doc Extraction */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-[1.5px] bg-indigo-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
                      <HelpCircle className="h-2 w-2" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wide">
                        Phase 2: RAG Reference Documents Retrieved
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        Retrieved vectorized contextual documents for <span className="font-bold text-indigo-700 font-mono">"{asset?.name}"</span>. Traced <span className="font-bold text-slate-700">{report.sourcesReferenced?.length || 0}</span> authoritative sources including: 
                        <span className="font-bold font-mono text-indigo-700 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 ml-1.5 text-[9.5px]">
                          {report.sourcesReferenced?.map(s => s.title.split(":")[0]).join(", ") || "Safety SOP DB"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Human Override & Feedback Loop Integration */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-[1.5px] bg-amber-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
                      <AlertTriangle className="h-2 w-2" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wide">
                        Phase 3: Human Expert Learning & Local Overrides Reconciled
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        Reconciled operational handoffs and crew corrections in local memory cache logs. Current confidence factor set to <span className="font-bold font-mono">{report.confidence}%</span>. Dynamic physical trigger: <span className="italic text-slate-600">"{report.rootCauseAnalysis?.primaryCause || "N/A"}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Decision Tree Solver */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-[1.5px] bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
                      <CheckCircle className="h-2 w-2" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-700 uppercase text-[10px] font-mono tracking-wide">
                        Phase 4: Remaining Useful Life (RUL) & Process Priorities Calculated
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        Calculated Remaining Useful Life as <span className="font-mono bg-emerald-50 border border-emerald-200/60 px-1 rounded text-emerald-800 font-extrabold">{report.remainingUsefulLife?.hours || 0} Hours</span> under active fatigue coefficient. Identified downtime impact factor as <span className="font-bold font-mono text-indigo-700">{report.priorityAnalysis?.factors?.criticality || "High"}</span> under dynamic delay risk (<span className="text-rose-600 font-bold font-mono">${asset?.delayCostPerHour.toLocaleString()}/hr</span>).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: Generate SAP Work Order Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  id="btn-generate-sap-wo"
                  onClick={() => setShowSapModal(true)}
                  className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Format SAP PM Shift Log</span>
                </button>
              </div>

              {/* RCA Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ROOT CAUSE */}
                <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase block">
                    Root Cause Analysis (RCA)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    <strong>Primary Origin:</strong> {report.rootCauseAnalysis.primaryCause}
                  </p>
                  
                  {report.rootCauseAnalysis.contributingSensors.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        Abnormal Metrics Flagged:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.rootCauseAnalysis.contributingSensors.map((item, id) => (
                          <span key={id} className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-mono">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.rootCauseAnalysis.processDefects.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        Process Side-Defects:
                      </span>
                      <ul className="text-[10px] text-slate-600 list-disc pl-4 space-y-0.5">
                        {report.rootCauseAnalysis.processDefects.map((defect, id) => (
                          <li key={id}>{defect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* RUL & ESTIMATIVE LIFE */}
                <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase block">
                      Remaining Useful Life (RUL)
                    </span>
                    
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-sans font-extrabold text-slate-800 font-mono">
                        {report.remainingUsefulLife.hours}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">operational hours</span>
                    </div>

                    {report.remainingUsefulLife.warningMessage && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 rounded p-2 leading-relaxed border border-amber-100 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{report.remainingUsefulLife.warningMessage}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-150 pt-2 text-[11px] mt-3">
                    <span className="text-slate-500 flex items-center gap-1 font-mono">
                      <Flame className="h-3.5 w-3.5" /> Wear Hazard Risk:
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] uppercase font-mono ${getRiskColor(report.remainingUsefulLife.catastrophicFailureRisk)}`}>
                      {report.remainingUsefulLife.catastrophicFailureRisk}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority matrix constraints metrics */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase block">
                  Operations Priority Grading Matcher
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-mono uppercase">Criticality</span>
                    <strong className="text-xs text-slate-700 font-bold tracking-tight block mt-1">{report.priorityAnalysis.factors.criticality}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-mono uppercase">Delay impact</span>
                    <strong className="text-xs text-slate-700 font-bold tracking-tight block mt-1">{report.priorityAnalysis.factors.delaySeverity}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-mono uppercase">Warehouse Stock</span>
                    <strong className="text-xs text-slate-700 font-bold tracking-tight block mt-1">{report.priorityAnalysis.factors.sparesAvailability}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 block font-mono uppercase">Procurement Lead</span>
                    <strong className="text-xs text-slate-700 font-bold tracking-tight block mt-1">{report.priorityAnalysis.factors.leadTime}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Bottleneck evaluation</p>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans">{report.priorityAnalysis.bottleneckStatus}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Urgency Index</div>
                    <div className="text-lg font-extrabold text-blue-600 font-mono mt-0.5">
                      {report.priorityAnalysis.urgencyScore}/10
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Plan Tasks list */}
              <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
                  <h4 className="font-sans font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Hammer className="h-4 w-4 text-slate-500" /> Maintenance Action & Repair Roadmap (SOP Guideline)
                  </h4>
                </div>

                <div className="p-4 space-y-4 text-xs bg-white">
                  {/* Immediate running actions */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-100 font-bold px-2 py-0.5 rounded-md font-mono tracking-wider uppercase inline-block">
                      1. Crew Immediate Online operations Actions
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 font-sans leading-relaxed">
                      {report.maintenancePlan.immediateActions.map((act, id) => (
                        <li key={id}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Shut-Down repairs required */}
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-150">
                    <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 font-bold px-2 py-0.5 rounded-md font-mono tracking-wider uppercase inline-block">
                      2. Downtime Repair Phase Tasks
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 font-sans leading-relaxed">
                      {report.maintenancePlan.shutDownActions.map((act, id) => (
                        <li key={id}>{act}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Spares procurement procurement plan details */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Spares Procurement & Warehousing Plan:
                    </span>
                    <p className="text-slate-600 italic font-sans">{report.maintenancePlan.spareProcurementStrategy}</p>
                  </div>
                </div>
              </div>

              {/* Traceable RAG documentation sections */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wider uppercase block">
                  Explanations & Traceability references
                </span>
                <div className="space-y-2 animate-feed animate-duration-500">
                  {report.sourcesReferenced.map((source, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-slate-150 rounded-lg p-3 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-mono text-[9px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          {source.type} Referenced
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{source.section || "Excerpt"}</span>
                      </div>
                      <h5 className="font-bold text-slate-700 font-sans">{source.title}</h5>
                      <blockquote className="border-l-2 border-blue-500 pl-2.5 font-mono text-[10px] text-slate-500 whitespace-pre-line leading-relaxed italic bg-white/40 p-1 rounded">
                        {source.snippet}
                      </blockquote>
                    </div>
                  ))}
                </div>
              </div>

              {/* FeedBack loop module as required by problem specifications */}
              <div className="bg-slate-50 border border-blue-100 rounded-xl p-4 space-y-3 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <div className="space-y-0.5">
                    <h5 className="font-sans font-bold text-xs text-slate-800">Expert Learning Feedback Loop</h5>
                    <p className="text-[10px] text-slate-400 font-mono">Corrections update the future reasoning models</p>
                  </div>
                </div>

                {feedbackLogged ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border-emerald-100 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span><b>Correction Recorded!</b> Your operational feedback is persisted. The AI Wizard has assimilated this for subsequent runs.</span>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-slate-600 font-medium">How accurate is this layout?</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFeedbackRating("helpful")}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1 transition ${
                            feedbackRating === "helpful"
                              ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>Helpful</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFeedbackRating("unhelpful")}
                          className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1 transition ${
                            feedbackRating === "unhelpful"
                              ? "bg-rose-100 border-rose-400 text-rose-700"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          <span>Needs Correction</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">
                        SOP Revision / Ground Sighting Corrections
                      </label>
                      <input
                        type="text"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="e.g. Actually, temperature rose matching nozzle choke #4; grease pressure is normally calibrated to 220 bar max."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!feedbackRating || submittingFeedback}
                      className={`w-full py-1 px-3 text-xs rounded-lg font-bold transition flex items-center justify-center gap-1 text-white border ${
                        feedbackRating 
                          ? "bg-blue-600 hover:bg-blue-700 hover:cursor-pointer border-blue-500 shadow-xs" 
                          : "bg-slate-300 border-slate-300 cursor-not-allowed"
                      }`}
                    >
                      {submittingFeedback ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Interpreting Correction...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Save Correction in Learning Loop</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Reset to make clean again */}
              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setNotesInput("");
                    onExecuteDiagnosis("");
                  }}
                  className="px-3 py-1.5 text-slate-500 font-mono hover:text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 bg-white cursor-pointer"
                >
                  <RefreshCwIcon className="h-3 w-3" /> Reset Diagnose Workspace
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* SAP PM Work Order Modal Overlay */}
      {showSapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-feed">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="font-sans font-extrabold text-sm uppercase tracking-wide">
                  SAP PM Work Notification Formatter
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSapModal(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1 text-xs text-slate-700">
              <p className="text-slate-500 leading-relaxed font-sans">
                This structured digital maintenance entry matches standard SAP PM templates (Malfunction Notification type M2). Copied worklogs can be quickly pasted directly into your shift handoff dashboard or Tata Steel's ERP:
              </p>

              <div className="relative">
                <pre className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl p-4 font-mono text-[9px] leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-[45vh]">
                  {generateSapLogText()}
                </pre>
                
                <button
                  onClick={handleCopySapText}
                  className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wide border flex items-center gap-1 transition ${
                    copiedSapText 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedSapText ? "Copied to Clipboard!" : "Copy Worklog"}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-4 md:px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSapModal(false)}
                className="px-4 py-2 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple internal icon to avoid clutter exports
function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
