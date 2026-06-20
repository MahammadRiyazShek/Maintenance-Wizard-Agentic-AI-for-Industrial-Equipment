"""Wire all five agents (+ feedback) into a LangGraph StateGraph."""
from __future__ import annotations
from functools import lru_cache
from typing import Any, Dict

from langgraph.graph import StateGraph, END

from .state import GraphState
from . import sentinel, anomaly, rag, risk, planner

# Public agent topology - shown on the landing page diagram
AGENT_TOPOLOGY = [
    {"id": "sentinel",  "label": "Sentinel\n(Ingestion)",        "role": "validate & feature-engineer"},
    {"id": "anomaly",   "label": "Anomaly\n(XGBoost+IsoForest)", "role": "ML + physics ensemble"},
    {"id": "rag",       "label": "RAG\n(FAISS + Gemini)",        "role": "evidence retrieval"},
    {"id": "risk",      "label": "Risk\n(RUL + Cascade)",        "role": "RUL & propagation"},
    {"id": "planner",   "label": "Planner\n(MPI + Decision)",    "role": "business decision"},
    {"id": "feedback",  "label": "Feedback\n(Human-in-loop)",    "role": "audit & learning"},
]


@lru_cache(maxsize=1)
def build_graph():
    # Node names must NOT collide with state keys -> suffix with _node.
    g = StateGraph(GraphState)
    g.add_node("sentinel_node",  sentinel.run)
    g.add_node("anomaly_node",   anomaly.run)
    g.add_node("rag_node",       rag.run)
    g.add_node("risk_node",      risk.run)
    g.add_node("planner_node",   planner.run)
    g.add_node("feedback_node",  planner.feedback)

    g.set_entry_point("sentinel_node")
    g.add_edge("sentinel_node", "anomaly_node")
    g.add_edge("anomaly_node",  "rag_node")
    g.add_edge("rag_node",      "risk_node")
    g.add_edge("risk_node",     "planner_node")
    g.add_edge("planner_node",  "feedback_node")
    g.add_edge("feedback_node", END)
    return g.compile()


def run_pipeline(asset_id: str, asset_type: str, reading: Dict[str, Any],
                 business_context: Dict[str, Any] | None = None) -> Dict[str, Any]:
    state: GraphState = {
        "asset_id": asset_id,
        "asset_type": asset_type,
        "reading": reading,
        "business_context": business_context or {},
        "trace": [],
    }
    return build_graph().invoke(state)
