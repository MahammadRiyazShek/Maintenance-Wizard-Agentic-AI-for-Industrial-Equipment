import { Asset, ControlRoomAlert, DiagnosticResult, KBDocument, ChatMessage, EngineerFeedback } from "../types.ts";
import { INITIAL_KB_DOCUMENTS, ClientStore } from "./dataStore.ts";

// Helper to check for client-side API keys
export function getSavedApiKey(): string {
  // 1. Check local storage
  const localKey = localStorage.getItem("ts_mw_api_key");
  if (localKey && localKey.trim()) return localKey.trim();

  // 2. Check Vite environment variable safely
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();

  return "";
}

export function saveApiKey(key: string) {
  if (key) {
    localStorage.setItem("ts_mw_api_key", key);
  } else {
    localStorage.removeItem("ts_mw_api_key");
  }
}

// Helper: Filter knowledge based on relevance for client retrieval
function getClientRelevantKBDocs(assetId: string, assetName: string): string {
  const queryWords = (assetName + " " + assetId).toLowerCase();
  const docs = INITIAL_KB_DOCUMENTS.filter(doc => {
    const titleMatch = doc.title.toLowerCase().split(/\s+/).some(word => word.length > 2 && queryWords.includes(word));
    const contentMatch = doc.content.toLowerCase().split(/\s+/).some(word => word.length > 3 && queryWords.includes(word));
    return titleMatch || contentMatch || doc.category === "Spare_DB";
  });

  return docs.map(doc => `[Category: ${doc.category}] TITLE: ${doc.title}\nCONTENT: ${doc.content}`).join("\n\n");
}

/* ========================================================
   1. LIVE CLIENT-SIDE GEMINI REST API DEPLOYER
   ======================================================== */
async function callGeminiLiveAPI(apiKey: string, prompt: string, systemInstruction: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini remote API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty candidate list returned by Gemini server.");
  }
  return text;
}

/* ========================================================
   2. INTELLIGENT RULE-BASED EXPERT COGNITIVE SIMULATOR
   ======================================================== */
export function generateSimulatedDiagnosis(
  asset: Asset,
  alert: ControlRoomAlert | null,
  userNotes: string,
  feedbacks: EngineerFeedback[]
): DiagnosticResult {
  const hasNotes = userNotes && userNotes.trim().length > 0;
  
  // Custom user observations + any expert corrections in the feedback loop!
  const relatedFixes = feedbacks.filter(fb => fb.assetId === asset.id && fb.correctionNote);
  const activeCorrection = relatedFixes.length > 0 ? relatedFixes[relatedFixes.length - 1].correctionNote : null;

  // Let's build distinct, highly nuanced profiles for each of the major asset areas
  if (asset.id === "bf-04") {
    // Blast Furnace Tuyere Anomaly
    const flowRate = asset.telemetry.flowRate ?? 340;
    const temp = asset.telemetry.temperature;
    
    // Compute dynamic hours based on how bad the cooling flow is
    let safeHours = 4;
    if (flowRate < 310) safeHours = 1;
    else if (flowRate < 330) safeHours = 2;
    else if (flowRate < 350) safeHours = 3;
    else if (flowRate < 380) safeHours = 8;
    else safeHours = 24;

    const risk = flowRate < 330 || temp > 1200 ? "Critical" : flowRate < 350 ? "High" : "Medium";
    
    let primaryCause = "Toroidal water nozzle sediment scaling restriction within original copper envelope body, triggering nucleate boiling.";
    if (activeCorrection) {
      primaryCause = `EXPERT FIELD CORRECTION VERIFIED: ${activeCorrection}`;
    } else if (hasNotes) {
      primaryCause += ` Integrated operator observation: "${userNotes}"`;
    }

    return {
      assetId: asset.id,
      alertId: alert ? alert.id : undefined,
      timestamp: new Date().toISOString(),
      probableFault: "Tuyere No-4 Cooling Water Jacket Flow Choking & Accelerated Blast Fatigue",
      confidence: activeCorrection ? 100 : 92,
      rootCauseAnalysis: {
        primaryCause,
        contributingSensors: ["Electromagnetic Flowmeter BF4-FM-04", "Thermocouple BF4-TC-Y4"],
        processDefects: [
          "Coolant supply secondary collector screen blockage",
          "Toroidal path vaporization blister barrier",
          "Oxygen injection blast distribution imbalance"
        ]
      },
      remainingUsefulLife: {
        hours: safeHours,
        warningMessage: flowRate < 350 
          ? "CRITICAL WARN: Copper jacket melt-through safety threshold is 30 minutes under active full oxygen blast. Water boiling limits exceeded."
          : "Monitor coolant return water bubbles for pressure seal integrity.",
        catastrophicFailureRisk: risk
      },
      priorityAnalysis: {
        riskClassification: risk,
        urgencyScore: flowRate < 350 ? 9 : 6,
        bottleneckStatus: "Blast Furnace uncoupling causes complete hot-metal tap stop, impacting steel casting lines downstream. Estimated scrap generation cost: $18,500 per hour of delay.",
        factors: {
          criticality: "Primary Ironmaking Iron Ore Reduction Reactor (BF-4)",
          delaySeverity: "Extreme hourly penalty ($18,500/hr)",
          sparesAvailability: "0 units currently in local plant warehouse",
          leadTime: "30 days average supplier delivery cycle"
        }
      },
      maintenancePlan: {
        immediateActions: [
          "Execute water supply circuit backpulse flush at 1.5x hydraulic line pressure (7.2 bar max).",
          "Reduce local oxygen enrichment blowers rate by 15% to lessen thermal loading.",
          "Check collector return line flow and inspect backpressure readings."
        ],
        shutDownActions: [
          "Blower line cold tuyere blast isolation.",
          "Urgent modular change-out of the complete copper nozzle assembly with model BF-COP-T4."
        ],
        monitoringInstructions: [
          "Configure visual telemetry widget tracking coolant back-pressure and local steam vapor presence."
        ],
        spareProcurementStrategy: "Deploy safety spares from Coke Making spares storage or contact auxiliary BF expansion team to source back-up model BF-COP-T4 immediately."
      },
      sourcesReferenced: [
        {
          type: "SOP",
          title: "SOP-102-BF: Managing Tuyere Gas & Temperature Anomalies (Section 2)",
          snippet: "If flow descends beneath 350 L/min, assume water nozzle blockage. Reduce blast oxygen immediately by 15-20% and backpulse cooling line to dislodge scale deposits."
        },
        {
          type: "Manual",
          title: "SMS Group Blast Furnace Tuyere Installation and Care Manual (4.2)",
          snippet: "Minimum coolant water supply pressure must remain above 4.5 bar absolute. Pressures lower than 3.8 bar trigger water boiling in the inner toroidal jacket, prompting steam insulation hotspots."
        },
        {
          type: "Historical_Record",
          title: "Failure Record Archive: BF-4 Tuyere Burn-through Damage (March 2024)",
          snippet: "Tuyere No-11 nose burned completely off due to delaying line flush. Escaping water entered hearth, triggering emergency steam dump blockades, lasting 12 hours ($222k downtime)."
        }
      ]
    };
  } else if (asset.id === "cc-02") {
    // Mould Oscillator Anomaly
    const vib = asset.telemetry.vibration;
    const limit = asset.telemetry.vibrationLimit;
    
    let safeHours = 32;
    if (vib > 8.0) safeHours = 6;
    else if (vib > 6.0) safeHours = 12;

    const risk = vib > 8.0 ? "High" : vib > 5.0 ? "Medium" : "Low";

    let primaryCause = "Fatigue play and eccentric clearance drift in FAG double-row spherical drive bearings.";
    if (activeCorrection) {
      primaryCause = `EXPERT FIELD CORRECTION VERIFIED: ${activeCorrection}`;
    } else if (hasNotes) {
      primaryCause += ` Integrated operator observation: "${userNotes}"`;
    }

    return {
      assetId: asset.id,
      alertId: alert ? alert.id : undefined,
      timestamp: new Date().toISOString(),
      probableFault: "Mould Oscillator Bearing Lateral Clearance Degrade & Wobble",
      confidence: activeCorrection ? 100 : 88,
      rootCauseAnalysis: {
        primaryCause,
        contributingSensors: ["Oscillator Vibration Probe Vib-CC02-X", "Lubrication Oil Pressure Sensor CC02-P-Lube"],
        processDefects: [
          "Eccentric drive shaft horizontal deflection",
          "Micro-metal shavings contaminating lubricant",
          "Anchor foundation bolts tension loss"
        ]
      },
      remainingUsefulLife: {
        hours: safeHours,
        warningMessage: "High lateral play will induce visible oscillation marks and surface micro-cracking defects on continuous casting steel billets.",
        catastrophicFailureRisk: risk
      },
      priorityAnalysis: {
        riskClassification: risk,
        urgencyScore: vib > limit ? 7 : 4,
        bottleneckStatus: "Slightly delayed. Oscillator failure forces continuous casting speed throttle or strand freeze. Disruption cost: $14,200 per hour.",
        factors: {
          criticality: "Continuous Caster Mould Strand Oscillator Core",
          delaySeverity: "Highly Severe ($14,200/hr)",
          sparesAvailability: "1 compatible unit in storage inventory",
          leadTime: "45 days standard import cycle"
        }
      },
      maintenancePlan: {
        immediateActions: [
          "Execute manual high-pressure grease flushing sequence using synthetic lube Klüberplex.",
          "Examine oscillator frame anchor bracket clamps. Torque hex nuts to 450 N-m.",
          "Collect a 100ml lubrication sample for spectral metal particulate analysis."
        ],
        shutDownActions: [
          "Execute main roller drive stand decelerated stop.",
          "Remove drive shaft bearing housing and install replacement FAG 22352-TB spherical roller spare."
        ],
        monitoringInstructions: [
          "Chart vibration amplitude peaks in the horizontal (X) and radial frequency margins."
        ],
        spareProcurementStrategy: "One FAG 22352-TB spare unit is confirmed in Warehouse B Bin-12. Issue an administrative slip to requisition this spare immediately before commencing maintenance."
      },
      sourcesReferenced: [
        {
          type: "SOP",
          title: "SOP-205-CC: Mould Oscillator Mechanical Discrepancy",
          snippet: "Peak horizontal vibration exceeding 5.0 mm/s indicates bearing wear or pusher pin slack. Tighten work clamps, perform pressure grease purge sequence with Klüberplex grease."
        },
        {
          type: "Manual",
          title: "SMS Demag Mould Oscillator Maintenance Manual Section 12",
          snippet: "FAG 22352-TB spherical drive bearings require clearance bounds between 0.230 and 0.280 mm. Tolerances greater than 0.350 mm prompt severe directional mechanical vibrations."
        }
      ]
    };
  } else if (asset.id === "hsm-01") {
    // Hot Strip Mill Work Roll Bearing Anomaly
    const temp = asset.telemetry.temperature;
    const vib = asset.telemetry.vibration;
    const tempLimit = asset.telemetry.temperatureLimit;
    const vibLimit = asset.telemetry.vibrationLimit;

    let safeHours = 120;
    if (temp > 80 || vib > 4.0) safeHours = 8;
    else if (temp > 70 || vib > 3.0) safeHours = 48;

    const risk = temp > tempLimit || vib > vibLimit ? "Critical" : (temp > tempLimit * 0.95 || vib > vibLimit * 0.9) ? "High" : temp > 72 ? "Medium" : "Low";

    let primaryCause = "Work roll high shear loads leading to micro-spalling of rolling elements and synthetic lithium grease layer cracking.";
    if (activeCorrection) {
      primaryCause = `EXPERT FIELD CORRECTION VERIFIED: ${activeCorrection}`;
    } else if (hasNotes) {
      primaryCause += ` Integrated operator observation: "${userNotes}"`;
    }

    return {
      assetId: asset.id,
      alertId: alert ? alert.id : undefined,
      timestamp: new Date().toISOString(),
      probableFault: "Hot Strip Mill Work Roll Bearing Outer Race Spalling & Thermal Dissipation Anomaly",
      confidence: activeCorrection ? 100 : 90,
      rootCauseAnalysis: {
        primaryCause,
        contributingSensors: ["Bearing Housing Thermocouple HSM-TC-WR1", "Vibration Sensor HSM-WR-VIB1-R"],
        processDefects: [
          "Dynamic work roll slab overload shear stress",
          "External roll water coolant spray nozzle partial scale occlusion",
          "Lithium grease mechanical shear thin-out"
        ]
      },
      remainingUsefulLife: {
        hours: safeHours,
        warningMessage: temp > 80 
          ? "CRITICAL HEAT BUILDUP: Bearing seizure risk imminent (>85°C threshold). Roll stand jam will cause roll stand micro-cracking and massive downstream work delays." 
          : "Monitor work stand vibrations during heavy steel sheet drag cycles.",
        catastrophicFailureRisk: risk
      },
      priorityAnalysis: {
        riskClassification: risk,
        urgencyScore: temp > 80 || vib > 4.0 ? 8 : 4,
        bottleneckStatus: "Roughing Stand work roll bearings seizure forces roll replacement and full mill delay penalty. Production delay costs: $22,000 per hour of delay.",
        factors: {
          criticality: "Hot Strip Mill Primary Roughening Assembly (HSM-01)",
          delaySeverity: "Highly Severe Delay Overhead ($22,000/hr)",
          sparesAvailability: "4 units currently available in plant warehouse",
          leadTime: "60 days standard factory-order lead time"
        }
      },
      maintenancePlan: {
        immediateActions: [
          "Activate supplementary external water spray nozzles to reduce work roll housing temperatures.",
          "Force an automatic lubricant purge cycle to pump fresh lithium grease (Klüberplex BE 31-502).",
          "Audit slab thickness reduction force parameters on the control room screen."
        ],
        shutDownActions: [
          "Bring milling stand to complete decelerated stop during next scheduled roll changeover.",
          "Perform complete disassembly of roll housing, replace work roll bearing with Model WRB-SL90, and inspect guide clearance tolerances."
        ],
        monitoringInstructions: [
          "Run physical checks on water cooling pressure sensors and trace bearing temperature spikes."
        ],
        spareProcurementStrategy: "Warehouse A Bin-4 lists 4 WRB-SL90 synthetic bearings in active storage, crossing the safety level of 2 units. Request stock release to roll changeover zone."
      },
      sourcesReferenced: [
        {
          type: "SOP",
          title: "SOP-301-HSM: Rolling Bearing Thermal Overload Prevention",
          snippet: "Maintain roll bearing housing temperature strictly beneath 85°C. For thermal anomalies, deploy auxiliary cooling sprays and apply lubricant purge cycle."
        },
        {
          type: "Historical_Record",
          title: "Failure Record Archive: HSM Stand 1 Bearing Seizure Damage (October 2025)",
          snippet: "Rapid thermal rise over 15min went unchecked. Bearing split, completely fusing rollers to shafts, requiring custom mechanical extraction and costing over $120k in destroyed equipment."
        }
      ]
    };
  } else if (asset.id === "cogc-03") {
    // Coke Oven Gas Compressor Anomaly
    const temp = asset.telemetry.temperature;
    const vib = asset.telemetry.vibration;
    const tempLimit = asset.telemetry.temperatureLimit;
    const vibLimit = asset.telemetry.vibrationLimit;

    let safeHours = 240;
    if (temp > 105 || vib > 2.8) safeHours = 12;
    else if (temp > 95 || vib > 2.2) safeHours = 72;

    const risk = temp > tempLimit || vib > vibLimit ? "Critical" : (temp > tempLimit * 0.95 || vib > vibLimit * 0.9) ? "High" : temp > 93 ? "Medium" : "Low";

    let primaryCause = "Solenoid valve fluctuations creating intake gas pulsation, inducing abnormal rotor deflection frequencies.";
    if (activeCorrection) {
      primaryCause = `EXPERT FIELD CORRECTION VERIFIED: ${activeCorrection}`;
    } else if (hasNotes) {
      primaryCause += ` Integrated operator observation: "${userNotes}"`;
    }

    return {
      assetId: asset.id,
      alertId: alert ? alert.id : undefined,
      timestamp: new Date().toISOString(),
      probableFault: "Gas Compressor Rotor High-Frequency Axial Wobble & Impeller Contact Threat",
      confidence: activeCorrection ? 100 : 91,
      rootCauseAnalysis: {
        primaryCause,
        contributingSensors: ["Roto-Dynamic Shaft Displacement Probe COG-DT-3", "Aux Discharge Pressure Sensor COGC-P3-OUT"],
        processDefects: [
          "Intake gas moisture/tar condensates build-up",
          "Inlet solenoid strainer partial clogging",
          "Dynamic uncompensated compression wave surge"
        ]
      },
      remainingUsefulLife: {
        hours: safeHours,
        warningMessage: temp > 105 
          ? "CRITICAL IMPELLER THREAT: Rotor radial displacement approaching casing contact risk. Operating past 110°C limit may cause catastrophic blade disintegration."
          : "Keep track of intake line tar traps and regular solenoid response times.",
        catastrophicFailureRisk: risk
      },
      priorityAnalysis: {
        riskClassification: risk,
        urgencyScore: temp > 105 || vib > 2.8 ? 7 : 3,
        bottleneckStatus: "Utilities gas supply compression drops, impacting blast furnace thermal balances down the line. Delay penalty: $9,500/hr.",
        factors: {
          criticality: "Utilities Fuel Gas Distribution Core Component (COGC-03)",
          delaySeverity: "Moderate Delay Penalty ($9,500/hr)",
          sparesAvailability: "2 solenoid intake valves ready in local inventory",
          leadTime: "7 days supplier factory-dispatch timeline"
        }
      },
      maintenancePlan: {
        immediateActions: [
          "Verify gas intake volume and clear any trapped moisture condensates at the separator stage.",
          "Perform remote calibration testing of the intake pressure regulator valve.",
          "Check voltage and signal parameters of the SV-COGC solenoid control circuit."
        ],
        shutDownActions: [
          "Bypass utilities gas line through secondary redundant storage vessels.",
          "Shut down Compressor #3 rotor, strip shroud assembly, perform rotor blade guide clearances alignments, and swap out the intake solenoid."
        ],
        monitoringInstructions: [
          "Log continuous shaft thermal levels and track blade dynamic frequency charts closely."
        ],
        spareProcurementStrategy: "Warehouse Bin-9 lists 2 SV-COGC solenoid spare units. Safety level is 1 unit. Request immediately from spares distribution lead."
      },
      sourcesReferenced: [
        {
          type: "Spare_DB",
          title: "Steel Plant Spare Parts Inventory and Procurement Lead Times",
          snippet: "Compressor Solenoid Valve (Model SV-COGC): Current active warehouse stock is 2 units. Lead time is 7 days. Recommended safety stock is 1 unit."
        }
      ]
    };
  } else {
    // Custom fallbacks for other healthy objects or general predictive analysis
    const risk = asset.status === "Critical" ? "Critical" : asset.status === "Warning" ? "Medium" : "Low";
    const primaryCause = activeCorrection 
      ? `EXPERT FIELD CORRECTION VERIFIED: ${activeCorrection}`
      : hasNotes 
        ? `Routine diagnostic scan compiled with manual observation: "${userNotes}"` 
        : "All active sensors operating within designated steel plant margin thresholds.";

    return {
      assetId: asset.id,
      alertId: alert ? alert.id : undefined,
      timestamp: new Date().toISOString(),
      probableFault: `Predictive Diagnostic Verification for ${asset.name}`,
      confidence: 85,
      rootCauseAnalysis: {
        primaryCause,
        contributingSensors: ["Routine telemetry diagnostic scanners"],
        processDefects: []
      },
      remainingUsefulLife: {
        hours: 720,
        warningMessage: "",
        catastrophicFailureRisk: risk
      },
      priorityAnalysis: {
        riskClassification: risk,
        urgencyScore: asset.status === "Critical" ? 8 : asset.status === "Warning" ? 5 : 1,
        bottleneckStatus: `Equipment is running inside standard nominal parameters. Normal operating overhead delay margins apply. Delay value: $${asset.delayCostPerHour}/hr.`,
        factors: {
          criticality: `${asset.area} primary asset line`,
          delaySeverity: `Standard operational value ($${asset.delayCostPerHour}/hr)`,
          sparesAvailability: "Stock level normal",
          leadTime: "7 days procurement lead time"
        }
      },
      maintenancePlan: {
        immediateActions: [
          "Conduct visual check of seals during routine shift rounds.",
          "Keep automatic lubrication cycle active."
        ],
        shutDownActions: [
          "No shutdown requirements scheduled."
        ],
        monitoringInstructions: [
          "Continue automated sensor matrix logging."
        ],
        spareProcurementStrategy: "No procurement actions or spares allocations required at this time."
      },
      sourcesReferenced: [
        {
          type: "Manual",
          title: "Generic Asset Operational Standard Manual",
          snippet: "Verify clean housing temperature bounds during high pressure runs. Apply regular multi-lubricant cycle shifts."
        }
      ]
    };
  }
}

// Simulated simple Troubleshooting chatbots fallback
function generateSimulatedChatResponse(
  asset: Asset | null,
  alert: ControlRoomAlert | null,
  query: string,
  history: ChatMessage[]
): string {
  const text = query.toLowerCase();

  if (asset) {
    if (asset.id === "bf-04") {
      if (text.includes("limit") || text.includes("threshold") || text.includes("flow")) {
        return `Regarding Blast Furnace #4 cooling water systems, under SOP-102-BF:\n- The absolute critical cooling flow limit is 350 Litres/Minutes.\n- If fluid levels sink beneath this (current telemetry shows ${asset.telemetry.flowRate ?? 340} L/min), you must perform a backpulse line flush immediately.\n- Ref: SMS Tuyere Operations Guide, Section 4.5. Operating at lower bounds triggers steam pockets in the copper housing nose tip, leading to quick failure burn-through.`;
      }
      if (text.includes("spare") || text.includes("inventory") || text.includes("stock") || text.includes("parts")) {
        return "Checking the plant spares database for Blast Furnace Tuyere spares:\n- Part Model: BF-COP-T4 (BF Copper Tuyere Body)\n- Warehouse Status: 0 units currently in stock!\n- Procurement Lead Time: 30 days.\n- Safety Recommended Level: 1 unit.\n- Advice: If change-out is required, contact the Coke making zone supervisor immediately to verify if other furnace complexes hold any compatible cross-departmental stock spares.";
      }
      if (text.includes("backpulse") || text.includes("action") || text.includes("how to fix")) {
        return "To execute backpulsing for Tuyere #4:\n1. Ensure hydraulic backpressure bypass valve is set to open.\n2. Ingress pressurized fluid at 1.5x standard flow pressure (approximately 7.2 bar max).\n3. Keep backpulse active for 3 to 5 minutes to release scale and slag particulates.\n4. Throttle the furnace blow pipe oxygen volume by 15-20% during backpulsing to protect the uncooled refractory tip.";
      }
      return `Welcome to the BF #4 Maintenance Console. Our active telemetry indicates status is ${asset.status} due to Temperature: ${asset.telemetry.temperature}°C and Coolant flow Rate: ${asset.telemetry.flowRate} L/min.\nUnder SOP-102-BF guidelines, please ask about 'limits', 'backpulse procedures', or 'spares database' to formulate your repair strategy.`;
    }

    if (asset.id === "cc-02") {
      if (text.includes("vibration") || text.includes("limit") || text.includes("mm/s")) {
        return `For Continuous Caster Mould Oscillator #2, under SOP-205-CC:\n- The safe horizontal vibration boundary limit is 5.0 mm/s.\n- Current telemetry registers ${asset.telemetry.vibration} mm/s (Alarm limit exceeded).\n- Repetitive peak spikes indicate drive bearing play or loose anchor bolts. Check anchor clamps immediately and torque to 450 N-m.`;
      }
      if (text.includes("spare") || text.includes("bearing") || text.includes("stock")) {
        return "Reviewing casting oscillator spares:\n- Bearing Model: FAG 22352-TB double-row spherical roller bearing.\n- Storage Inventory: 1 unit available in Warehouse B (Bin-12).\n- Procurement Lead Time: 45 days.\n- Dispatch Advice: Since this is our only spare, replace only if backpressure lubrication flush fails to reduce vibrations beneath 5.0 mm/s. Prepare secondary import order now.";
      }
      return `Welcome to CC-02 Oscillator Chat support. Sensor logs identify a Warning Status with ${asset.telemetry.vibration} mm/s vibration rating.\nYou can ask about 'vibration boundaries', 'clamping torque', or 'spherical roller bearing spares compatibility'.`;
    }

    if (asset.id === "hsm-01") {
      if (text.includes("limit") || text.includes("temperature") || text.includes("temp") || text.includes("vibration")) {
        return `Regarding Hot Strip Mill Roll Bearing Stand #1, under SOP-301-HSM:\n- The critical bearing housing thermal limit is 85°C, and safe vibrations must stay below 4.5 mm/s.\n- Current telemetry registers Temp: ${asset.telemetry.temperature}°C, Vib: ${asset.telemetry.vibration} mm/s.\n- If thresholds are crossed, IMMEDIATELY launch water spray purges and high-temp synthetic lithium purges; roll seize risks split rolling elements (loss: $120k).`;
      }
      if (text.includes("spare") || text.includes("bearing") || text.includes("stock") || text.includes("parts")) {
        return "Checking the stock database for Hot Strip Mill Roll Bearings:\n- Spare Part: Model WRB-SL90\n- Stock status: 4 units available in Warehouse A (above safety level of 2 units).\n- Procurement Lead Time: 60 days standard factory cycle.\n- Requisition advice: Ready for roll changeover allocation.";
      }
      if (text.includes("lubrication") || text.includes("grease") || text.includes("purge")) {
        return "SOP-301-HSM guidelines mandate high-temperature synthetic chemical lithium-complex grease. Purging forced grease pushes contaminants out and serves to lower local friction dissipation in the housing. Refer to lubrication maintenance standard SOP-LUB-01 for exact volume coefficients.";
      }
      return `Welcome to the Hot Strip Mill Roll Stand #1 Console. Current readings are Temp: ${asset.telemetry.temperature}°C and Vib: ${asset.telemetry.vibration} mm/s. Safe operation is monitored. Ask about 'limits', 'lubrication' (SOP-LUB-01), or 'bearing spares'.`;
    }

    if (asset.id === "cogc-03") {
      if (text.includes("limit") || text.includes("pressure") || text.includes("vibration") || text.includes("temperature")) {
        return `For Coke Oven Gas Compressor #3 rotors:\n- Thermal limit is 110°C, vibration limit is 3.0 mm/s, pressure limit is 17.0 bar.\n- Current status represents Temperature: ${asset.telemetry.temperature}°C, Vibration: ${asset.telemetry.vibration} mm/s, Pressure: ${asset.telemetry.pressure} bar.\n- Spiking vibration indicates shaft misalignment or blade deposits. Ask about 'solenoid valve' or check clearances.`;
      }
      if (text.includes("valve") || text.includes("solenoid") || text.includes("spare") || text.includes("parts")) {
        return "Checking Gas Compressor parts status:\n- Solenoid Part: Model SV-COGC (Compressor Solenoid Valve)\n- Stock Availability: 2 units in stock.\n- Lead Time: 7 days. Recommended safety: 1 unit.\n- Intake solenoid oscillation is known to create severe rotor frequency waves; replace if valve pressure fluctuates.";
      }
      return `Welcome to Gas Compressor Compressor #3 Diagnostic logs support. Operating values indicate Temperature: ${asset.telemetry.temperature}°C, Pressure: ${asset.telemetry.pressure} bar.\nYou can query 'limit boundaries', 'solenoid valve spares', or 'historical anomalies'.`;
    }
  }

  // General steelmaking operations answers
  if (text.includes("furnace") || text.includes("dump") || text.includes("hearth")) {
    return "Blast Furnace furnace dump guidelines require isolation of the outer stoves within 30 minutes of a cooling water burn-through to prevent hot liquid iron from encountering oxygenated steam, which triggers dangerous thermal vapor eruptions. Refer to Safety Incident INC-BF4-2024-03.";
  }
  
  if (text.includes("grease") || text.includes("lubricant") || text.includes("kluber") || text.includes("bearing") || text.includes("gearbox")) {
    return "For heavy mill roller stands and mould oscillators, SMS Demag guidelines dictate high-temperature synthetic Lithium complex grease, specifically Klüberplex BE 31-502 as mapped in standard SOP-LUB-01. For Flender or helical gearboxes, see gear speed maintenance guidelines in MAN-GBX-101-V1 to ensure optimal bearing tolerances are met.";
  }

  return "I am the Tata Steel Maintenance Wizard assistant. Ask me questions regarding safety SOP-LUB-01 guidelines, Flender gearbox manual MAN-GBX-101-V1, warehouse safety parts availability, or emergency shutdown procedures for blast furnace hearth tuyeres under WO-2026-1012.";
}


/* ========================================================
   3. EXPORTED UNIFIED DISRUPTOR ADAPTER
   ======================================================== */
export async function runAssetDiagnosis(
  assetId: string,
  alertId: string | null,
  userNotes: string
): Promise<DiagnosticResult> {
  // Always log context from client stores to match latest updates
  const asset = ClientStore.getAssets().find(a => a.id === assetId);
  if (!asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }

  const alert = alertId ? ClientStore.getAlerts().find(a => a.id === alertId) || null : null;
  const feedbacks = ClientStore.getFeedbacks();

  try {
    // 1. Prioritize secure full-stack server-side diagnosis proxy
    const response = await fetch("/api/diagnose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ assetId, alertId, userNotes })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.report) {
         console.log("Successfully retrieved diagnosis from server-side Gemini module.");
         return data.report as DiagnosticResult;
      }
    }
    console.warn("Backend /api/diagnose response not ok. Falling back to high-grade offline Simulation Engine.");
  } catch (err) {
    console.warn("Backend connection failed when running diagnosis. Falling back to high-grade offline Simulation Engine.", err);
  }

  // 2. Check client-side direct API key as a secondary backup
  const apiKey = getSavedApiKey();
  if (apiKey) {
    console.log("Gemini Client-Side API Key detected. Commencing live browser-based CORS fetch API call...");
    
    const ragContext = getClientRelevantKBDocs(assetId, asset.name);
    const relatedFeedbacks = feedbacks.filter(fb => fb.assetId === assetId && fb.correctionNote);
    const feedbacksContext = relatedFeedbacks.length > 0 
      ? "THE FOLLOWING HISTORICAL CORRECTIONS & CONFIRMATIONS WERE RECORDED BY SENIOR ENGINEERS FOR THIS ASSET. RE-ALIGN ALL SYSTEM INTERPRETED CAUSES AND CONFIDENCES TO MATCH AND PRIORITIZE THESE WORKER EXPERIENCES:\n" + 
        relatedFeedbacks.map(fb => `- Engineer Correction: "${fb.correctionNote}" (Approved: ${fb.rating === "helpful" ? "YES" : "NO"})`).join("\n")
      : "No prior engineer corrections recorded for this asset yet.";

    const systemInstruction = `You are the Tata Steel Maintenance Wizard - an autonomous, expert decision-support AI Agent with almost a decade of process-level metallurgy and engineering diagnostics memory in integrated steel plants.
You diagnose equipment issues, conduct Root Cause Analysis (RCA), estimate Remaining Useful Life (RUL), grade risks, and output a structured preventive/reactive repair strategy.

CRITICAL: Your recommendations MUST be Traceable and Explainable.
Your knowledge includes active sensor readings, SOP scripts, manuals, spare parts catalog details, and most importantly, PRIOR feedback/corrections logged by senior engineers.

Instructions to fulfill constraints:
1. Under "sourcesReferenced", extract text snippets that helped you arrive at your decision from the RAG context.
2. In your reasoning, integrate the provided "HISTORICAL CORRECTIONS & CONFIRMATIONS" (engineer feedback loop). If an engineer correction notes a specific root cause, prioritize that explanation.
3. Calculate Remaining Useful Life based on telemetry trends.
4. Output strict, valid JSON matching the defined schema structure. Do not include markdown wraps (like \`\`\`json) in your JSON output.`;

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
      const responseText = await callGeminiLiveAPI(apiKey, prompt, systemInstruction);
      // Clean up markdown tags, if returned
      const cleanJSON = responseText
        .replace(/^\s*```json/i, "")
        .replace(/```\s*$/, "")
        .trim();
        
      return JSON.parse(cleanJSON) as DiagnosticResult;
    } catch (err: any) {
      console.warn("Live Gemini client API fetch failed. Falling back to high-grade offline Simulation Engine.", err);
      return generateSimulatedDiagnosis(asset, alert, userNotes, feedbacks);
    }
  }

  // Primary simulation mode when no key is explicitly bound client-side and server failed
  console.log("Operating under Automated High-Fidelity Cognitive Simulation Core.");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateSimulatedDiagnosis(asset, alert, userNotes, feedbacks));
    }, 1200); // realistic latency simulation
  });
}

export async function askWizardChat(
  assetId: string | null,
  alertId: string | null,
  message: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  const assetsList = ClientStore.getAssets();
  const alertsList = ClientStore.getAlerts();
  const feedbacks = ClientStore.getFeedbacks();

  const asset = assetId ? assetsList.find(a => a.id === assetId) || null : null;
  const alert = alertId ? alertsList.find(a => a.id === alertId) || null : null;

  try {
    // 1. Prioritize secure server-side chat endpoint
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ assetId, alertId, message, chatHistory })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        console.log("Successfully retrieved reply from server-side Gemini chat module.");
        return data.text;
      }
    }
    console.warn("Backend /api/chat response not ok. Falling back to simulated chat response.");
  } catch (err) {
    console.warn("Backend connection failed when running chat. Falling back to simulated chat response.", err);
  }

  // 2. Client-side key backup
  const apiKey = getSavedApiKey();
  if (apiKey) {
    console.log("Gemini Client Key detected. Deploying live query stream for interactive troubleshooting chat...");
    const ragContext = asset ? getClientRelevantKBDocs(asset.id, asset.name) : "";
    
    // Feedbacks to keep trace of local corrections
    const relatedFeedbacks = asset ? feedbacks.filter(fb => fb.assetId === asset.id && fb.correctionNote) : [];
    const feedbacksContext = relatedFeedbacks.length > 0
      ? "\nSENIOR ENGINEER ADVICE:\n" + relatedFeedbacks.map(fb => `- ${fb.correctionNote}`).join("\n")
      : "";

    const systemInstruction = `You are the Tata Steel Maintenance Wizard chat module. You assist operators, maintenance crews, and mechanical engineers with continuous troubleshooting.
You have access to live metadata of the asset and related logs. Be precise, highly professional, direct, and explain the metallurgy/physics clearly.
Always reference SOP numbers and manuals where possible to maintain traceability.

${asset ? `CURRENT ASSET OF CONTEXT: ${asset.name}
Telemetry: Temp: ${asset.telemetry.temperature}°C, Vib: ${asset.telemetry.vibration} mm/s, Pres: ${asset.telemetry.pressure} bar
Status: ${asset.status}` : "General Steel Plant maintenance mode."}
${alert ? `ACTIVE PROBLEM: "${alert.message}"` : ""}
${feedbacksContext}

KNOWLEDGE BASES RETRIEVED (RAG):
${ragContext}`;

    // Format chat history to Gemini standard v1beta REST schema
    const formattedHistory = chatHistory.slice(-10).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // For REST endpoint, we can append user message as the final item in contents
    const fullContents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: fullContents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini Chat API returned ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply from expert system.";
    } catch (err: any) {
      console.warn("Live client chat stream error. Triggering simulation recovery.", err);
      return generateSimulatedChatResponse(asset, alert, message, chatHistory);
    }
  }

  // Offline simulation fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateSimulatedChatResponse(asset, alert, message, chatHistory));
    }, 800);
  });
}
