import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Command, ChevronRight } from "lucide-react";

export interface CmdAction {
  id: string;
  label: string;
  hint?: string;
  group:
    | "Navigation"
    | "Role"
    | "Visualizer"
    | "Toolkit"
    | "AI"
    | "Compliance"
    | "System";
  keywords?: string[];
  shortcut?: string;
  run: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  actions: CmdAction[];
}

/**
 * CommandPalette — Cmd+K / Ctrl+K fast-nav for judges & operators.
 *  - Fuzzy contains-search across label + keywords
 *  - Keyboard navigation (↑ ↓ Enter Esc)
 *  - Grouped, glassy enterprise look matching the existing slate / indigo theme
 *
 * No external deps — pure React + Tailwind.
 */
export default function CommandPalette({ open, onClose, actions }: Props) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Filter + group
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => {
      const hay = [a.label, a.hint || "", ...(a.keywords || [])].join(" ").toLowerCase();
      return q.split(/\s+/).every((token) => hay.includes(token));
    });
  }, [query, actions]);

  const grouped = useMemo(() => {
    const map: Record<string, CmdAction[]> = {};
    filtered.forEach((a) => {
      if (!map[a.group]) map[a.group] = [];
      map[a.group].push(a);
    });
    return map;
  }, [filtered]);

  const flat = useMemo(() => Object.values(grouped).flat(), [grouped]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = flat[activeIdx];
        if (target) {
          target.run();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, activeIdx, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4 bg-slate-950/70 backdrop-blur-sm animate-feed"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="h-4 w-4 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump anywhere — type role, visualizer, tool, or action…"
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none font-sans text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {flat.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500 text-xs font-mono">
              No matches. Try keywords like <span className="text-indigo-300">operator</span>,{" "}
              <span className="text-indigo-300">twin</span>, <span className="text-indigo-300">spares</span>,{" "}
              <span className="text-indigo-300">roi</span>, <span className="text-indigo-300">compliance</span>.
            </div>
          ) : (
            (Object.entries(grouped) as [string, CmdAction[]][]).map(([group, items]) => (
              <div key={group} className="py-2">
                <div className="px-4 py-1 text-[9.5px] font-mono font-extrabold uppercase tracking-widest text-slate-500">
                  {group}
                </div>
                {items.map((a) => {
                  const flatIdx = flat.indexOf(a);
                  const isActive = flatIdx === activeIdx;
                  return (
                    <button
                      key={a.id}
                      onMouseEnter={() => setActiveIdx(flatIdx)}
                      onClick={() => {
                        a.run();
                        onClose();
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                        isActive
                          ? "bg-indigo-600/20 border-l-2 border-indigo-400"
                          : "border-l-2 border-transparent hover:bg-slate-800/60"
                      }`}
                    >
                      <Command
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-indigo-300" : "text-slate-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-sans font-bold text-white truncate">
                          {a.label}
                        </div>
                        {a.hint && (
                          <div className="text-[10px] font-mono text-slate-400 truncate">
                            {a.hint}
                          </div>
                        )}
                      </div>
                      {a.shortcut && (
                        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-slate-400 shrink-0">
                          {a.shortcut}
                        </kbd>
                      )}
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-indigo-300" : "text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 mr-1">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↓</kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">⏎</kbd>{" "}
              open
            </span>
          </div>
          <span className="text-indigo-400 font-bold tracking-wider">MAINTENANCE WIZARD · ⌘K</span>
        </div>
      </div>
    </div>
  );
}
