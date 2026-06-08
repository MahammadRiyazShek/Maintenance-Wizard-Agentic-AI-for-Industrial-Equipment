import React, { useState, useEffect } from "react";
import { 
  Asset, 
  ControlRoomAlert, 
  DiagnosticResult, 
  LogbookEntry, 
  KBDocument, 
  ChatMessage 
} from "./types.ts";

import AssetSelector from "./components/AssetSelector.tsx";
import AlertList from "./components/AlertList.tsx";
import DiagnosisReport from "./components/DiagnosisReport.tsx";
import SupportChat from "./components/SupportChat.tsx";
import LogbookBrowser from "./components/LogbookBrowser.tsx";
import KBBrowser from "./components/KBBrowser.tsx";
import SystemDocumentation from "./components/SystemDocumentation.tsx";

import { 
  Activity, 
  ShieldAlert, 
  FileText, 
  MessageSquare, 
  Archive, 
  BookOpen, 
  RefreshCw, 
  Settings,
  Bell,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function App() {
  // Main Data States with server backing
  const [assets, setAssets] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<ControlRoomAlert[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([]);
  
  // Selection & UI Modes
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  
  // Tab within the Operations Toolkit (Right side)
  const [activeToolTab, setActiveToolTab] = useState<"chat" | "rag" | "logbook">("chat");
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  
  // Diagnostics & Chats Logic States
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosticResult | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState<boolean>(false);
  const [feedbackSaved, setFeedbackSaved] = useState<boolean>(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Time ticker
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydrate states from corporate API daemon on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [assetsRes, alertsRes, logRes, kbRes] = await Promise.all([
        fetch("/api/assets"),
        fetch("/api/alerts"),
        fetch("/api/logbook"),
        fetch("/api/kb")
      ]);

      if (assetsRes.ok) setAssets(await assetsRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (logRes.ok) setLogbook(await logRes.json());
      if (kbRes.ok) setKbDocs(await kbRes.json());
    } catch (e) {
      console.error("Failed to load backend databases:", e);
    }
  }

  // Handle asset click
  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    
    // Auto-select associated unacknowledged alert if any
    const relatedAlert = alerts.find(a => a.assetId === assetId && a.status !== "Resolved");
    if (relatedAlert) {
      setSelectedAlertId(relatedAlert.id);
    } else {
      setSelectedAlertId(null);
    }

    // Reset active loaded diagnoses since target shifted
    setActiveDiagnosis(null);
    setFeedbackSaved(false);
    // Clear chat contextual stream to start a fresh thread for this tool
    setChatHistory([]);
  };

  // Handle alert selection
  const handleSelectAlert = (alert: ControlRoomAlert) => {
    setSelectedAssetId(alert.assetId);
    setSelectedAlertId(alert.id);
    
    // Reset active report
    setActiveDiagnosis(null);
    setFeedbackSaved(false);
    setChatHistory([]);
  };

  // Trigger telemetry mutation simulation (cyber-physical interaction)
  const handleUpdateTelemetry = async (assetId: string, telemetry: any) => {
    try {
      const response = await fetch("/api/assets/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, ...telemetry })
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
        setAlerts(data.alerts);
        
        // Re-read active asset status
        const active = data.assets.find((a: Asset) => a.id === assetId);
        if (active && selectedAssetId === assetId) {
          // If a new warning/critical alert was spawned, automatically bind it
          const freshAlert = data.alerts.find((al: ControlRoomAlert) => al.assetId === assetId && al.status !== "Resolved");
          if (freshAlert) {
            setSelectedAlertId(freshAlert.id);
          }
        }
      }
    } catch (err) {
      console.error("Telemetry simulation transfer error:", err);
    }
  };

  // Acknowledge a control room alarm
  const handleAcknowledgeAlert = async (alertId: string, status: "Investigating" | "Resolved") => {
    try {
      const response = await fetch("/api/alerts/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, status })
      });
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
        setAssets(data.assets);
        
        // If alert was resolved, clear selection
        if (status === "Resolved" && selectedAlertId === alertId) {
          setSelectedAlertId(null);
          setActiveDiagnosis(null);
          setFeedbackSaved(false);
        }
      }
    } catch (e) {
      console.error("Failed to acknowledge warning alert:", e);
    }
  };

  // Compile Gemini AI diagnostics reasoning over manual excerpts + RAG SOP rules
  const handleRunDiagnosis = async (userNotes: string) => {
    if (!selectedAssetId) return;
    setDiagnosisLoading(true);
    setFeedbackSaved(false);
    setActiveDiagnosis(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAssetId,
          alertId: selectedAlertId || undefined,
          userNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Bind the generated structured DiagnosticResult
        setActiveDiagnosis(data.report);
      } else {
        console.error("Diagnostics compile response failed.");
      }
    } catch (e) {
      console.error("AI reasoning query fault:", e);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Save worker feedback and expert learning notes to database
  const handleSubmitFeedback = async (rating: "helpful" | "unhelpful", note: string) => {
    if (!activeDiagnosis || !selectedAssetId) return;
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosticId: `diag-current`,
          assetId: selectedAssetId,
          rating,
          correctionNote: note || undefined
        })
      });
      if (response.ok) {
        setFeedbackSaved(true);
      }
    } catch (err) {
      console.error("Feedback registration fault:", err);
    }
  };

  // Log completed operations / repair actions
  const handleAddLogbookEntry = async (logData: { assetId: string; actionTaken: string; engineerName: string }) => {
    try {
      const response = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...logData,
          alertId: selectedAlertId || undefined, // Bind to resolve active selected alerts
          diagnosticReportId: activeDiagnosis ? "diag-current" : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLogbook(data.logbook);
        setAlerts(data.alerts);
        setAssets(data.assets);
        
        // Success resets active alerts if this was resolving active selected asset
        if (selectedAssetId === logData.assetId) {
          setSelectedAlertId(null);
          setActiveDiagnosis(null);
          setFeedbackSaved(false);
        }
      }
    } catch (e) {
      console.error("Workorder manual log entry failure:", e);
    }
  };

  // Send interactive chat troubleshooting stream
  const handleSendChatMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAssetId || undefined,
          alertId: selectedAlertId || undefined,
          message: text,
          chatHistory: updatedHistory
        })
      });

      if (response.ok) {
        const data = await response.json();
        const wizardReply: ChatMessage = {
          id: `reply-${Date.now()}`,
          role: "model",
          text: data.text,
          timestamp: data.timestamp
        };
        setChatHistory([...updatedHistory, wizardReply]);
      }
    } catch (err) {
      console.error("Wizard response stream failed:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const getActiveAsset = () => {
    return assets.find(a => a.id === selectedAssetId) || null;
  };

  const activeAsset = getActiveAsset();

  return (
    <div id="main-app-portal" className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Real-time Header bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg text-white tracking-widest flex-shrink-0 shadow-lg shadow-blue-500/15">
            TS
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-bold tracking-tight font-sans uppercase flex items-center gap-2">
              Tata Steel Maintenance Wizard
              <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-500/30">
                Cognitive Decision Support v1.0
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>Cyber-Physical Plant Interface Active • Decision Autonomy Mode</span>
            </p>
          </div>
        </div>

        {/* Dynamic header elements */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>UTC Local Time: <b>{new Date(currentTime).toLocaleTimeString()}</b></span>
          </div>

          <button
            onClick={() => setShowDocsModal(!showDocsModal)}
            id="btn-show-system-docs"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-bold font-mono tracking-wide transition cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
            <span>{showDocsModal ? "Close System Dossier" : "System Documentation"}</span>
          </button>
        </div>
      </header>

      {/* Main Container screen */}
      <main className="flex-1 overflow-hidden p-4 md:p-6" id="dashboard-viewport">
        {showDocsModal ? (
          /* Render full hackathon explanation doc */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-h-[85vh] overflow-y-auto max-w-5xl mx-auto animate-feed">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-sans font-bold text-lg text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Tata Steel Hackathon documentation dossier
              </h3>
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg cursor-pointer"
              >
                Return to Control Console
              </button>
            </div>
            <SystemDocumentation />
          </div>
        ) : (
          /* Main Cockpit Split Layout grid and flex boxes */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-start overflow-y-auto xl:overflow-hidden">
            
            {/* Columns 1-4: Telemetry feeds and active warnings ticker */}
            <section className="xl:col-span-4 space-y-6 xl:h-[calc(100vh-130px)] xl:overflow-y-auto pr-0 xl:pr-1" id="left-telemetry-column">
              {/* Asset list Grid selections */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <AssetSelector
                  assets={assets}
                  selectedAssetId={selectedAssetId}
                  onSelectAsset={handleSelectAsset}
                  onUpdateTelemetry={handleUpdateTelemetry}
                />
              </div>

              {/* Alarm indicators */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <AlertList
                  alerts={alerts}
                  selectedAssetId={selectedAssetId}
                  onSelectAlert={handleSelectAlert}
                  onAcknowledge={handleAcknowledgeAlert}
                />
              </div>
            </section>

            {/* Columns 5-8: Diagnostic Planning center stage */}
            <section className="xl:col-span-5 xl:h-[calc(100vh-130px)] xl:overflow-y-auto pr-0 xl:pr-1" id="center-reasoning-column">
              <DiagnosisReport
                asset={activeAsset}
                report={activeDiagnosis}
                loading={diagnosisLoading}
                onExecuteDiagnosis={handleRunDiagnosis}
                onSubmitFeedback={handleSubmitFeedback}
                feedbackLogged={feedbackSaved}
              />
            </section>

            {/* Columns 9-12: Maintenance crew toolkit (Interactive Chat, RAG search and logbook tab selections) */}
            <section className="xl:col-span-3 xl:h-[calc(100vh-130px)] flex flex-col gap-4" id="right-toolkit-column">
              {/* Selector Tab Buttons bar */}
              <div className="bg-white border border-slate-200 p-1.5 rounded-xl flex gap-1 shadow-xs">
                <button
                  onClick={() => setActiveToolTab("chat")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeToolTab === "chat"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Interactive Chat</span>
                </button>

                <button
                  onClick={() => setActiveToolTab("rag")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeToolTab === "rag"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>RAG KB</span>
                </button>

                <button
                  onClick={() => setActiveToolTab("logbook")}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeToolTab === "logbook"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Logbook</span>
                </button>
              </div>

              {/* Active Tab body box */}
              <div className="flex-1 min-h-0" id="toolkit-body-wrapper">
                {activeToolTab === "chat" && (
                  <SupportChat
                    asset={activeAsset}
                    history={chatHistory}
                    onSendMessage={handleSendChatMessage}
                    onClearHistory={() => setChatHistory([])}
                    chatLoading={chatLoading}
                  />
                )}

                {activeToolTab === "rag" && (
                  <KBBrowser documents={kbDocs} />
                )}

                {activeToolTab === "logbook" && (
                  <LogbookBrowser
                    assets={assets}
                    logbook={logbook}
                    onAddLog={handleAddLogbookEntry}
                  />
                )}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
