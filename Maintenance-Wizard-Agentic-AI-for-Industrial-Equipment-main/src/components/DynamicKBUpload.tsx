/**
 * DynamicKBUpload.tsx
 * ----------------------------------------------------------------------------
 * Lets the user inject a new SOP / Manual / Logbook / Incident document into
 * the live RAG store at run-time (POST /api/kb). The new document is picked
 * up by the Retriever Agent on the next query.
 * ----------------------------------------------------------------------------
 */
import React, { useState } from "react";

const CATEGORIES = ["SOP", "Manual", "Logbook", "Incident", "Policy"] as const;

const DynamicKBUpload: React.FC = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("SOP");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim() || !content.trim()) {
      setMsg("title and content are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, content }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`indexed → ${data.doc.id}`);
        setCount(data.totalDocs);
        setTitle("");
        setContent("");
      } else {
        setMsg(`error: ${data.error || res.statusText}`);
      }
    } catch (ex: any) {
      setMsg(`error: ${ex.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function loadFromFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setContent(text);
    if (!title.trim()) setTitle(f.name);
  }

  return (
    <section
      id="dynamic-kb-upload"
      className="mt-6 rounded-lg border border-sky-500/40 bg-slate-900/70 p-5"
    >
      <header>
        <h3 className="text-sm font-black uppercase tracking-wider text-sky-300">
          Dynamic Knowledge-Base Upload
        </h3>
        <p className="text-[11px] text-slate-400 font-mono">
          POST /api/kb — document becomes searchable on the very next query.
        </p>
      </header>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          className="md:col-span-2 rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-200"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste full document content (markdown/plain text supported)…"
        rows={6}
        className="mt-3 w-full rounded border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 font-mono"
      />

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <label className="text-[11px] text-slate-300 cursor-pointer">
          <input type="file" className="hidden" accept=".txt,.md,.log" onChange={loadFromFile} />
          <span className="rounded border border-slate-700 bg-slate-800/60 px-3 py-1.5 hover:bg-slate-700/60">
            📂 load from file
          </span>
        </label>
        <button
          onClick={submit}
          disabled={busy}
          className="rounded border border-sky-500/50 bg-sky-500/20 px-4 py-1.5 text-xs font-bold uppercase text-sky-200 hover:bg-sky-500/30 disabled:opacity-40"
        >
          {busy ? "indexing…" : "index into live RAG"}
        </button>
        {msg && <p className="text-[11px] font-mono text-emerald-300">{msg}</p>}
        {count !== null && (
          <p className="text-[11px] font-mono text-slate-400">total docs = {count}</p>
        )}
      </div>
    </section>
  );
};

export default DynamicKBUpload;
