import React from "react";
import { ControlRoomAlert } from "../types.ts";
import { AlertCircle, Clock, ChevronRight, Eye } from "lucide-react";

interface AlertListProps {
  alerts: ControlRoomAlert[];
  selectedAssetId: string | null;
  onSelectAlert: (alert: ControlRoomAlert) => void;
  onAcknowledge: (alertId: string, status: "Investigating" | "Resolved") => void;
}

export default function AlertList({
  alerts,
  selectedAssetId,
  onSelectAlert,
  onAcknowledge
}: AlertListProps) {
  const activeAlerts = alerts.filter(a => a.status !== "Resolved");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-bold text-sm text-slate-700 tracking-wider uppercase">
          2. Active Alarms Ticker ({activeAlerts.length})
        </h3>
        {activeAlerts.length > 0 && (
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
        )}
      </div>

      {activeAlerts.length === 0 ? (
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">All systems normal in the control room.</p>
          <p className="text-[10px] text-slate-400 font-mono">No active unacknowledged anomalies</p>
        </div>
      ) : (
        <div className="space-y-3" id="alerts-ticker-container">
          {activeAlerts.map((alert) => {
            const isTargeted = selectedAssetId === alert.assetId;
            
            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                onClick={() => onSelectAlert(alert)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs scale-100 hover:scale-[1.01] ${
                  isTargeted
                    ? "bg-amber-50 border-amber-400 shadow-sm"
                    : alert.severity === "critical"
                    ? "bg-rose-50/50 border-rose-100 hover:border-rose-200"
                    : "bg-amber-50/20 border-amber-100 hover:border-amber-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {alert.severity === "critical" ? (
                      <span className="flex p-1 bg-rose-100 rounded text-rose-600">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="flex p-1 bg-amber-100 rounded text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        {alert.id.toUpperCase()} • {alert.assetName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          alert.severity === "critical"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-sans text-slate-700 leading-normal line-clamp-3">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Active for {alert.delayMinutes} mins</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {alert.status === "Unacknowledged" ? (
                          <button
                            id={`btn-ack-${alert.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAcknowledge(alert.id, "Investigating");
                            }}
                            className="px-2 py-0.5 text-[9px] font-bold font-mono bg-amber-500 hover:bg-amber-600 text-white rounded transition"
                          >
                            ACKNOWLEDGE
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-amber-600 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                            Investigating
                          </span>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
