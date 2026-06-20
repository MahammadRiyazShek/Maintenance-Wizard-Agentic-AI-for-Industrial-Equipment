"""Shared LangGraph state - every step appends to `trace` for auditability."""
from __future__ import annotations
from typing import Any, Dict, List, Optional, TypedDict


class TraceStep(TypedDict):
    agent: str
    summary: str
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    confidence: float
    elapsed_ms: float


class GraphState(TypedDict, total=False):
    # input
    asset_id: str
    asset_type: str
    reading: Dict[str, Any]
    business_context: Dict[str, Any]

    # per-agent outputs
    ingestion: Dict[str, Any]
    anomaly: Dict[str, Any]
    rag: Dict[str, Any]
    risk: Dict[str, Any]
    plan: Dict[str, Any]
    feedback: Dict[str, Any]

    # global
    trace: List[TraceStep]
    confidence_index: Dict[str, Any]
    decision: Dict[str, Any]
