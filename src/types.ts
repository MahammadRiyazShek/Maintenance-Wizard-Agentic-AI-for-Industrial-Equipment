export interface Asset {
  id: string;
  name: string;
  area: "Ironmaking" | "Steelmaking" | "Rolling Mill" | "Utilities";
  status: "Healthy" | "Warning" | "Critical";
  delayCostPerHour: number; // In USD
  processCriticality: "High" | "Medium" | "Low" | "Critical";
  telemetry: {
    temperature: number;
    temperatureUnit: string;
    temperatureLimit: number;
    vibration: number; // in mm/s
    vibrationLimit: number;
    pressure: number; // in bar
    pressureLimit: number;
    flowRate?: number; // in L/min
    flowRateLimit?: number;
    historicalData: { time: string; temperature: number; vibration: number; pressure: number }[];
  };
}

export interface ControlRoomAlert {
  id: string;
  assetId: string;
  assetName: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  status: "Unacknowledged" | "Investigating" | "Resolved";
  delayMinutes: number;
}

export interface DiagnosticResult {
  assetId: string;
  alertId?: string;
  timestamp: string;
  probableFault: string;
  confidence: number; // Percentage
  rootCauseAnalysis: {
    primaryCause: string;
    contributingSensors: string[];
    processDefects: string[];
  };
  remainingUsefulLife: {
    hours: number;
    warningMessage?: string;
    catastrophicFailureRisk: "Low" | "Medium" | "High" | "Critical";
  };
  priorityAnalysis: {
    riskClassification: "Low" | "Medium" | "High" | "Critical";
    urgencyScore: number; // 0 to 10
    bottleneckStatus: string;
    factors: {
      criticality: string;
      delaySeverity: string;
      sparesAvailability: string;
      leadTime: string;
    };
  };
  maintenancePlan: {
    immediateActions: string[];
    shutDownActions: string[];
    monitoringInstructions: string[];
    spareProcurementStrategy: string;
  };
  sourcesReferenced: {
    type: "SOP" | "Manual" | "Historical_Record" | "Spare_DB";
    title: string;
    section?: string;
    snippet: string;
  }[];
}

export interface EngineerFeedback {
  id: string;
  diagnosticId: string;
  assetId: string;
  userId: string;
  userEmail: string;
  rating: "helpful" | "unhelpful";
  correctionNote?: string;
  timestamp: string;
}

export interface LogbookEntry {
  id: string;
  assetId: string;
  assetName: string;
  actionTaken: string;
  engineerName: string;
  timestamp: string;
  diagnosticReportId?: string;
  alertId?: string;
  status: "Completed" | "In_Progress";
  feedbackSaved?: boolean;
}

export interface KBDocument {
  id: string;
  category: "SOP" | "Manual" | "Historical_Log" | "Spare_DB";
  title: string;
  content: string;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

/* ---------------------------------------------------------------------------
 * Extended types for v8 — MPI, AI4I, LangGraph, Outcome Repository
 * ------------------------------------------------------------------------- */

export type FailureMode = "TWF" | "HDF" | "PWF" | "OSF" | "OK";

export interface MPITraceStep {
  step: number;
  name: string;
  inputs: Record<string, number | string>;
  formula: string;
  output: number;
  weightApplied: number;
  contribution: number;
}

export interface MPIResult {
  index: number;
  band: "Low" | "Medium" | "High" | "Critical";
  trace: MPITraceStep[];
  dollarImpactPerHour: number;
  projectedDowntimeHours: number;
  projectedLoss: number;
  generatedAt: string;
}

export interface AutopilotEvent {
  id: string;
  ts: string;
  assetId: string;
  assetName: string;
  phase: "scan" | "anomaly" | "diagnose" | "plan" | "dispatch" | "verify" | "skip";
  message: string;
  mpi?: number;
  ai4iMode?: string;
  ai4iProbability?: number;
  workOrderId?: string;
}
