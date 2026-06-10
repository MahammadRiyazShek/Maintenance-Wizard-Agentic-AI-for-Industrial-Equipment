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
