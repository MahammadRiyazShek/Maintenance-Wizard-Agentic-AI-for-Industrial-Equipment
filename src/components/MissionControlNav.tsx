import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Cpu,
  Sparkles,
  AlertTriangle,
  Wrench,
  BookOpenCheck,
  TrendingUp,
  Command as CmdIcon,
} from "lucide-react";

/**
 * MissionControlNav — sticky 7-tab Mission Control navigation rail
 * ───────────────────────────────────────────────────────────────────
 * Inspired by Man-of-Steel & OREON top-of-page command surfaces.
 * Each tab is an anchor-jump to an existing section id in App.tsx.
 * Pure CSS scroll spy + smooth scroll, no react-router dependency
 * (keeps the SPA single-file Cloud-Run-friendly).
 *
 *   Mission Control          → headline-kpi-banner
 *   Asset Explorer           → left-telemetry-column / scada-monitor-suite
 *   AI Copilot               → center-reasoning-column / right-toolkit-column
 *   Intelligence             → ai-confidence-index → predicted-event-timeline
 *   Maintenance Priority     → mpi-trace-inspector (NEW · v4)
 *   Reports & Logbook        → executive-ops-suite
 *   Knowledge Vault          → opens RAG tab + jumps to right toolkit
 */
interface Props {
  onJumpTo: (sectionId: string) => void;
  onOpenCmd: () => void;
  onSetTab?: (tab: "chat" | "rag" | "logbook" | "sandbox" | "ml-engine" | "spares") => void;
}

const TABS = [
  { id: "headline-kpi-banner", label: "Mission Control", desc: "Plant-wide pulse", Icon: LayoutDashboard, accent: "from-indigo-500 to-blue-500" },
  { id: "scada-monitor-suite", label: "Asset Explorer", desc: "3D twin & cascade", Icon: Cpu, accent: "from-sky-500 to-cyan-500" },
  { id: "center-reasoning-column", label: "AI Copilot", desc: "Diagnose · chat · plan", Icon: Sparkles, accent: "from-fuchsia-500 to-purple-500" },
  { id: "three-layer-manifest", label: "Reasoning Contract", desc: "L1 math → L2 RAG → L3", Icon: Sparkles, accent: "from-violet-500 to-indigo-600" },
  { id: "agent-trace-console", label: "Agent Trace", desc: "Live chain-of-thought", Icon: Sparkles, accent: "from-indigo-600 to-blue-600" },
  { id: "counter-factual-simulator", label: "What-If Lab", desc: "4 parallel futures", Icon: Sparkles, accent: "from-fuchsia-600 to-rose-600" },
  { id: "ai-confidence-index", label: "Intelligence", desc: "Confidence · forecast", Icon: AlertTriangle, accent: "from-amber-500 to-rose-500" },
  { id: "mpi-trace-inspector", label: "Maintenance Priority", desc: "MPI · transparent formula", Icon: TrendingUp, accent: "from-rose-500 to-pink-600" },
  { id: "decision-recommendation-cards", label: "Decisions", desc: "Top-3 actionable verdicts", Icon: Wrench, accent: "from-indigo-600 to-violet-700" },
  { id: "executive-ops-suite", label: "Reports & Logbook", desc: "ML · spares · ledger", Icon: Wrench, accent: "from-emerald-500 to-teal-500" },
  { id: "kb-vault", label: "Knowledge Vault", desc: "SOPs · manuals · cite", Icon: BookOpenCheck, accent: "from-slate-700 to-slate-900", isToolTab: "rag" as const },
];

export default function MissionControlNav({ onJumpTo, onOpenCmd, onSetTab }: Props) {
  const [active, setActive] = useState<string>("headline-kpi-banner");

  // Scroll-spy: pick the tab whose target is closest to top of viewport
  useEffect(() => {
    const onScroll = () => {
      let best: { id: string; dist: number } | null = null;
      for (const t of TABS) {
        const el = document.getElementById(t.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - 140);
        if (rect.top < window.innerHeight && (!best || dist < best.dist)) {
          best = { id: t.id, dist };
        }
      }
      if (best) setActive(best.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="sticky top-[64px] z-30 -mx-4 md:-mx-6 mb-4 px-4 md:px-6 py-2 bg-slate-50/85 backdrop-blur-md border-y border-slate-200/80 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
      id="mission-control-nav"
      aria-label="Mission Control navigation"
    >
      <div className="max-w-[1600px] mx-auto flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {TABS.map((t) => {
          const isActive = active === t.id;
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (t.isToolTab && onSetTab) onSetTab(t.isToolTab);
                onJumpTo(t.id === "kb-vault" ? "right-toolkit-column" : t.id);
              }}
              className={`group shrink-0 flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? `bg-gradient-to-r ${t.accent} text-white border-transparent shadow-sm scale-[1.02] font-bold`
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:shadow-sm"
              }`}
            >
              <span
                className={`flex items-center justify-center h-6 w-6 rounded-lg ${
                  isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-600"}`} />
              </span>
              <div className="leading-tight">
                <div className={`text-[11px] font-black tracking-tight ${isActive ? "text-white" : "text-slate-900"}`}>
                  {t.label}
                </div>
                <div className={`text-[9px] font-mono ${isActive ? "text-white/85" : "text-slate-400"}`}>
                  {t.desc}
                </div>
              </div>
            </button>
          );
        })}

        {/* Cmd K pill at the end */}
        <div className="ml-auto shrink-0 hidden md:flex items-center">
          <button
            onClick={onOpenCmd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-[11px] font-bold hover:border-indigo-400 hover:text-indigo-700 transition cursor-pointer"
          >
            <CmdIcon className="h-3.5 w-3.5" />
            <span>Command Palette</span>
            <kbd className="ml-1 px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px] font-mono">⌘K</kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
