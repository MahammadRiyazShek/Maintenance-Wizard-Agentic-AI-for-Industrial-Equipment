import React, { useState } from "react";
import { LogbookEntry, Asset } from "../types.ts";
import { Clipboard, User, Calendar, CheckSquare, PlusCircle, Download } from "lucide-react";

interface LogbookBrowserProps {
  assets: Asset[];
  logbook: LogbookEntry[];
  onAddLog: (log: { assetId: string; actionTaken: string; engineerName: string; alertId?: string }) => void;
}

export default function LogbookBrowser({
  assets,
  logbook,
  onAddLog
}: LogbookBrowserProps) {
  const [assetId, setAssetId] = useState(assets[0]?.id || "");
  const [actionInput, setActionInput] = useState("");
  const [engineerInput, setEngineerInput] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !actionInput.trim() || !engineerInput.trim()) return;
    
    // Dispatch
    onAddLog({
      assetId,
      actionTaken: actionInput.trim(),
      engineerName: engineerInput.trim()
    });

    // Reset Form
    setActionInput("");
    setEngineerInput("");
    setShowForm(false);
  };

  const handleExportCSV = () => {
    if (logbook.length === 0) return;
    const headers = ["Log ID", "Asset Name", "Action Undertaken", "Lead Engineer", "Timestamp"];
    const rows = logbook.map(log => [
      log.id,
      `"${log.assetName.replace(/"/g, '""')}"`,
      `"${log.actionTaken.replace(/"/g, '""')}"`,
      `"${log.engineerName.replace(/"/g, '""')}"`,
      log.timestamp
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tata_steel_maintenance_logbook_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm space-y-5">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <Clipboard className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-800">
              Digital Maintenance Logbook
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Audit trails of repair activities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {logbook.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              id="btn-export-logbook-csv"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer font-sans"
              title="Export Logbook as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            id="btn-toggle-add-log"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{showForm ? "View Logs" : "Record Action"}</span>
          </button>
        </div>
      </div>

      {/* Manual Insert Form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
          <h4 className="font-sans font-bold text-xs text-slate-700 uppercase tracking-wider">
            Log Manual Repair Task Outcome
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                Select Machinery Asset
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                Operator / Repair Engineer Name
              </label>
              <input
                type="text"
                value={engineerInput}
                onChange={(e) => setEngineerInput(e.target.value)}
                placeholder="e.g. M. Riyaz"
                required
                className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide font-mono">
              Actions Undertaken & Physical Rectifications Complete
            </label>
            <textarea
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              placeholder="e.g. Lubricated double-row spherical drive bearings with Klüberplex grease, tightened flange bolts. Telemetry returned to nominal operating limits."
              required
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-sans focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            id="btn-submit-maintenance-log"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Save and Log Work Order Complete
          </button>
        </form>
      ) : (
        /* Logs Listing viewer */
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1" id="logbook-listing">
          {logbook.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No historical records logged yet.</p>
          ) : (
            logbook.map((log) => (
              <div
                key={log.id}
                id={`log-card-${log.id}`}
                className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="font-bold text-indigo-700 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {log.assetName}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 font-sans leading-normal">
                  {log.actionTaken}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Engineer: <strong className="text-slate-700 font-bold">{log.engineerName}</strong></span>
                  </span>
                  
                  <span className="flex items-center gap-1 text-emerald-600 font-bold uppercase">
                    <CheckSquare className="h-3.5 w-3.5" /> Checked Complete
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
