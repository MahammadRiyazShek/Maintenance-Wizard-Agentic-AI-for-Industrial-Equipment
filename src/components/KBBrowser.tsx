import React, { useState } from "react";
import { KBDocument } from "../types.ts";
import { Folder, Search, Book, HelpCircle, Archive, Clipboard } from "lucide-react";

interface KBBrowserProps {
  documents: KBDocument[];
}

export default function KBBrowser({ documents }: KBBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<KBDocument["category"] | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: (KBDocument["category"] | "All")[] = ["All", "SOP", "Manual", "Historical_Log", "Spare_DB"];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: KBDocument["category"]) => {
    switch (category) {
      case "SOP":
        return <Clipboard className="h-4 w-4 text-sky-500" />;
      case "Manual":
        return <Book className="h-4 w-4 text-emerald-500" />;
      case "Historical_Log":
        return <Archive className="h-4 w-4 text-amber-500" />;
      default:
        return <Folder className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wide">
          RAG Operations Knowledge Base
        </h3>
        <p className="text-[10px] text-slate-400 font-mono">
          Traced plant records and manuals repository
        </p>
      </div>

      {/* Seek Input bar */}
      <div className="flex gap-2 text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manuals, steel safety SOPs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <Search className="absolute left-3 top-2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
              activeCategory === cat
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {cat === "Historical_Log" ? "Failure Logs" : cat === "Spare_DB" ? "Spares Catalog" : cat}
          </button>
        ))}
      </div>

      {/* Docs Accordion listing */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="kb-documents-accordion">
        {filteredDocs.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No matching documents found.</p>
        ) : (
          filteredDocs.map((doc) => (
            <details
              key={doc.id}
              className="group border border-slate-150 rounded-xl bg-slate-50/30 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer transition">
                <div className="flex items-center gap-2.5 min-w-0">
                  {getCategoryIcon(doc.category)}
                  <div className="space-y-0.5 text-left min-w-0">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                      {doc.category === "Historical_Log" ? "Failure analysis" : doc.category}
                    </span>
                    <h4 className="font-bold text-xs text-slate-700 truncate font-sans">
                      {doc.title}
                    </h4>
                  </div>
                </div>
                <span className="text-[9px] text-slate-400 tracking-tight font-mono shrink-0 ml-2 group-open:rotate-180 transition-transform duration-200">
                  ▼ open
                </span>
              </summary>

              <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-line text-[11px]">
                {doc.content}
                <div className="mt-3 pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-mono text-right">
                  System Updated: {doc.lastUpdated}
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
