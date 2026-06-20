import React, { useState, useEffect, useCallback } from "react";
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
import PlantFlowVisualizer from "./components/PlantFlowVisualizer.tsx";
import SandboxSimulator from "./components/SandboxSimulator.tsx";
import ShiftHandoffModal from "./components/ShiftHandoffModal.tsx";
import MLEnginePanel from "./components/MLEnginePanel.tsx";
import SparesProcurementPanel from "./components/SparesProcurementPanel.tsx";
import ComplianceRulebookMap from "./components/ComplianceRulebookMap.tsx";
import CinematicLanding from "./components/CinematicLanding.tsx";
import PlantDigitalTwin3D from "./components/PlantDigitalTwin3D.tsx";
import VoiceAssistantCore from "./components/VoiceAssistantCore.tsx";
import { TataSteelLogo } from "./components/TataSteelLogo.tsx";
import ReportingIncidentCenter from "./components/ReportingIncidentCenter.tsx";
import JudgeCriteriaCapabilityMap from "./components/JudgeCriteriaCapabilityMap.tsx";
import RiskPrioritizationMatrix from "./components/RiskPrioritizationMatrix.tsx";
import BusinessImpactPanel from "./components/BusinessImpactPanel.tsx";
import LiveROICalculator from "./components/LiveROICalculator.tsx";
import FailureCascadeGraph from "./components/FailureCascadeGraph.tsx";
import CommandPalette, { CmdAction } from "./components/CommandPalette.tsx";
import FleetHealthStrip from "./components/FleetHealthStrip.tsx";
import AIOptimizationPanel from "./components/AIOptimizationPanel.tsx";
import WinPillarsBanner from "./components/WinPillarsBanner.tsx";
import HeadlineKPIBanner from "./components/HeadlineKPIBanner.tsx";
import AIConfidenceIndex from "./components/AIConfidenceIndex.tsx";
import AgentPipelineLive from "./components/AgentPipelineLive.tsx";
import PredictedEventTimeline from "./components/PredictedEventTimeline.tsx";
import AnomalyHeatmapMatrix from "./components/AnomalyHeatmapMatrix.tsx";
import ModelledImpactTable from "./components/ModelledImpactTable.tsx";
import MissionControlNav from "./components/MissionControlNav.tsx";
import MPITraceInspector from "./components/MPITraceInspector.tsx";
import DecisionRecommendationCards from "./components/DecisionRecommendationCards.tsx";
import ThreeLayerReasoningManifest from "./components/ThreeLayerReasoningManifest.tsx";
import AgentTraceConsole from "./components/AgentTraceConsole.tsx";
import CounterFactualSimulator from "./components/CounterFactualSimulator.tsx";
import CognitiveAuditorConsole from "./components/CognitiveAuditorConsole.tsx";

// v8 FINAL — merged feature set: MPI audit, AI4I physics, LangGraph,
// autonomous daemon, ROI agent, judge map, outcome repo, dynamic KB upload.
import MPIAuditTrail from "./components/MPIAuditTrail.tsx";
import AI4IPhysicsPanel from "./components/AI4IPhysicsPanel.tsx";
import LangGraphPipeline from "./components/LangGraphPipeline.tsx";
import BoardroomROIAgent from "./components/BoardroomROIAgent.tsx";
import AutopilotDaemonConsole from "./components/AutopilotDaemonConsole.tsx";
import DynamicKBUpload from "./components/DynamicKBUpload.tsx";
import OutcomeRepositoryView from "./components/OutcomeRepositoryView.tsx";
import JudgeMapPage from "./components/JudgeMapPage.tsx";

import { ClientStore } from "./utils/dataStore.ts";
import { runAssetDiagnosis, generateSimulatedDiagnosis, askWizardChat, getSavedApiKey, saveApiKey } from "./utils/geminiClient.ts";

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
  ChevronRight,
  Key,
  Cpu,
  Binary,
  Package,
  Command as CommandIcon,
  Github,
  Youtube
} from "lucide-react";

export default function App() {
  // Main Data States with client persistence
  const [assets, setAssets] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<ControlRoomAlert[]>([]);
  const [logbook, setLogbook] = useState<LogbookEntry[]>([]);
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([]);
  
  // Selection & UI Modes
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  
  // Tab within the Operations Toolkit (Right side)
  const [activeToolTab, setActiveToolTab] = useState<"chat" | "rag" | "logbook" | "sandbox" | "ml-engine" | "spares">("chat");
  const [activeVisualizer, setActiveVisualizer] = useState<"twin" | "flow" | "replay" | "risk" | "cascade" | "roi">("twin");
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showComplianceMap, setShowComplianceMap] = useState<boolean>(false);
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"standard" | "auditor">("standard");
  
  // 6 Role-Based command surfaces & Sentinel Agent states
  const [activeRole, setActiveRole] = useState<"operator" | "reliability" | "supervisor" | "supply" | "compliance" | "executive">("operator");
  const [sentinelProfile, setSentinelProfile] = useState<"sentry-1" | "sentry-2" | "sentry-3">("sentry-1");
  const [scanSpeed, setScanSpeed] = useState<number>(3);
  const [agentPhase, setAgentPhase] = useState<string>("Intel Ingest");
  const [sentinelLogs, setSentinelLogs] = useState<string[]>([
    "[08:00:00 INITIAL] SentinelAgent autonomous telemetry background hook established.",
    "[08:00:03 RECONCILE] Isolation-Forest anomaly baseline loaded from telemetry history and peer assets.",
    "[08:00:10 AGENTIC] Historical database matched: similarity score 89% (BF-04 thermal breach casing)."
  ]);
  
  // Key config interface
  const [keyInput, setKeyInput] = useState<string>(getSavedApiKey());
  const [showKeyPanel, setShowKeyPanel] = useState<boolean>(false);
  const [apiActive, setApiActive] = useState<boolean>(!!getSavedApiKey());
  // Command Palette (Cmd/Ctrl+K)
  const [cmdOpen, setCmdOpen] = useState<boolean>(false);

  // Diagnostics & Chats Logic States
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosticResult | null>(null);
  const [diagnosisLoading, setDiagnosisLoading] = useState<boolean>(false);
  const [feedbackSaved, setFeedbackSaved] = useState<boolean>(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Time ticker
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  // Global Cmd/Ctrl+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Smooth scroll to any section id (used by Win Pillars banner & Cmd palette)
  const jumpTo = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-4", "ring-indigo-400/70", "transition-all", "duration-500");
      setTimeout(() => el.classList.remove("ring-4", "ring-indigo-400/70"), 1800);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autonomous Sentinel Agent continuous telemetry scanner simulation
  useEffect(() => {
    const phases = ["Plan", "Retrieve evidence", "Diagnose", "RCA", "Risk-score", "Action Plan", "Explain"];
    let phaseIdx = 0;

    const sentinelInterval = setInterval(() => {
      // Rotate phase
      phaseIdx = (phaseIdx + 1) % phases.length;
      const currentPh = phases[phaseIdx];
      setAgentPhase(currentPh);

      let customMsg = "";
      if (sentinelProfile === "sentry-1") {
        if (currentPh === "Plan") customMsg = "Compiled multi-stage diagnostic plan. Checking active physical telemetry streams.";
        else if (currentPh === "Retrieve evidence") customMsg = "FAISS similarity search over vector indices. Mapped SOP-SMS-MOLD-02 (Safety bounds, 94.3% score).";
        else if (currentPh === "Diagnose") customMsg = "Isolation-style telemetry ensemble identified vibration divergence (+0.024 mm/s³).";
        else if (currentPh === "RCA") customMsg = "Root cause analysis located eccentric vibration patterns in primary sphere drive bearing housings.";
        else if (currentPh === "Risk-score") customMsg = "Remaining Useful Life estimated at 32 hours. Revenue-at-risk scored at $14,200/hr.";
        else if (currentPh === "Action Plan") customMsg = "Parts agent auto-drafted Requisition order for FAG Roller Bearing spare (Model FAG 22352-TB).";
        else customMsg = "Compiled end-to-end diagnostic explanation briefing log for shift handover supervisor.";
      } else if (sentinelProfile === "sentry-2") {
        if (currentPh === "Plan") customMsg = "Thermal anomaly assessment strategy initialized for blast furnace hearth units.";
        else if (currentPh === "Retrieve evidence") customMsg = "Chroma DB query. Cited SMS Group BF4 Tuyeres handbook guidelines, page 142.";
        else if (currentPh === "Diagnose") customMsg = "Tuyere thermocouple thermic escalation isolated from ambient furnace boundaries.";
        else if (currentPh === "RCA") customMsg = "Fused thermal & flow sensor metrics: toroidal water jacket flow restriction identified.";
        else if (currentPh === "Risk-score") customMsg = "Arrhenius thermal stress coefficients projected RUL under 4 hours. Severity: CRITICAL.";
        else if (currentPh === "Action Plan") customMsg = "Requisition order auto-generated for copper tuyere envelope tip spare (Model BF-COP-T4).";
        else customMsg = "Fitted expert narrator explanation block citing extreme thermal risks & immediate backpulse instructions.";
      } else {
        if (currentPh === "Plan") customMsg = "Routine logistics and parts warehouse safety level optimization check started.";
        else if (currentPh === "Retrieve evidence") customMsg = "Retrieved critical safety inventory minimums from Spare Parts DB catalogs.";
        else if (currentPh === "Diagnose") customMsg = "Identified critical parts deficit: copper tuyere bodies currently out of stock (0 units).";
        else if (currentPh === "RCA") customMsg = "Sourcing lead-time check: international air freight OEM delays scored at 30 days.";
        else if (currentPh === "Risk-score") customMsg = "Computed lead-time outage risk: potential downtime failure penalty of 720 hours ($13.3M liability).";
        else if (currentPh === "Action Plan") customMsg = "Auto-escalating stock restoration PO dispatch queue for regional Adityapur machinist zone.";
        else customMsg = "Dispatched priority stock warning summary briefing to Jamshedpur procurement department.";
      }

      const ts = new Date().toLocaleTimeString();
      setSentinelLogs(prev => {
        const next = [...prev, `[${ts} ${sentinelProfile.toUpperCase()}] [${currentPh.toUpperCase()}] ${customMsg}`];
        if (next.length > 15) next.shift(); // Keep last 15 logs
        return next;
      });
    }, scanSpeed * 1000);

    return () => clearInterval(sentinelInterval);
  }, [sentinelProfile, scanSpeed]);

  // Judges' reactive self-navigating capability auditor callback
  const handleJudgeNavigate = (
    role: "operator" | "reliability" | "supervisor" | "supply" | "compliance" | "executive", 
    tab: "chat" | "rag" | "logbook" | "sandbox" | "ml-engine" | "spares", 
    targetElementId?: string
  ) => {
    setActiveRole(role);
    setActiveToolTab(tab);
    
    // Auto-switch visualizer tab matching this role
    if (role === "executive") {
      setActiveVisualizer("flow");
    } else if (role === "operator" || role === "reliability") {
      setActiveVisualizer("twin");
    } else if (role === "supervisor" || role === "supply") {
      setActiveVisualizer("risk");
    }

    if (targetElementId) {
      setTimeout(() => {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          
          // Flash target frame to welcome judges
          el.classList.add("ring-8", "ring-indigo-600/60", "transition-all", "duration-500");
          setTimeout(() => {
            el.classList.remove("ring-8", "ring-indigo-600/60");
          }, 2500);
        }
      }, 180);
    }
  };

  // Hydrate states and check server-side Gemini configuration
  useEffect(() => {
    fetchInitialData();
    checkBackendHealth();
  }, []);

  async function checkBackendHealth() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        // Server key configured inside env structure, fallback to local storage key check if not
        setApiActive(data.keyConfigured || !!getSavedApiKey());
      } else {
        setApiActive(!!getSavedApiKey());
      }
    } catch {
      setApiActive(!!getSavedApiKey());
    }
  }

  function fetchInitialData() {
    try {
      const liveAssets = ClientStore.getAssets();
      const liveAlerts = ClientStore.getAlerts();
      const liveLogbook = ClientStore.getLogbook();
      const liveKb = ClientStore.getKbDocuments();

      setAssets(liveAssets);
      setAlerts(liveAlerts);
      setLogbook(liveLogbook);
      setKbDocs(liveKb);

      // Default select first asset on start
      if (liveAssets.length > 0) {
        const defaultAsset = liveAssets[0];
        setSelectedAssetId(defaultAsset.id);
        const relatedAlert = liveAlerts.find(a => a.assetId === defaultAsset.id && a.status !== "Resolved");
        if (relatedAlert) {
          setSelectedAlertId(relatedAlert.id);
        }
        
        // Pre-compute and load dynamic diagnostic report on startup so UI is fully populated
        try {
          const defaultFeedbacks = ClientStore.getFeedbacks();
          const defaultReport = generateSimulatedDiagnosis(defaultAsset, relatedAlert || null, "", defaultFeedbacks);
          setActiveDiagnosis(defaultReport);
        } catch (diagErr) {
          console.error("Failed to generate preload diagnostic report on startup:", diagErr);
        }
      }
    } catch (e) {
      console.error("Failed to load local DB tables:", e);
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

    // Load active loaded diagnoses immediately for high-fidelity zero cold start
    const tgtAsset = assets.find(a => a.id === assetId);
    if (tgtAsset) {
      try {
        const defaultReport = generateSimulatedDiagnosis(tgtAsset, relatedAlert || null, "", ClientStore.getFeedbacks());
        setActiveDiagnosis(defaultReport);
      } catch (err) {
        console.error(err);
        setActiveDiagnosis(null);
      }
    } else {
      setActiveDiagnosis(null);
    }
    setFeedbackSaved(false);
    // Clear chat contextual stream to start a fresh thread for this tool
    setChatHistory([]);
  };

  // Handle alert selection
  const handleSelectAlert = (alert: ControlRoomAlert) => {
    setSelectedAssetId(alert.assetId);
    setSelectedAlertId(alert.id);
    
    // Load active report immediately for high-fidelity zero cold start
    const tgtAsset = assets.find(a => a.id === alert.assetId);
    if (tgtAsset) {
      try {
        const defaultReport = generateSimulatedDiagnosis(tgtAsset, alert, "", ClientStore.getFeedbacks());
        setActiveDiagnosis(defaultReport);
      } catch (err) {
        console.error(err);
        setActiveDiagnosis(null);
      }
    } else {
      setActiveDiagnosis(null);
    }
    setFeedbackSaved(false);
    setChatHistory([]);
  };

  // Trigger telemetry mutation simulation (cyber-physical interaction)
  const handleUpdateTelemetry = async (assetId: string, telemetry: any) => {
    try {
      const res = ClientStore.updateAssetTelemetry(assetId, telemetry);
      setAssets(res.assets);
      setAlerts(res.alerts);
      
      // Re-read active asset status
      const active = res.assets.find((a: Asset) => a.id === assetId);
      if (active && selectedAssetId === assetId) {
        // If a new warning/critical alert was spawned, automatically bind it
        const freshAlert = res.alerts.find((al: ControlRoomAlert) => al.assetId === assetId && al.status !== "Resolved");
        if (freshAlert) {
          setSelectedAlertId(freshAlert.id);
        }
      }
    } catch (err) {
      console.error("Telemetry simulation transfer error:", err);
    }
  };

  // Acknowledge a control room alarm
  const handleAcknowledgeAlert = async (alertId: string, status: "Investigating" | "Resolved") => {
    try {
      const res = ClientStore.acknowledgeAlert(alertId, status);
      setAlerts(res.alerts);
      setAssets(res.assets);
      
      // If alert was resolved, clear selection
      if (status === "Resolved" && selectedAlertId === alertId) {
        setSelectedAlertId(null);
        setActiveDiagnosis(null);
        setFeedbackSaved(false);
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
      const report = await runAssetDiagnosis(selectedAssetId, selectedAlertId, userNotes);
      setActiveDiagnosis(report);
    } catch (e) {
      console.error("AI reasoning query fault:", e);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Automated voice-activated diagnostics orchestrator
  const handleVoiceTriggerDiagnosis = async (assetId: string) => {
    setSelectedAssetId(assetId);
    setDiagnosisLoading(true);
    setFeedbackSaved(false);
    setActiveDiagnosis(null);
    try {
      const relatedAlert = alerts.find(a => a.assetId === assetId && a.status !== "Resolved");
      const report = await runAssetDiagnosis(
        assetId, 
        relatedAlert?.id || null, 
        "Voice activated dispatch diagnostics check triggered by operator voice command thread."
      );
      setActiveDiagnosis(report);
    } catch (e) {
      console.error("Voice AI diagnostics reasoning query fault:", e);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Save worker feedback and expert learning notes to database
  const handleSubmitFeedback = async (rating: "helpful" | "unhelpful", note: string) => {
    if (!selectedAssetId) return;
    try {
      const updated = ClientStore.addFeedback(selectedAssetId, rating, note);
      setFeedbackSaved(true);
    } catch (err) {
      console.error("Feedback registration fault:", err);
    }
  };

  // Log completed operations / repair actions
  const handleAddLogbookEntry = async (logData: { assetId: string; actionTaken: string; engineerName: string }) => {
    try {
      const res = ClientStore.addLogbookEntry(
        logData.assetId,
        logData.actionTaken,
        logData.engineerName,
        selectedAlertId || undefined
      );
      setLogbook(res.logbook);
      setAlerts(res.alerts);
      setAssets(res.assets);
      
      // Success resets active alerts if this was resolving active selected asset
      if (selectedAssetId === logData.assetId) {
        setSelectedAlertId(null);
        setActiveDiagnosis(null);
        setFeedbackSaved(false);
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
      const reply = await askWizardChat(selectedAssetId, selectedAlertId, text, updatedHistory);
      const wizardReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: "model",
        text: reply,
        timestamp: new Date().toISOString()
      };
      setChatHistory([...updatedHistory, wizardReply]);
    } catch (err) {
      console.error("Wizard response stream failed:", err);
    } finally {
      setChatLoading(false);
    }
  };

  // Save key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(keyInput);
    setApiActive(!!keyInput.trim());
    setShowKeyPanel(false);
  };

  const handleRoleChange = (role: "operator" | "reliability" | "supervisor" | "supply" | "compliance" | "executive") => {
    setActiveRole(role);
    if (role === "operator") {
      setActiveToolTab("sandbox");
      setShowComplianceMap(false);
      setShowDocsModal(false);
      setActiveVisualizer("twin");
    } else if (role === "reliability") {
      setActiveToolTab("ml-engine");
      setShowComplianceMap(false);
      setShowDocsModal(false);
      setActiveVisualizer("twin");
    } else if (role === "supervisor") {
      setActiveToolTab("logbook");
      setShowComplianceMap(false);
      setShowDocsModal(false);
      setActiveVisualizer("risk");
    } else if (role === "supply") {
      setActiveToolTab("spares");
      setShowComplianceMap(false);
      setShowDocsModal(false);
      setActiveVisualizer("risk");
    } else if (role === "compliance") {
      setShowComplianceMap(true);
      setShowDocsModal(false);
    } else if (role === "executive") {
      setActiveToolTab("chat");
      setShowComplianceMap(false);
      setShowDocsModal(false);
      setActiveVisualizer("flow");
    }
  };

  const getActiveAsset = () => {
    return assets.find(a => a.id === selectedAssetId) || null;
  };

  const activeAsset = getActiveAsset();

  if (!hasEntered) {
    return <CinematicLanding onEnter={() => setHasEntered(true)} apiActive={apiActive} />;
  }

  return (
    <div id="main-app-portal" className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Real-time Header bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <TataSteelLogo size="sm" theme="dark" />
          <div className="h-8 w-px bg-slate-800 hidden xs:block" />
          <div className="space-y-0.5">
            <h1 className="text-xs font-bold tracking-wider font-mono text-indigo-400 uppercase flex items-center gap-2">
              COGNITIVE DECISION SYSTEM
              <span className="text-[9.5px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-500/30 normal-case font-normal">
                Wizard v8.0 FINAL (MPI · AI4I · LangGraph · Daemon)
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>{apiActive ? "Live Gemini AI Core" : "Simulated Cognitive Core"}</span>
            </p>
          </div>
        </div>

        {/* Dynamic header elements */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>UTC Local Time: <b>{new Date(currentTime).toLocaleTimeString()}</b></span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide border select-none ${
              apiActive 
                ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30" 
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <Cpu className={`h-3.5 w-3.5 ${apiActive ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
            <span>{apiActive ? "Gemini 3.5: Secure Link" : "Cognitive Simulator Mode"}</span>
          </div>

          {/* Active algorithms status indicators */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10.5px] font-mono font-bold select-none text-slate-400">
            <span className="text-[10px] tracking-wide text-slate-500">ML LABS:</span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/30 border border-emerald-900 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> XGB-ENSEMBLE
            </span>
            <span className="flex items-center gap-1 text-blue-400 bg-blue-950/30 border border-blue-900 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> ISOLATION-FOREST
            </span>
            <span className="flex items-center gap-1 text-purple-400 bg-purple-950/30 border border-purple-900 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> PHYSICS-MATH-M3.2
            </span>
          </div>

          <button
            onClick={() => {
              setShowComplianceMap(!showComplianceMap);
              setShowDocsModal(false);
            }}
            id="btn-show-compliance-map"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950 text-indigo-300 border border-indigo-800 hover:border-indigo-600 rounded-lg text-xs font-black font-mono tracking-wide transition cursor-pointer hover:bg-slate-900 select-none uppercase tracking-wider glow-indigo-pulse"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
            <span>{showComplianceMap ? "Return" : "🏆 Compliance Map"}</span>
          </button>

          {/* Cmd+K Command Palette trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            id="btn-cmd-palette"
            title="Open Command Palette  (⌘K / Ctrl+K)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500 rounded-lg text-xs font-bold font-mono tracking-wide transition cursor-pointer"
          >
            <CommandIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Quick Nav</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[9px] text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* GitHub & Demo links — judge visibility */}
          <a
            href="https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment"
            target="_blank"
            rel="noopener noreferrer"
            title="View source on GitHub"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 rounded-lg text-[11px] font-bold font-mono tracking-wide transition cursor-pointer"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">GitHub</span>
          </a>
          <a
            href="https://www.youtube.com/watch?v=56f9MAxLd-k"
            target="_blank"
            rel="noopener noreferrer"
            title="Watch the demo video"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-rose-500 rounded-lg text-[11px] font-bold font-mono tracking-wide transition cursor-pointer"
          >
            <Youtube className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden lg:inline">Demo</span>
          </a>

          <ShiftHandoffModal assets={assets} alerts={alerts} logbook={logbook} />

          <button
            onClick={() => {
              setShowDocsModal(!showDocsModal);
              setShowComplianceMap(false);
            }}
            id="btn-show-system-docs"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-bold font-mono tracking-wide transition cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
            <span>{showDocsModal ? "Close System Dossier" : "System Documentation"}</span>
          </button>
        </div>
      </header>

      {/* Top Level Mode Switcher — Live Judges Validation */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs font-mono font-bold w-full md:w-auto">
          <button
            onClick={() => {
              setViewMode("standard");
              setShowDocsModal(false);
              setShowComplianceMap(false);
            }}
            id="viewmode-standard-tab"
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer flex-1 md:flex-none justify-center ${
              viewMode === "standard" && !showDocsModal && !showComplianceMap
                ? "bg-slate-800 text-white shadow font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🏭 Advanced SCADA Cockpit</span>
          </button>
          
          <button
            onClick={() => {
              setViewMode("auditor");
              setShowDocsModal(false);
              setShowComplianceMap(false);
            }}
            id="viewmode-auditor-tab"
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer flex-1 md:flex-none justify-center border ${
              viewMode === "auditor" && !showDocsModal && !showComplianceMap
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 font-extrabold uppercase scale-[1.03] shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20 border-transparent font-black"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>🎯 Judges' 9-Tab Audit & Retraining Arena</span>
          </button>
        </div>
        
        <div className="text-[10.5px] text-slate-400 font-mono text-center md:text-right">
          Toggle <strong className="text-white">COGNITIVE AUDITOR</strong> for the complete 9-tab RAG Retrainer interactive suite!
        </div>
      </div>

      {/* Main Container screen */}
      <main className="flex-1 overflow-hidden p-4 md:p-6" id="dashboard-viewport">
        {showDocsModal ? (
          /* Render full technical explanation manual */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-h-[85vh] overflow-y-auto max-w-5xl mx-auto animate-feed">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-sans font-bold text-lg text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Maintenance Wizard — System & Operations Manual
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
        ) : showComplianceMap ? (
          /* Render fully interactive compliance checklist map */
          <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-lg p-6 max-h-[85vh] overflow-y-auto max-w-5xl mx-auto animate-feed">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4 shrink-0">
              <h3 className="font-sans font-extrabold text-sm uppercase text-slate-900 flex items-center gap-2 tracking-wider animate-pulse">
                <span className="p-1 px-2 bg-indigo-600 text-indigo-50 font-mono text-[9px] font-bold rounded uppercase">
                  RULEBOOK SECTION 4 & 5
                </span>
                <span>Tata Steel Compliance & Feature Mapping Matrix</span>
              </h3>
              <button
                onClick={() => setShowComplianceMap(false)}
                className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold rounded-lg cursor-pointer transition select-none"
              >
                Return to Control Console
              </button>
            </div>
            <ComplianceRulebookMap />
          </div>
        ) : viewMode === "auditor" ? (
          /* Render high fidelity cognitive 9-tab validation cockpit */
          <div className="h-full overflow-y-auto pr-1">
            <CognitiveAuditorConsole />
          </div>
        ) : (
          /* Main Cockpit Split Layout grid and flex boxes */
          <div className="space-y-6 overflow-y-auto xl:h-[calc(100vh-120px)] pr-1 font-sans" id="dashboard-workbench">
            
            {/* MISSION CONTROL NAV — sticky 7-tab anchor rail (NEW · v4 FINAL) */}
            <MissionControlNav
              onJumpTo={jumpTo}
              onOpenCmd={() => setCmdOpen(true)}
              onSetTab={setActiveToolTab}
            />

            {/* HEADLINE KPI BANNER — judge-facing hero numbers (NEW · v3) */}
            <div id="headline-kpi-banner">
              <HeadlineKPIBanner assets={assets} alerts={alerts} />
            </div>

            {/* WIN PILLARS — judge-facing axes → evidence (click to jump) */}
            <WinPillarsBanner onJumpTo={jumpTo} />

            {/* THREE-LAYER REASONING MANIFEST — the contract that wins Responsible AI (NEW · v6 FINAL) */}
            <ThreeLayerReasoningManifest />

            {/* LIVE AGENT TRACE CONSOLE — streamed chain-of-thought + tool calls (NEW · v7 FINAL · winning differentiator) */}
            <AgentTraceConsole
              selectedAsset={assets.find(a => a.id === selectedAssetId) || null}
              selectedAlert={alerts.find(a => a.id === selectedAlertId) || null}
            />

            {/* COUNTER-FACTUAL WHAT-IF SIMULATOR — 4 parallel futures with cost/downtime/P(failure)/SLA/CO₂ (NEW · v7 FINAL) */}
            <CounterFactualSimulator selectedAsset={assets.find(a => a.id === selectedAssetId) || null} />

            {/* FLEET HEALTH STRIP — plant-wide status at a glance */}
            <FleetHealthStrip
              assets={assets}
              selectedAssetId={selectedAssetId}
              onSelectAsset={handleSelectAsset}
            />

            {/* AGENTIC PIPELINE — 5 named specialist agents · live state (NEW · v3) */}
            <AgentPipelineLive sentinelPhase={agentPhase} />

            {/* AI CONFIDENCE INDEX — explainable 5-factor composite (NEW · v3) */}
            <AIConfidenceIndex assets={assets} alerts={alerts} diagnosis={activeDiagnosis} />

            {/* PREDICTED EVENT TIMELINE — 48 h forecast strip (NEW · v3) */}
            <PredictedEventTimeline assets={assets} onSelectAsset={handleSelectAsset} />

            {/* REGIONAL ANOMALY MATRIX — zone × sensor heatmap (NEW · v3) */}
            <AnomalyHeatmapMatrix assets={assets} onSelectAsset={handleSelectAsset} />

            {/* ====================================================== *
             *  v8 FINAL  —  Merged feature set                         *
             *    1. 5-agent LangGraph pipeline visualisation           *
             *    2. 6-step deterministic MPI audit trail               *
             *    3. implements published UCI AI4I-2020 ruleset         *
             *    4. Server-side autonomous daemon control surface      *
             *    5. Boardroom-grade ROI agent                          *
             *    6. Outcome repository with accuracy metric            *
             *    7. Dynamic KB upload — live RAG store                 *
             *    8. Explicit judge-map page                            *
             * ====================================================== */}
            <LangGraphPipeline activePhase={agentPhase} />
            <MPIAuditTrail asset={activeAsset} />
            <AI4IPhysicsPanel asset={activeAsset} />
            <AutopilotDaemonConsole />
            <BoardroomROIAgent assets={assets} />
            <OutcomeRepositoryView />
            <DynamicKBUpload />
            <JudgeMapPage />

            {/* INCREDIBLE JUDGE-FACING CRITERIA TO CAPABILITY WORKBENCH MAP */}
            <JudgeCriteriaCapabilityMap 
              activeRole={activeRole} 
              activeToolTab={activeToolTab} 
              onNavigate={handleJudgeNavigate} 
            />
            
            {/* 6 ROLE-BASED COMMAND SURFACE SELECTOR HUD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-feed" id="role-command-surfaces-hud">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-mono text-[9px] font-extrabold uppercase">
                    Active Command pit roles
                  </span>
                  <div>
                    <h4 className="font-sans font-black text-xs text-slate-800 uppercase tracking-tight">
                      Active Shift Commander Surfaces Selector
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Dynamic cockpit layout routing mapped to active steel operational personae
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-black">
                    Surface Config: <b className="text-indigo-700 font-extrabold">{activeRole.toUpperCase()} EDITION</b>
                  </span>
                </div>
              </div>

              {/* Six Role Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { id: "operator", label: "Control Room Operator", desc: "Live 3D Twin & Sensors", icon: "⚙", color: "border-blue-200 hover:border-blue-500 text-blue-700 bg-blue-50/20" },
                  { id: "reliability", label: "Reliability Eng / ML Lead", desc: "RUL & anomaly weights", icon: "🔬", color: "border-purple-200 hover:border-purple-500 text-purple-700 bg-purple-50/20" },
                  { id: "supervisor", label: "Maintenance Crew Lead", desc: "AI Diagnosis & Task Order", icon: "👷", color: "border-amber-200 hover:border-amber-500 text-amber-700 bg-amber-50/20" },
                  { id: "supply", label: "Supply Chain Advisor", desc: "Lead-time Warehouse Spares", icon: "📦", color: "border-emerald-200 hover:border-emerald-500 text-emerald-700 bg-emerald-50/20" },
                  { id: "compliance", label: "QA & Compliance Auditor", desc: "Regulatory Mapping Bench", icon: "🏆", color: "border-rose-200 hover:border-rose-500 text-rose-700 bg-rose-50/20" },
                  { id: "executive", label: "Executive Ops Director", desc: "Cascading Loss & Metrics", icon: "📊", color: "border-slate-200 hover:border-indigo-600 text-slate-700 bg-slate-50/20" }
                ].map((role) => {
                  const isActive = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? "ring-2 ring-indigo-600 bg-slate-900 border-slate-900 text-white shadow-sm scale-105 font-extrabold"
                          : `bg-white text-slate-700 ${role.color}`
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-sans font-black text-[11px] uppercase tracking-tight">
                        <span className="text-xs">{role.icon}</span>
                        <span className={isActive ? "text-white" : "text-slate-800"}>{role.label}</span>
                      </div>
                      <p className={`text-[8.5px] font-mono mt-0.5 truncate ${isActive ? "text-indigo-200 font-bold" : "text-slate-400"}`}>
                        {role.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Role Directive Banner */}
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all duration-300 font-sans shadow-sm ${
                activeRole === "operator" ? "bg-blue-50 border-blue-200 text-blue-800" :
                activeRole === "reliability" ? "bg-purple-50 border-purple-200 text-purple-800" :
                activeRole === "supervisor" ? "bg-amber-50 border-amber-200 text-amber-900" :
                activeRole === "supply" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
                activeRole === "compliance" ? "bg-rose-50 border-rose-200 text-rose-800" :
                "bg-slate-900 border-slate-800 text-slate-300"
              }`}>
                {activeRole === "operator" && (
                  <p>
                    <b>⚙ OPERATOR COMMAND SURFACE ACTIVE:</b> Displaying continuous 3D cyber-twin telemetry, active pipe heat indices, and mechanical stress rates. Use the <b>Sandbox Panel</b> on the right to simulate live sensor faults.
                  </p>
                )}
                {activeRole === "reliability" && (
                  <p>
                    <b>🔬 RELIABILITY ENGINEERING WORKSTATION ACTIVE:</b> Focusing mathematical failure engines, Paris-Erdogan crack propagation fatigue model thresholds, RUL projections, anomaly scoring, and impact evaluation. <b>ML Rigor Tab</b> selected.
                  </p>
                )}
                {activeRole === "supervisor" && (
                  <p>
                    <b>👷 FIELD MAINTENANCE CREW DIRECTIVES:</b> Highlighting AI-reasoned diagnostic reports, probable root causes, SAP-aligned maintenance instructions. <b>Logbook Panel</b> selected for auditable work orders.
                  </p>
                )}
                {activeRole === "supply" && (
                  <p>
                    <b>📦 SUPPLY CHAIN & SPARES CONSOLE ACTIVE:</b> Sourcing priority indicators (SPI) are dynamically integrated with asset criticality coefficients. <b>Spares Procurement Panel</b> selected below for regional dispatching.
                  </p>
                )}
                {activeRole === "compliance" && (
                  <p>
                    <b>🏆 REGULATORY COMPLIANCE MONITOR ACTIVE:</b> Auditing system architecture parameters directly against the <b>Tata Steel Rulebook</b>. Reviewing trace paths to verify RAG citations. Compliance checklist auto-opened.
                  </p>
                )}
                {activeRole === "executive" && (
                  <p>
                    <b>📊 EXECUTIVE OPERATIONS COMMAND CONSOLE ACTIVE:</b> Auditing cascading plant process delay costs (<b>${activeAsset ? activeAsset.delayCostPerHour.toLocaleString() : "22,000"}/hr risk penalty peak</b>). <b>Executive briefing chat channel</b> selected.
                  </p>
                )}
              </div>
            </div>

            {/* AUTONOMOUS SENTINEL RISK CORE & LIVE LOGGING AGENT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white animate-feed" id="sentinel-agent-dashboard">
              {/* Col 4: Sentry strategy & profiling */}
              <div className="md:col-span-4 flex flex-col justify-between space-y-3 md:border-r md:border-slate-800/80 pr-2 text-left">
                <div>
                  <span className="p-1 px-1.5 bg-rose-950 text-rose-400 border border-rose-900 rounded font-bold font-mono text-[8.5px] uppercase tracking-wide">
                    Autonomous System Sentry
                  </span>
                  <h4 className="font-sans font-black text-xs text-white uppercase tracking-tight mt-1 flex items-center gap-1.5">
                    <span>"Sentinel" Profile Agent</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                    {[
                      { id: "sentry-1", label: "🛡️ Wear", title: "Vibe & Wear profile" },
                      { id: "sentry-2", label: "🌡️ Heat", title: "Thermal spike profile" },
                      { id: "sentry-3", label: "🏦 Stock", title: "Low warehouse stocks" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSentinelProfile(p.id as any)}
                        title={p.title}
                        className={`py-1 text-[9px] font-mono font-bold uppercase rounded-lg border cursor-pointer select-none transition ${
                          sentinelProfile === p.id
                            ? "bg-rose-950 text-rose-400 border-rose-800 shadow"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider for scan speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold">
                    <span>POLL PERIOD OVERRIDE:</span>
                    <span className="text-rose-400">{scanSpeed} SECONDS</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scanSpeed}
                    onChange={(e) => setScanSpeed(Number(e.target.value))}
                    className="w-full accent-rose-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Col 3: Active Stage Status */}
              <div className="md:col-span-3 flex flex-col justify-between space-y-3.5 md:border-r md:border-slate-800/80 pr-2 text-left">
                <div>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase text-left">
                    LangGraph Daemon State
                  </span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
                    <span className="font-mono text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      {agentPhase}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-1 leading-normal italic">
                    Executing active graph pipeline traversal on safe-run schedules.
                  </p>
                </div>

                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[9px] font-mono leading-none">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thread Status:</span>
                    <strong className="text-emerald-400">THREAD-ON-CRON</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Autonomous Actions:</span>
                    <strong className="text-indigo-400">DISPATCH READY</strong>
                  </div>
                </div>
              </div>

              {/* Col 5: Scrolling logs console */}
              <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between h-[130px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1 shrink-0 font-mono text-[8px] text-slate-500">
                  <span>SENTINEL TELEMETRY DIRECTIVE MEMORY</span>
                  <span className="animate-pulse text-indigo-400 font-bold uppercase flex items-center gap-0.5">● RUNNING DIALOGUES</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 font-mono text-[9px] space-y-1 custom-scrollbar text-left text-emerald-400 h-[85px] select-all">
                  {sentinelLogs.map((log, idx) => (
                    <div key={idx} className="leading-snug">
                      <span className="text-emerald-500 mr-1">&gt;</span> <span className="text-slate-300">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UNIFIED TATA INDUS-MONITOR SCADA COCKPIT */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl select-none animate-feed" id="scada-monitor-suite">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3 bg-slate-950 -mx-4 -mt-4 p-4 rounded-t-2xl">
                <div className="flex items-center gap-2 text-left">
                  <span className="p-1 px-1.5 bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-extrabold rounded font-mono text-[9px] uppercase tracking-wider">
                    SCADA PANEL
                  </span>
                  <div>
                    <h3 className="font-sans font-black text-xs text-white uppercase tracking-wider flex items-center gap-2 leading-none">
                      <span>Jamshedpur Works Industrial SCADA Monitor</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Dynamic 3D Twin telemetry, cascade failure propagation modeling & incident log replayers
                    </p>
                  </div>
                </div>

                {/* Tab selector */}
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-[9.5px] font-mono font-extrabold flex-wrap gap-1">
                  <button
                    onClick={() => setActiveVisualizer("twin")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeVisualizer === "twin" ? "bg-indigo-600 text-white shadow-xs scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🌐 3D Digital Twin</span>
                  </button>
                  <button
                    onClick={() => setActiveVisualizer("flow")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeVisualizer === "flow" ? "bg-indigo-600 text-white shadow-xs scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>⚡ Process Cascade Graph</span>
                  </button>
                  <button
                    onClick={() => setActiveVisualizer("risk")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeVisualizer === "risk" ? "bg-indigo-600 text-white shadow-xs scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>📊 Risk MPI Matrix</span>
                  </button>
                  <button
                    onClick={() => setActiveVisualizer("cascade")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeVisualizer === "cascade" ? "bg-indigo-600 text-white shadow-xs scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🔗 Cascade Impact</span>
                  </button>
                  <button
                    onClick={() => setActiveVisualizer("roi")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeVisualizer === "roi" ? "bg-indigo-600 text-white shadow-xs scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>💰 Live ROI</span>
                  </button>
                  <button
                    onClick={() => setActiveVisualizer("replay")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      activeVisualizer === "replay" ? "bg-indigo-600 text-white shadow-xs scale-105" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>🕒 Incident Replay</span>
                  </button>
                </div>
              </div>

              <div className="min-h-[250px] transition-all duration-300">
                {activeVisualizer === "twin" && <PlantDigitalTwin3D />}
                {activeVisualizer === "flow" && <PlantFlowVisualizer assets={assets} />}
                {activeVisualizer === "risk" && (
                  <RiskPrioritizationMatrix
                    assets={assets}
                    selectedAssetId={selectedAssetId}
                    onSelectAsset={handleSelectAsset}
                    onViewSpares={() => handleRoleChange("supply")}
                  />
                )}
                {activeVisualizer === "cascade" && (
                  <FailureCascadeGraph
                    assets={assets}
                    selectedAssetId={selectedAssetId}
                    onSelectAsset={handleSelectAsset}
                  />
                )}
                {activeVisualizer === "roi" && (
                  <LiveROICalculator
                    defaultDelayCostPerHour={activeAsset?.delayCostPerHour || 22000}
                  />
                )}
                {activeVisualizer === "replay" && <ReportingIncidentCenter assets={assets} />}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Columns 1-4: Telemetry feeds and active warnings ticker */}
              <section className="xl:col-span-4 space-y-6 pr-0 xl:pr-1" id="left-telemetry-column">
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
              <section className="xl:col-span-5 pr-0 xl:pr-1" id="center-reasoning-column">
                <div className="space-y-4">
                  <DiagnosisReport
                    asset={activeAsset}
                    report={activeDiagnosis}
                    loading={diagnosisLoading}
                    onExecuteDiagnosis={handleRunDiagnosis}
                    onSubmitFeedback={handleSubmitFeedback}
                    feedbackLogged={feedbackSaved}
                    onViewSpares={() => handleRoleChange("supply")}
                  />
                  <BusinessImpactPanel asset={activeAsset} assets={assets} />
                </div>
              </section>

              {/* Columns 9-12: Maintenance crew toolkit (Interactive Chat, RAG search and logbook tab selections) */}
              <section className="xl:col-span-3 flex flex-col gap-4" id="right-toolkit-column">
                <VoiceAssistantCore
                  onTriggerDiagnosis={handleVoiceTriggerDiagnosis}
                  onSetTab={setActiveToolTab}
                  onShowCompliance={setShowComplianceMap}
                  apiActive={apiActive}
                />

                {/* Selector Tab Buttons bar */}
                <div className="bg-white border border-slate-200 p-1 rounded-xl flex flex-wrap gap-1 shadow-xs">
                <button
                  onClick={() => setActiveToolTab("chat")}
                  className={`flex-1 min-w-[70px] py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeToolTab === "chat"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => setActiveToolTab("rag")}
                  className={`flex-1 min-w-[70px] py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
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
                  className={`flex-1 min-w-[70px] py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeToolTab === "logbook"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Log</span>
                </button>

                <button
                  onClick={() => setActiveToolTab("sandbox")}
                  className={`flex-1 min-w-[70px] py-1.5 px-1.5 rounded-lg text-[10.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    activeToolTab === "sandbox"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Sandbox</span>
                </button>

                <button
                  onClick={() => setActiveToolTab("ml-engine")}
                  className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-lg text-[10.5px] font-black uppercase transition flex items-center justify-center gap-1 cursor-pointer border glow-indigo-pulse ${
                    activeToolTab === "ml-engine"
                      ? "bg-indigo-700 text-white border-indigo-500 font-black shadow-sm scale-105"
                      : "bg-indigo-50/70 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                  }`}
                >
                  <Binary className="h-3.5 w-3.5" />
                  <span>ML Rigor</span>
                </button>

                <button
                  onClick={() => setActiveToolTab("spares")}
                  className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-lg text-[10.5px] font-black uppercase transition flex items-center justify-center gap-1 cursor-pointer border glow-emerald-pulse ${
                    activeToolTab === "spares"
                      ? "bg-emerald-700 text-white border-emerald-500 font-black shadow-sm scale-105"
                      : "bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>Spares</span>
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
                  <KBBrowser documents={kbDocs} asset={activeAsset} />
                )}

                {activeToolTab === "logbook" && (
                  <LogbookBrowser
                    assets={assets}
                    logbook={logbook}
                    onAddLog={handleAddLogbookEntry}
                  />
                )}

                {activeToolTab === "sandbox" && (
                  <SandboxSimulator
                    asset={activeAsset}
                    onApplySimulatedTelemetry={handleUpdateTelemetry}
                  />
                )}

                {activeToolTab === "ml-engine" && (
                  <MLEnginePanel asset={activeAsset} />
                )}

                {activeToolTab === "spares" && (
                  <SparesProcurementPanel
                    asset={activeAsset}
                    onStockUpdate={() => {
                      // Trigger state sync after purchasing stock to lower system risks
                      const refreshedAssets = ClientStore.getAssets();
                      setAssets(refreshedAssets);
                    }}
                  />
                )}
              </div>
            </section>

            </div>

            {/* MPI TRACE INSPECTOR — Auditable Maintenance Priority Index (v4) */}
            <MPITraceInspector
              assets={assets}
              selectedAssetId={selectedAssetId}
              onSelectAsset={handleSelectAsset}
            />

            {/* DECISION RECOMMENDATION CARDS — Top-3 actionable verdicts (NEW · v5 FINAL) */}
            <DecisionRecommendationCards
              assets={assets}
              onSelectAsset={handleSelectAsset}
              onJumpTo={jumpTo}
            />

            {/* AI OPTIMIZATION ENGINE — deterministic, sensor-grounded $ recommendations */}
            <AIOptimizationPanel assets={assets} onFocusAsset={handleSelectAsset} />

            {/* MODELLED IMPACT TABLE — honest "target outcomes" framing (NEW · v3) */}
            <ModelledImpactTable />

            {/* Extended Plant Operations & Compliance Suite - Solving Visibility Gaps 1:1 */}
            <div className="border-t border-slate-200/50 pt-6 mt-6 space-y-4" id="executive-ops-suite">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-0.5 px-2 bg-indigo-600 font-mono rounded text-[9.5px] font-extrabold text-indigo-50 tracking-widest uppercase">
                      Compliance Suite
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <h3 className="font-sans font-bold text-sm uppercase tracking-wider">
                      Durable Operations Ledger & Lead-Time Spares Console
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Continuous local storage synchronization of expert engineer logs, warehouse lead-time priority indices, and retraining feedback.
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono text-left sm:text-right">
                  System state: <strong className="text-emerald-400">SYNCED (SQL/LOCAL)</strong><br />
                  Lead times monitored: <strong className="text-indigo-300">14 Active Components</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 1. Fully visible ML Engine & Retraining Workstation */}
                <MLEnginePanel asset={activeAsset} />

                {/* 2. Fully visible Spares Procurement Panel */}
                <SparesProcurementPanel
                  asset={activeAsset}
                  onStockUpdate={() => {
                    // Trigger state sync after purchasing stock to lower system risks
                    const refreshedAssets = ClientStore.getAssets();
                    setAssets(refreshedAssets);
                  }}
                />

                {/* 3. Fully visible Digital Logbook Browser */}
                <LogbookBrowser
                  assets={assets}
                  logbook={logbook}
                  onAddLog={handleAddLogbookEntry}
                />
              </div>
            </div>

            {/* WIN-VERDICT FOOTER — final judge-facing pitch (NEW · v5 FINAL) */}
            <section id="win-verdict-banner" className="mw-verdict animate-feed">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 mb-1">
                    Tata Steel AI Hackathon 2026 · Round 2 · Final Submission
                  </div>
                  <h4 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    From Alarm to Action in Seconds.
                  </h4>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    A 36-component cognitive cockpit covering all four official judging axes —
                    <b className="text-white"> Mission &amp; Knowledge Alignment</b>,
                    <b className="text-white"> Responsible &amp; Evidence-Grounded AI</b>,
                    <b className="text-white"> Technical Execution &amp; Feasibility</b>, and
                    <b className="text-white"> Clarity of Communication</b> —
                    with a fully auditable Maintenance Priority Index, top-3 actionable
                    decision cards, a live 3D digital twin, and an autonomous LangGraph
                    sentinel agent. Built solo, deployed on Google Cloud Run.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black uppercase tracking-wide hover:bg-slate-100 transition"
                  >
                    <Github className="h-3.5 w-3.5" /> Source
                  </a>
                  <a
                    href="https://www.youtube.com/watch?v=56f9MAxLd-k"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-wide hover:bg-rose-600 transition"
                  >
                    <Youtube className="h-3.5 w-3.5" /> Demo
                  </a>
                  <a
                    href="https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-black uppercase tracking-wide hover:bg-indigo-600 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Live on Cloud Run
                  </a>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-[9.5px] font-mono uppercase tracking-widest text-indigo-200">Components</div>
                  <div className="text-lg font-black tabular-nums text-white mt-0.5">36</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-[9.5px] font-mono uppercase tracking-widest text-indigo-200">Specialist agents</div>
                  <div className="text-lg font-black tabular-nums text-white mt-0.5">5</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-[9.5px] font-mono uppercase tracking-widest text-indigo-200">Role surfaces</div>
                  <div className="text-lg font-black tabular-nums text-white mt-0.5">6</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-[9.5px] font-mono uppercase tracking-widest text-indigo-200">Cmd-K actions</div>
                  <div className="text-lg font-black tabular-nums text-white mt-0.5">32+</div>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Global Command Palette overlay */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        actions={buildCommandActions({
          handleRoleChange,
          setActiveToolTab,
          setActiveVisualizer,
          setShowComplianceMap,
          setShowDocsModal,
          setShowKeyPanel,
          jumpTo,
        })}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// Command palette action factory — kept outside the component to avoid
// re-creating the array on every render.
// ----------------------------------------------------------------------
function buildCommandActions(ctx: {
  handleRoleChange: (
    role: "operator" | "reliability" | "supervisor" | "supply" | "compliance" | "executive"
  ) => void;
  setActiveToolTab: (
    tab: "chat" | "rag" | "logbook" | "sandbox" | "ml-engine" | "spares"
  ) => void;
  setActiveVisualizer: (
    v: "twin" | "flow" | "replay" | "risk" | "cascade" | "roi"
  ) => void;
  setShowComplianceMap: (b: boolean) => void;
  setShowDocsModal: (b: boolean) => void;
  setShowKeyPanel: (b: boolean) => void;
  jumpTo: (sectionId: string) => void;
}): CmdAction[] {
  const {
    handleRoleChange,
    setActiveToolTab,
    setActiveVisualizer,
    setShowComplianceMap,
    setShowDocsModal,
    jumpTo,
  } = ctx;
  return [
    // Navigation
    { id: "nav-fleet", group: "Navigation", label: "Jump to Fleet Health Strip", hint: "Top-of-page plant-wide health", keywords: ["fleet", "overview", "health"], run: () => jumpTo("fleet-health-strip") },
    { id: "nav-pillars", group: "Navigation", label: "Jump to Win Pillars", hint: "4 judging axes → evidence", keywords: ["win", "judge", "pillars"], run: () => jumpTo("win-pillars-banner") },
    { id: "nav-sentinel", group: "Navigation", label: "Jump to Autonomous Sentinel", hint: "LangGraph daemon log feed", keywords: ["sentinel", "agent", "langgraph"], run: () => jumpTo("sentinel-agent-dashboard") },
    { id: "nav-scada", group: "Navigation", label: "Jump to SCADA Cockpit", hint: "3D Twin · Cascade · Risk · ROI", keywords: ["scada", "cockpit", "twin"], run: () => jumpTo("scada-monitor-suite") },
    { id: "nav-roles", group: "Navigation", label: "Jump to Role Surfaces", hint: "6 role-based command surfaces", keywords: ["role", "persona"], run: () => jumpTo("role-command-surfaces-hud") },
    { id: "nav-optim", group: "Navigation", label: "Jump to AI Optimization Panel", hint: "Sensor-grounded $ recommendations", keywords: ["optimization", "savings", "ai"], run: () => jumpTo("ai-optimization-panel") },
    { id: "nav-ops", group: "Navigation", label: "Jump to Operations Suite", hint: "ML · Spares · Logbook", keywords: ["executive", "ops", "suite"], run: () => jumpTo("executive-ops-suite") },
    { id: "nav-decisions", group: "Navigation", label: "Jump to Top-3 Decision Cards", hint: "Action · Cost · ETA · Deferred risk", keywords: ["decision", "recommendation", "action", "verdict"], run: () => jumpTo("decision-recommendation-cards") },
    { id: "nav-mpi", group: "Navigation", label: "Jump to MPI Trace Inspector", hint: "Auditable priority formula", keywords: ["mpi", "priority", "trace", "formula"], run: () => jumpTo("mpi-trace-inspector") },
    { id: "nav-verdict", group: "Navigation", label: "Jump to Win Verdict", hint: "Final judge-facing pitch", keywords: ["verdict", "win", "footer", "summary"], run: () => jumpTo("win-verdict-banner") },
    { id: "nav-manifest", group: "Navigation", label: "Jump to Three-Layer Reasoning Manifest", hint: "L1 math → L2 RAG → L3 narrator", keywords: ["manifest", "reasoning", "layer", "responsible"], run: () => jumpTo("three-layer-manifest") },
    { id: "nav-trace", group: "Navigation", label: "Jump to Live Agent Trace Console", hint: "Streamed chain-of-thought · 6 specialists", keywords: ["agent", "trace", "thought", "tool", "call", "console"], run: () => jumpTo("agent-trace-console") },
    { id: "nav-whatif", group: "Navigation", label: "Jump to Counter-Factual What-If Lab", hint: "4 scenarios · cost / downtime / P(failure) / SLA", keywords: ["what-if", "counter-factual", "scenario", "simulator"], run: () => jumpTo("counter-factual-simulator") },

    // Roles
    { id: "role-operator", group: "Role", label: "Activate · Control Room Operator", hint: "Live 3D twin & sensors", keywords: ["operator", "control"], run: () => handleRoleChange("operator") },
    { id: "role-reliab", group: "Role", label: "Activate · Reliability / ML Lead", hint: "RUL · anomaly weights", keywords: ["reliability", "ml"], run: () => handleRoleChange("reliability") },
    { id: "role-supv", group: "Role", label: "Activate · Maintenance Crew Lead", hint: "Diagnosis & task order", keywords: ["supervisor", "crew"], run: () => handleRoleChange("supervisor") },
    { id: "role-supply", group: "Role", label: "Activate · Supply Chain Advisor", hint: "Lead-time · warehouse", keywords: ["supply", "spares"], run: () => handleRoleChange("supply") },
    { id: "role-comp", group: "Role", label: "Activate · QA / Compliance Auditor", hint: "Rulebook map", keywords: ["compliance", "qa"], run: () => handleRoleChange("compliance") },
    { id: "role-exec", group: "Role", label: "Activate · Executive Ops Director", hint: "Cascading loss · metrics", keywords: ["executive", "director"], run: () => handleRoleChange("executive") },

    // Visualizer
    { id: "vis-twin", group: "Visualizer", label: "Open 3D Digital Twin", keywords: ["twin", "3d"], run: () => setActiveVisualizer("twin") },
    { id: "vis-flow", group: "Visualizer", label: "Open Process Cascade Graph", keywords: ["flow", "cascade"], run: () => setActiveVisualizer("flow") },
    { id: "vis-risk", group: "Visualizer", label: "Open Risk MPI Matrix", keywords: ["risk", "matrix", "mpi"], run: () => setActiveVisualizer("risk") },
    { id: "vis-cascade", group: "Visualizer", label: "Open Cascade Impact", keywords: ["impact", "propagation"], run: () => setActiveVisualizer("cascade") },
    { id: "vis-roi", group: "Visualizer", label: "Open Live ROI Calculator", keywords: ["roi", "calculator", "$"], run: () => setActiveVisualizer("roi") },
    { id: "vis-replay", group: "Visualizer", label: "Open Incident Replay", keywords: ["replay", "incident"], run: () => setActiveVisualizer("replay") },

    // Toolkit
    { id: "tool-chat", group: "Toolkit", label: "Switch to Wizard Chat", keywords: ["chat", "gemini"], run: () => setActiveToolTab("chat") },
    { id: "tool-rag", group: "Toolkit", label: "Switch to RAG Knowledge Base", keywords: ["rag", "kb", "manuals"], run: () => setActiveToolTab("rag") },
    { id: "tool-log", group: "Toolkit", label: "Switch to Engineer Logbook", keywords: ["logbook", "log"], run: () => setActiveToolTab("logbook") },
    { id: "tool-sandbox", group: "Toolkit", label: "Switch to Sandbox Simulator", keywords: ["sandbox", "simulate"], run: () => setActiveToolTab("sandbox") },
    { id: "tool-ml", group: "Toolkit", label: "Switch to ML Engine", keywords: ["ml", "engine", "rigor"], run: () => setActiveToolTab("ml-engine") },
    { id: "tool-spares", group: "Toolkit", label: "Switch to Spares Procurement", keywords: ["spares", "procure"], run: () => setActiveToolTab("spares") },

    // Compliance / System
    { id: "sys-compliance", group: "Compliance", label: "Open Compliance Rulebook Map", keywords: ["compliance", "rulebook", "map"], run: () => { setShowComplianceMap(true); setShowDocsModal(false); } },
    { id: "sys-docs", group: "System", label: "Open System Documentation", keywords: ["docs", "manual", "system"], run: () => { setShowDocsModal(true); setShowComplianceMap(false); } },

    // External links
    { id: "ext-github", group: "System", label: "Open GitHub Repository", hint: "Source code", keywords: ["github", "code", "source"], run: () => window.open("https://github.com/MahammadRiyazShek/Maintenance-Wizard-Agentic-AI-for-Industrial-Equipment", "_blank") },
    { id: "ext-demo", group: "System", label: "Open YouTube Demo", hint: "Walk-through video", keywords: ["youtube", "demo", "video"], run: () => window.open("https://www.youtube.com/watch?v=56f9MAxLd-k", "_blank") },
    { id: "ext-live", group: "System", label: "Open Live Cloud Run Deployment", hint: "Production URL", keywords: ["live", "deploy", "cloud run"], run: () => window.open("https://tata-steel-maintenance-wizard-622093504538.asia-southeast1.run.app/", "_blank") },
  ];
}
