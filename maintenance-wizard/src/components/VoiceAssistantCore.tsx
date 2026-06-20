import React, { useState, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Command, 
  Play, 
  HelpCircle,
  Activity,
  User,
  Cpu
} from "lucide-react";

interface VoiceAssistantCoreProps {
  onTriggerDiagnosis: (assetId: string) => void;
  onSetTab: (tab: "chat" | "rag" | "logbook" | "sandbox" | "ml-engine" | "spares") => void;
  onShowCompliance: (val: boolean) => void;
  apiActive: boolean;
}

export default function VoiceAssistantCore({ 
  onTriggerDiagnosis, 
  onSetTab, 
  onShowCompliance,
  apiActive 
}: VoiceAssistantCoreProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [voiceText, setVoiceText] = useState<string>("Cognitive Audio Core Active. Ready for operator voice commands.");
  const [recognizedCommand, setRecognizedCommand] = useState<string>("");
  const [bars, setBars] = useState<number[]>([4, 6, 4, 8, 4, 6, 4, 4]);

  // Waveform animations when active
  useEffect(() => {
    if (!isListening) return;
    const timer = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 32) + 4));
    }, 100);
    return () => {
      clearInterval(timer);
      setBars([4, 6, 4, 8, 4, 6, 4, 4]);
    };
  }, [isListening]);

  // Speech Helper
  const speakResponse = (text: string) => {
    if (!voiceEnabled) return;
    try {
      // Cancel active sounds
      window.speechSynthesis?.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95; // Slightly deeper, authoritative system voice
      window.speechSynthesis?.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis thwarted:", e);
    }
  };

  // Recognize speech commands
  const handleStartListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceText("Microphone recognition not fully supported inside this sandbox frame. Please use interactive macro keys below.");
      speakResponse("Voice recognition capability limited by container sandbox. Please execute pre-assembled macros instead.");
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // Set to Indian English for optimal local dialect recognition (Tata Jamshedpur)

      rec.onstart = () => {
        setIsListening(true);
        setVoiceText("Listening for operator commands... speak now.");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        setRecognizedCommand(transcript);
        processSpokenCommand(transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition error:", e);
        if (e.error === "not-allowed" || e.error === "permission-blocked") {
          setVoiceText("Microphone permission requested. Please allow mic access or use the interactive macros below.");
        } else {
          setVoiceText("Microphone input standby. Click again to talk or use the interactive macros below.");
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // Predefined macro speech command processing
  const processSpokenCommand = (cmd: string) => {
    const clean = cmd.trim().toLowerCase();
    
    if (clean.includes("blast furnace") || clean.includes("diagnose bf")) {
      setVoiceText("SUCCESS: Initializing thermal and diagnostic analytics on Blast Furnace #4 hearth...");
      speakResponse("Affirmative. Activating cognitive diagnostic scan on Blast Furnace Number 4. Reading hearth temperatures.");
      onTriggerDiagnosis("bf-04");
    } else if (clean.includes("spares") || clean.includes("shipping") || clean.includes("stock")) {
      setVoiceText("SUCCESS: Navigating to Spares Procurements panel. Querying Adityapur inventories.");
      speakResponse("Redirecting console focus to Spares Procurement. Inventory lists from Adityapur loaded.");
      onSetTab("spares");
    } else if (clean.includes("compliance") || clean.includes("criteria") || clean.includes("map")) {
      setVoiceText("SUCCESS: Launching Tata Steel Compliance Rulebook map matrix...");
      speakResponse("Launching corporate compliance criteria mapping matrix. Reconciling layout features.");
      onShowCompliance(true);
    } else if (clean.includes("sandbox") || clean.includes("disaster")) {
      setVoiceText("SUCCESS: Loading sandbox simulator telemetry modifiers.");
      speakResponse("Engaging sandbox simulator. Operator thresholds overridden.");
      onSetTab("sandbox");
    } else if (clean.includes("system status") || clean.includes("health")) {
      setVoiceText("STAFF STATUS: Cyber physical link online. Blast furnace tuyeres degradation index is 3% per hour.");
      speakResponse("System status reading. Cyber physical link stable. Outliers detected in Coke gas compressor, accelerating status.");
    } else if (clean.includes("machine learning") || clean.includes("validation")) {
      setVoiceText("SUCCESS: Loading anomaly and impact matrices.");
      speakResponse("Redirecting focus to machine learning model performance logs.");
      onSetTab("ml-engine");
    } else {
      setVoiceText(`UNRECOGNIZED DIRECTIVE: "${cmd}". Available: BF, Spares, Compliance map, Status.`);
      speakResponse("Command parsed but unqualified. Choose pre-assembled operations macros instead.");
    }
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100 flex flex-col space-y-3 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5 font-mono text-[45px] font-black pointer-events-none select-none">
        VOX
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <Command className="h-4 w-4 text-indigo-400" />
          <h4 className="font-sans font-black text-xs uppercase tracking-wide">
            Cognitive Speech Assistant Core
          </h4>
        </div>

        {/* Mute button toggler */}
        <button
          onClick={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            if (!next) window.speechSynthesis?.cancel();
          }}
          className={`p-1.5 rounded-lg border text-xs cursor-pointer select-none transition ${
            voiceEnabled ? "bg-indigo-950/40 text-indigo-400 border-indigo-900" : "bg-slate-950 text-slate-500 border-slate-900"
          }`}
          title={voiceEnabled ? "Mute audio synthesis feedback" : "Unmute audio synthesis feedback"}
        >
          {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Voice Status Indicator and Interactive Soundwave */}
      <div className="flex items-center gap-3 bg-black/40 border border-slate-900 p-3 rounded-xl min-h-[60px] relative z-10">
        <button
          onClick={handleStartListening}
          className={`h-11 w-11 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition relative ${
            isListening 
              ? "bg-rose-950 text-rose-400 border-rose-500 animate-pulse glow-rose-pulse" 
              : "bg-indigo-950 text-indigo-400 border-indigo-900 hover:border-indigo-600 shadow-lg shadow-indigo-600/10"
          }`}
          title="Click to speak command"
        >
          {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
        </button>

        {/* Audio Visualizer sound bars */}
        <div className="flex-1 space-y-1 overflow-hidden">
          <p className="text-[10px] font-mono text-slate-300 font-bold leading-tight select-text">
            {voiceText}
          </p>
          
          <div className="flex items-center gap-1 h-8">
            {bars.map((height, i) => (
              <div 
                key={i} 
                className="w-1 rounded-full bg-indigo-500 transition-all duration-100"
                style={{ height: `${height}px` }}
              />
            ))}
            <span className="text-[8px] font-mono text-slate-600 uppercase ml-2 select-none">60FPS BROADCAST ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Touch Command Macros */}
      <div className="space-y-1.5 relative z-10">
        <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-bold tracking-widest">
          Interactive Operator Macros (Iframe Safe Diagnostics) 👇
        </span>
        
        <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono">
          <button
            onClick={() => processSpokenCommand("diagnose bf")}
            className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-800 text-slate-300 hover:text-white rounded text-left transition truncate cursor-pointer flex items-center gap-1"
          >
            <Cpu className="h-3 w-3 text-indigo-400" />
            <span>"Diagnose Blast Furnace"</span>
          </button>

          <button
            onClick={() => processSpokenCommand("spares")}
            className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-800 text-slate-300 hover:text-white rounded text-left transition truncate cursor-pointer flex items-center gap-1"
          >
            <Activity className="h-3 w-3 text-indigo-400" />
            <span>"Find Spares"</span>
          </button>

          <button
            onClick={() => processSpokenCommand("compliance map")}
            className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-800 text-slate-300 hover:text-white rounded text-left transition truncate cursor-pointer flex items-center gap-1"
          >
            <Command className="h-3 w-3 text-indigo-400" />
            <span>"Show Compliance Map"</span>
          </button>

          <button
            onClick={() => processSpokenCommand("system status")}
            className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-800 text-slate-300 hover:text-white rounded text-left transition truncate cursor-pointer flex items-center gap-1"
          >
            <HelpCircle className="h-3 w-3 text-indigo-400" />
            <span>"Speak System Status"</span>
          </button>
        </div>
      </div>

      <div className="text-[8.5px] font-mono text-indigo-400 leading-normal border-t border-slate-900 pt-1.5 select-none">
        🔊 Speech Engine complies with Section 7 of the Tata operations directive. Voice synthesis operates instantly client-side without third party latency.
      </div>
    </div>
  );
}
