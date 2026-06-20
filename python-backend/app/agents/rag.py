"""Agent 3 - RAG: retrieve relevant maintenance evidence + Gemini synthesis."""
from __future__ import annotations
import time
from typing import Any, Dict, List

from ..rag.retriever import get_retriever
from .llm import synthesize
from .state import GraphState


def _build_query(state: GraphState) -> str:
    ing = state["ingestion"]; anom = state["anomaly"]
    parts = [
        f"asset {state.get('asset_type','MOTOR')} {state.get('asset_id','')}",
        f"severity {anom['severity']}",
    ]
    if anom["physics_rules_triggered"]:
        parts.append("failure modes " + " ".join(anom["physics_rules_triggered"]))
    f = ing["features"]
    if f["temp_diff"] < 8.6:
        parts.append("heat dissipation")
    if f["power_w"] < 3500 or f["power_w"] > 9000:
        parts.append("power band")
    if ing["reading"]["tool_wear"] > 180:
        parts.append("tool wear")
    return " | ".join(parts)


def run(state: GraphState) -> GraphState:
    t0 = time.perf_counter()
    q = _build_query(state)
    retriever = get_retriever()
    hits: List[Dict[str, Any]] = retriever.search(q, k=4)

    # Build evidence chain
    evidence = []
    for h in hits:
        evidence.append({
            "doc_id": h["id"],
            "asset": h.get("asset"),
            "category": h.get("category"),
            "score": round(h["score"], 4),
            "snippet": h["text"][:280],
        })

    # Optional LLM synthesis (Gemini) - falls back to deterministic summary
    anom = state["anomaly"]
    fallback = (
        f"Evidence supports {anom['severity']} severity on "
        f"{state.get('asset_type')}. Top SOP: {hits[0]['text'][:160] if hits else 'no match'}"
    )
    prompt = (
        "You are a reliability engineer. In 2-3 sentences, summarize the most relevant "
        "maintenance action based on these SOP snippets and the detected anomaly. "
        f"Anomaly score={anom['anomaly_score']}, severity={anom['severity']}, "
        f"triggered rules={anom['physics_rules_triggered']}. "
        "SOP snippets:\n- " + "\n- ".join(h["text"][:300] for h in hits[:3])
    )
    rationale = synthesize(prompt, fallback=fallback)

    rag_out: Dict[str, Any] = {
        "query": q,
        "evidence": evidence,
        "rationale": rationale,
    }
    state["rag"] = rag_out

    elapsed = (time.perf_counter() - t0) * 1000
    state["trace"].append({
        "agent": "RAG (Evidence Retrieval)",
        "summary": f"Retrieved {len(evidence)} evidence docs; top doc {evidence[0]['doc_id'] if evidence else 'none'}.",
        "inputs": {"query": q},
        "outputs": rag_out,
        "confidence": min(1.0, 0.55 + (evidence[0]["score"] if evidence else 0) * 0.45),
        "elapsed_ms": round(elapsed, 2),
    })
    return state
