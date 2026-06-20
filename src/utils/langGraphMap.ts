/**
 * langGraphMap.ts
 * ----------------------------------------------------------------------------
 * v8 FINAL — describes the 5-agent LangGraph multi-agent RAG topology that
 * powers the wizard's reasoning pipeline.
 *
 * The graph is laid out as a directed acyclic graph (DAG) — every edge carries
 * a typed message and every node carries a deterministic role description.
 * This file is the single source of truth consumed by:
 *   • components/LangGraphPipeline.tsx       (visualisation)
 *   • components/AIConfidenceIndex.tsx       (confidence weights breakdown)
 *   • components/JudgeMapPage.tsx            (judge-facing capability map)
 * ----------------------------------------------------------------------------
 */

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  tools: string[];
  outputs: string[];
  confidenceWeight: number;     // sum across nodes = 1.00
  ragSources: string[];
}

export interface AgentEdge {
  from: string;
  to: string;
  message: string;
}

export const LANGGRAPH_NODES: AgentNode[] = [
  {
    id: "planner",
    name: "Planner Agent",
    role:
      "Receives the operator query + active asset context. Decomposes the request " +
      "into atomic sub-questions and selects the agents that need to run.",
    tools: ["query_decomposer", "asset_context_loader", "role_router"],
    outputs: ["plan.json (ordered sub-tasks)"],
    confidenceWeight: 0.10,
    ragSources: ["asset_registry", "role_policies"],
  },
  {
    id: "retriever",
    name: "Retriever Agent (Multi-Agent RAG)",
    role:
      "Performs hybrid (BM25 + dense) retrieval across the live knowledge base, " +
      "SOP corpus, OEM manuals, and the maintenance logbook. Cites every snippet.",
    tools: ["bm25", "dense_embedding_search", "snippet_ranker"],
    outputs: ["evidence_chain[] (id, source, score, excerpt)"],
    confidenceWeight: 0.20,
    ragSources: ["KB/SOP", "KB/Manuals", "KB/Logbook", "KB/Incidents"],
  },
  {
    id: "diagnoser",
    name: "Diagnoser Agent",
    role:
      "Cross-references the evidence chain with telemetry deltas and the AI4I-2020 " +
      "physics surrogate (TWF/HDF/PWF/OSF) to nominate the most likely failure mode.",
    tools: ["ai4i_classifier", "isolation_forest", "trend_delta"],
    outputs: ["diagnosis.failureMode", "diagnosis.confidence"],
    confidenceWeight: 0.30,
    ragSources: ["AI4I-2020", "Telemetry"],
  },
  {
    id: "riskscorer",
    name: "Risk-Scorer Agent",
    role:
      "Computes the deterministic 6-step Maintenance Priority Index (MPI) with " +
      "weighted contributions, dollar-quantified impact, and downtime envelope.",
    tools: ["mpi_engine_6step", "dollar_impact_map"],
    outputs: ["mpi.index", "mpi.band", "mpi.projectedLoss"],
    confidenceWeight: 0.25,
    ragSources: ["MPI weights table", "$/hr table"],
  },
  {
    id: "planner_action",
    name: "Action-Planner Agent",
    role:
      "Drafts a runnable work-order: parts, crew, lockout-tagout steps, ETA, and a " +
      "Boardroom-grade ROI narrative. Posts to the autonomous daemon if armed.",
    tools: ["work_order_builder", "spares_lookup", "roi_narrator"],
    outputs: ["workOrder.draft", "roi.summary"],
    confidenceWeight: 0.15,
    ragSources: ["Spares DB", "Crew roster", "Historical ROI"],
  },
];

export const LANGGRAPH_EDGES: AgentEdge[] = [
  { from: "planner",        to: "retriever",      message: "sub_questions[]" },
  { from: "retriever",      to: "diagnoser",      message: "evidence_chain[]" },
  { from: "diagnoser",      to: "riskscorer",     message: "candidate_failure_mode" },
  { from: "riskscorer",     to: "planner_action", message: "mpi_band + $impact" },
  { from: "diagnoser",      to: "planner_action", message: "diagnosis_for_workorder" },
];

/**
 * Combine LangGraph node weights with run-time scores to produce
 * a calibrated confidence index. Returns 0 – 1 plus a per-node breakdown.
 */
export function weightedConfidence(scores: Record<string, number>): {
  overall: number;
  factors: { id: string; name: string; weight: number; score: number; contribution: number }[];
} {
  const factors = LANGGRAPH_NODES.map((n) => {
    const score = Math.max(0, Math.min(1, scores[n.id] ?? 0.8));
    return {
      id: n.id,
      name: n.name,
      weight: n.confidenceWeight,
      score,
      contribution: Number((score * n.confidenceWeight).toFixed(3)),
    };
  });
  const overall = Number(
    factors.reduce((s, f) => s + f.score * f.weight, 0).toFixed(3)
  );
  return { overall, factors };
}
