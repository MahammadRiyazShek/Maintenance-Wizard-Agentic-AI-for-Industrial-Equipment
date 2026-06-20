import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load configuration
dotenv.config();

import { 
  assets, 
  alerts, 
  logbook, 
  feedbacks, 
  kbDocuments, 
  updateAssetTelemetry, 
  acknowledgeAlert 
} from "./server/data_store.ts";
import { DiagnosticResult, EngineerFeedback, LogbookEntry } from "./src/types.ts";
import {
  startAutopilot,
  setAutopilotMode,
  autopilotStatus,
  autopilotEvents,
  autopilotOutcomes,
  resolveAutopilotOutcome,
  autopilotAccuracy,
  AutopilotMode,
} from "./server/autopilot_daemon.ts";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// Initialize Gemini SDK with telemetry headers as mandated by skill
const aiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: aiKey || "DUMMY_KEY_FOR_BUILD_STEP",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Find relevant documents for an asset area or name (RAG)
function getRelevantKBDocs(assetId: string, assetName: string): string {
  const queryWords = (assetName + " " + assetId).toLowerCase();
  
  // Filter KB documents that match terms
  const matches = kbDocuments.filter(doc => {
    const titleMatch = doc.title.toLowerCase().split(/\s+/).some(word => word.length > 2 && queryWords.includes(word));
    const contentMatch = doc.content.toLowerCase().split(/\s+/).some(word => word.length > 3 && queryWords.includes(word));
    return titleMatch || contentMatch || doc.category === "Spare_DB";
  });

  return matches.map(doc => `--- DOCUMENT CATEGORY: ${doc.category} ---
TITLE: ${doc.title}
CONTENT:
${doc.content}
`).join("\n\n");
}

/* =========================================
   REST API ROUTES
   ========================================= */

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "up", timestamp: new Date().toISOString(), keyConfigured: !!aiKey });
});

// Assets list
app.get("/api/assets", (_req, res) => {
  res.json(assets);
});

// Alerts list
app.get("/api/alerts", (_req, res) => {
  res.json(alerts);
});

// Update alert status or acknowledge
app.post("/api/alerts/acknowledge", (req, res) => {
  const { alertId, status } = req.body;
  if (!alertId || !status) {
    return res.status(400).json({ error: "Missing alertId or status" });
  }
  acknowledgeAlert(alertId, status);
  res.json({ success: true, alerts, assets });
});

// Manual adjustment of sensor telemetry for active simulation
app.post("/api/assets/telemetry", (req, res) => {
  const { assetId, temperature, vibration, pressure, flowRate } = req.body;
  if (!assetId) {
    return res.status(400).json({ error: "Missing assetId" });
  }

  // Update telemetry and let data_store adjust warning/critical levels
  updateAssetTelemetry(assetId, { temperature, vibration, pressure, flowRate });

  // If status became critical/warning and there is no active alert, spawn a simulated control room alert
  const asset = assets.find(a => a.id === assetId);
  if (asset && (asset.status === "Critical" || asset.status === "Warning")) {
    const existingAlert = alerts.find(alt => alt.assetId === assetId && alt.status !== "Resolved");
    if (!existingAlert) {
      const isCrit = asset.status === "Critical";
      const newAlert = {
        id: `alt-${Math.floor(Math.random() * 900) + 100}`,
        assetId: assetId,
        assetName: asset.name,
        timestamp: new Date().toISOString(),
        severity: (isCrit ? "critical" : "medium") as "critical" | "medium" | "low" | "high",
        message: `AUTOMATED SYSTEM TRIGGER: ${asset.name} metrics exceeded safety margin. Temp: ${asset.telemetry.temperature}${asset.telemetry.temperatureUnit} (Limit: ${asset.telemetry.temperatureLimit}), Vib: ${asset.telemetry.vibration} mm/s (Limit: ${asset.telemetry.vibrationLimit}). Check immediate water supply or mechanical linkages.`,
        status: "Unacknowledged" as const,
        delayMinutes: 5
      };
      alerts.unshift(newAlert);
    }
  }

  res.json({ success: true, assets, alerts });
});

// Get Knowledge Base documents
app.get("/api/kb", (_req, res) => {
  res.json(kbDocuments);
});

// Dynamic KB upload — indexes a new document into the live RAG store at runtime.
app.post("/api/kb", (req, res) => {
  const { title, category, content } = req.body || {};
  if (!title || !category || !content) {
    return res.status(400).json({ error: "title, category and content are required" });
  }
  const doc = {
    id: `kb-up-${Date.now()}-${Math.floor(Math.random() * 1e5)}`,
    title: String(title).slice(0, 200),
    category: String(category) as any,
    content: String(content),
    lastUpdated: new Date().toISOString(),
  };
  kbDocuments.unshift(doc);
  res.json({ success: true, doc, totalDocs: kbDocuments.length });
});

// Remove a KB document by id (only documents added at runtime can be removed).
app.delete("/api/kb/:id", (req, res) => {
  const idx = kbDocuments.findIndex(d => d.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "document not found" });
  const removed = kbDocuments.splice(idx, 1)[0];
  res.json({ success: true, removed, totalDocs: kbDocuments.length });
});

/* =========================================
   AUTOPILOT DAEMON ENDPOINTS (zero-touch autonomy)
   ========================================= */
app.get("/api/autopilot/status", (_req, res) => {
  res.json(autopilotStatus());
});

app.post("/api/autopilot/mode", (req, res) => {
  const mode = req.body?.mode as AutopilotMode | undefined;
  if (!mode || !["off", "monitor", "autopilot"].includes(mode)) {
    return res.status(400).json({ error: "mode must be off | monitor | autopilot" });
  }
  setAutopilotMode(mode);
  res.json({ success: true, status: autopilotStatus() });
});

app.get("/api/autopilot/events", (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  res.json({ events: autopilotEvents(limit) });
});

app.get("/api/autopilot/outcomes", (_req, res) => {
  res.json({ outcomes: autopilotOutcomes() });
});

app.post("/api/autopilot/outcomes/:id/resolve", (req, res) => {
  const { outcome, note, costAvoided } = req.body || {};
  if (!outcome || !["correct", "incorrect"].includes(outcome)) {
    return res.status(400).json({ error: "outcome must be 'correct' or 'incorrect'" });
  }
  const rec = resolveAutopilotOutcome(
    req.params.id,
    outcome,
    String(note || ""),
    Number(costAvoided || 0)
  );
  if (!rec) return res.status(404).json({ error: "outcome not found" });
  res.json({ success: true, outcome: rec, accuracy: autopilotAccuracy() });
});

app.get("/api/autopilot/accuracy", (_req, res) => {
  res.json(autopilotAccuracy());
});

// Maintenance Logbook
app.get("/api/logbook", (_req, res) => {
  res.json(logbook);
});

// POST logbook
app.post("/api/logbook", (req, res) => {
  const { assetId, actionTaken, engineerName, diagnosticReportId, alertId } = req.body;
  if (!assetId || !actionTaken || !engineerName) {
    return res.status(400).json({ error: "Missing assetId, actionTaken, or engineerName" });
  }

  const asset = assets.find(a => a.id === assetId);
  if (!asset) return res.status(404).json({ error: "Asset not found" });

  const newEntry: LogbookEntry = {
    id: `log-${Date.now()}`,
    assetId,
    assetName: asset.name,
    actionTaken,
    engineerName,
    timestamp: new Date().toISOString(),
    diagnosticReportId,
    alertId,
    status: "Completed"
  };

  logbook.unshift(newEntry);

  // Auto-resolve associated alert if logged
  if (alertId) {
    acknowledgeAlert(alertId, "Resolved");
  }

  res.json({ success: true, entry: newEntry, logbook, alerts, assets });
});

// Get historical corrections and feedback list
app.get("/api/feedback", (_req, res) => {
  res.json(feedbacks);
});

// POST feedback (thumbs, user corrections)
app.post("/api/feedback", (req, res) => {
  const { diagnosticId, assetId, userId, userEmail, rating, correctionNote } = req.body;
  if (!diagnosticId || !assetId || !rating) {
    return res.status(400).json({ error: "Missing diagnosticId, assetId, or rating" });
  }

  const newFeedback: EngineerFeedback = {
    id: `fb-${Date.now()}`,
    diagnosticId,
    assetId,
    userId: userId || "user-eng",
    userEmail: userEmail || "engineer@tatasteel.com",
    rating,
    correctionNote,
    timestamp: new Date().toISOString()
  };

  feedbacks.push(newFeedback);
  res.json({ success: true, feedback: newFeedback, feedbacks });
});

// RUN AGENT DIAGNOSIS CONTEXT-AWARE & RAG RETRIEVAL
app.post("/api/diagnose", async (req, res) => {
  const { assetId, alertId, userNotes } = req.body;

  if (!assetId) {
    return res.status(400).json({ error: "assetId is required for diagnosis" });
  }

  const asset = assets.find(a => a.id === assetId);
  if (!asset) {
    return res.status(404).json({ error: "Asset not found" });
  }

  const alert = alertId ? alerts.find(alt => alt.id === alertId) : null;

  // Retrieve matching manuals, SOP guidelines, and spares parameters
  const ragContext = getRelevantKBDocs(assetId, asset.name);

  // Retrieve prior feedback (engineer learning loop correction logs) for this specific asset!
  const relatedFeedbacks = feedbacks.filter(fb => fb.assetId === assetId && fb.correctionNote);
  const feedbacksContext = relatedFeedbacks.length > 0 
    ? "THE FOLLOWING HISTORICAL CORRECTIONS & CONFIRMATIONS WERE RECORDED BY SENIOR ENGINEERS FOR THIS ASSET. RE-ALIGN ALL SYSTEM INTERPRETED CAUSES AND CONFIDENCES TO MATCH AND PRIORITIZE THESE WORKER EXPERIENCES:\n" + 
      relatedFeedbacks.map(fb => `- Engineer Correction: "${fb.correctionNote}" (Approved: ${fb.rating === "helpful" ? "YES" : "NO"})`).join("\n")
    : "No prior engineer corrections recorded for this asset yet.";

  // Structure system prompt to return a valid JSON object matching our structured parameters
  const systemInstruction = `You are the Tata Steel Maintenance Wizard - an autonomous, expert decision-support AI Agent with almost a decade of process-level metallurgy and engineering diagnostics memory in integrated steel plants.
You diagnose equipment issues, conduct Root Cause Analysis (RCA), estimate Remaining Useful Life (RUL), grade risks, and output a structured preventive/reactive repair strategy.

CRITICAL: Your recommendations MUST be Traceable and Explainable.
Your knowledge includes active sensor readings, SOP scripts, manuals, spare parts catalog details, and most importantly, PRIOR feedback/corrections logged by senior engineers.

Instructions to fulfill constraints:
1. Under "sourcesReferenced", extract text snippets that helped you arrive at your decision from the RAG context.
2. In your reasoning, integrate the provided "HISTORICAL CORRECTIONS & CONFIRMATIONS" (engineer feedback loop). If an engineer correction notes a specific root cause, prioritize that explanation.
3. Calculate Remaining Useful Life based on telemetry trends.
4. Output strict JSON matching the defined schema.`;

  const prompt = `--- ACTIVE TELEMETRY FOR ${asset.name} (ID: ${asset.id}) ---
Current Status: ${asset.status}
Delay Cost: $${asset.delayCostPerHour}/hour
Criticality: ${asset.processCriticality}
Temperature: ${asset.telemetry.temperature} ${asset.telemetry.temperatureUnit} (Limit: ${asset.telemetry.temperatureLimit})
Vibration: ${asset.telemetry.vibration} mm/s (Limit: ${asset.telemetry.vibrationLimit})
Pressure: ${asset.telemetry.pressure} bar (Limit: ${asset.telemetry.pressureLimit})
${asset.telemetry.flowRate !== undefined ? `Cooling Water Flow Rate: ${asset.telemetry.flowRate} L/min (Limit: ${asset.telemetry.flowRateLimit})` : ""}

Historical 4-hour trend:
${JSON.stringify(asset.telemetry.historicalData)}

--- ACTIVE CONTROL ROOM ALARMS ---
${alert ? `Alert Message: "${alert.message}"\nSeverity: ${alert.severity}\nDelay Minutes: ${alert.delayMinutes} mins` : "No active critical alarm. Conducting routine predictive health analysis."}

--- ENGINEER'S EXTRA WORKSPACE OBSERVATION NOTES ---
"${userNotes || "No additional text inputted."}"

--- KNOWLEDGE RETRIEVED (RAG SOPs + manuals) ---
${ragContext}

--- ENGINEER CORRECTIONS & LEARNING FEEDBACK LOOP ---
${feedbacksContext}

Generate the diagnostic report matching the strict JSON layout requested. Use precise engineering terminology, and explain the physical mechanics of the issue logically.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probableFault: { type: Type.STRING, description: "Detailed descriptive summary of the diagnosed mechanical or process-related fault." },
            confidence: { type: Type.NUMBER, description: "Confidence rating percentage between 0 and 100 based on standard diagnostics." },
            rootCauseAnalysis: {
              type: Type.OBJECT,
              properties: {
                primaryCause: { type: Type.STRING, description: "The core root mechanism causing the fault." },
                contributingSensors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sensor indicators that verify this cause." },
                processDefects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Process abnormalities contributing to mechanical breakdown." }
              },
              required: ["primaryCause", "contributingSensors", "processDefects"]
            },
            remainingUsefulLife: {
              type: Type.OBJECT,
              properties: {
                hours: { type: Type.NUMBER, description: "Remaining safe operational life hours before failure." },
                warningMessage: { type: Type.STRING, description: "Critical time-sensitive warnings." },
                catastrophicFailureRisk: { type: Type.STRING, description: "Low, Medium, High, or Critical risk level." }
              },
              required: ["hours", "warningMessage", "catastrophicFailureRisk"]
            },
            priorityAnalysis: {
              type: Type.OBJECT,
              properties: {
                riskClassification: { type: Type.STRING, description: "Overall classification matching inputs: Low, Medium, High, or Critical." },
                urgencyScore: { type: Type.NUMBER, description: "Intervention scoring multiplier (1 to 10)." },
                bottleneckStatus: { type: Type.STRING, description: "Detailed bottleneck description detailing production chain downstream impacts." },
                factors: {
                  type: Type.OBJECT,
                  properties: {
                    criticality: { type: Type.STRING, description: "Factor description: asset's inherent process value." },
                    delaySeverity: { type: Type.STRING, description: "Factor description: hourly delay consequences." },
                    sparesAvailability: { type: Type.STRING, description: "Factor description: storage levels." },
                    leadTime: { type: Type.STRING, description: "Factor description: procurement times." }
                  },
                  required: ["criticality", "delaySeverity", "sparesAvailability", "leadTime"]
                }
              },
              required: ["riskClassification", "urgencyScore", "bottleneckStatus", "factors"]
            },
            maintenancePlan: {
              type: Type.OBJECT,
              properties: {
                immediateActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "SOP-backed actions to attempt immediately while executing online." },
                shutDownActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions requiring absolute equipment deceleration during repair intervals." },
                monitoringInstructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Parameters for continuing observation schedules." },
                spareProcurementStrategy: { type: Type.STRING, description: "Procurement strategy covering spares databases and stock lead times." }
              },
              required: ["immediateActions", "shutDownActions", "monitoringInstructions", "spareProcurementStrategy"]
            },
            sourcesReferenced: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  section: { type: Type.STRING },
                  snippet: { type: Type.STRING }
                },
                required: ["type", "title", "snippet"]
              },
              description: "SOP, Manual, or Logs snippets that backed the reasoning."
            }
          },
          required: [
            "probableFault",
            "confidence",
            "rootCauseAnalysis",
            "remainingUsefulLife",
            "priorityAnalysis",
            "maintenancePlan",
            "sourcesReferenced"
          ]
        }
      }
    });

    const text = response.text || "{}";
    const diagnosticReport = JSON.parse(text) as DiagnosticResult;
    
    // Add dynamic feedback link id matching the diagnostic
    res.json({
      diagnosticId: `diag-${Date.now()}`,
      assetId,
      alertId,
      report: diagnosticReport
    });

  } catch (error: any) {
    console.error("Gemini Diagnostic Call Failed:", error);
    res.status(500).json({ error: "Failed to compile diagnostic reasoning from Gemini API.", details: error.message });
  }
});

// INTERACTIVE TROUBLESHOOTING MULTI-TURN CHAT ENDPOINT
app.post("/api/chat", async (req, res) => {
  const { assetId, alertId, message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing query message" });
  }

  const asset = assetId ? assets.find(a => a.id === assetId) : null;
  const alert = alertId ? alerts.find(a => a.id === alertId) : null;
  const ragContext = asset ? getRelevantKBDocs(asset.id, asset.name) : "";

  const systemInstruction = `You are the Tata Steel Maintenance Wizard chat module. You assist operators, maintenance crews, and mechanical engineers with continuous troubleshooting.
You have access to live metadata of the asset and related logs. Be precise, highly professional, direct, and explain the metallurgy/physics clearly.
Always reference SOP numbers and manuals where possible to maintain traceablity.

${asset ? `CURRENT ASSET OF CONTEXT: ${asset.name}
Telemetry: Temp: ${asset.telemetry.temperature}°C, Vib: ${asset.telemetry.vibration} mm/s, Pres: ${asset.telemetry.pressure} bar
Status: ${asset.status}` : "General Steel Plant maintenance mode."}
${alert ? `ACTIVE PROBLEM: "${alert.message}"` : ""}

KNOWLEDGE BASES RETRIEVED (RAG):
${ragContext}`;

  try {
    // Standard chat schema
    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.text }]
    }));

    // Start Chat session using the proper SDK
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction,
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({
      text: response.text,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Chat failure:", error);
    res.status(500).json({ error: "Maintenance Wizard chat was unable to process this instruction.", details: error.message });
  }
});

/* =========================================
   VITE & STATIC ASSET SERVER MIDDLEWARE
   ========================================= */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middlewares to serve client files in development
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback route for routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Maintenance Wizard Server running at http://0.0.0.0:${PORT}`);
    // Boot the autonomous daemon in autopilot mode with a 5s interval for fast live evaluation responses
    startAutopilot({ mode: "autopilot", intervalMs: 5000 });
    console.log(`[autopilot] daemon armed · mode=autopilot · interval=5000 ms`);
  });
}

startServer();
