"""Agent 5 - PLANNER: Compute Maintenance Priority Index (MPI), pick action, and
produce a role-adapted recommendation. Also computes the AI Confidence Index
(5-component weighted formula)."""
from __future__ import annotations
import time
from typing import Any, Dict

from .state import GraphState

# Role-adapted message templates (6 surfaces)
ROLE_TEMPLATES = {
    "OPERATOR":     "Operator: {action_short}. Severity {severity}. RUL ~{rul} h.",
    "MAINTENANCE":  "Maintenance: {action_short}. Top SOP: {sop_id}. Spare {spare_status}.",
    "RELIABILITY":  "Reliability: MPI={mpi:.1f}; failure modes {modes}; cascade -> {downstream}.",
    "PLANT_MGR":    "Plant Manager: estimated downtime cost INR {cost_inr:,.0f}; action {action}.",
    "PROCUREMENT":  "Procurement: spare {spare_part} lead-time {lead_days} d; spare-on-hand={spare_on_hand}.",
    "EXECUTIVE":    "Executive: priority {priority_tier}; MPI {mpi:.1f}; confidence {confidence_pct:.0f}%.",
}


def _mpi(anom_score: float, rul_h: float, downtime_cost_inr_hr: float,
         lead_days: float, spare_on_hand: bool) -> Dict[str, Any]:
    """Maintenance Priority Index = weighted composite normalised to 0-100."""
    # Component scores (0..1)
    sev = anom_score
    urgency = max(0.0, min(1.0, (168.0 - rul_h) / 168.0))            # week-window
    cost_norm = max(0.0, min(1.0, downtime_cost_inr_hr / 2_000_000)) # cap @ 20 lakh/h
    lead_norm = max(0.0, min(1.0, lead_days / 14.0))
    spare_pen = 0.0 if spare_on_hand else 1.0

    mpi_raw = (0.35 * sev + 0.25 * urgency + 0.20 * cost_norm
               + 0.10 * lead_norm + 0.10 * spare_pen) * 100
    if not spare_on_hand:
        mpi_raw *= 1.6  # spare-not-on-hand multiplier
    mpi = min(100.0, mpi_raw)
    return {
        "mpi": round(mpi, 1),
        "components": {
            "severity":   round(sev * 100, 1),
            "rul_urgency": round(urgency * 100, 1),
            "cost":        round(cost_norm * 100, 1),
            "lead_time":   round(lead_norm * 100, 1),
            "spare_penalty": round(spare_pen * 100, 1),
        },
        "spare_multiplier_applied": 1.6 if not spare_on_hand else 1.0,
    }


def _confidence_index(state: GraphState) -> Dict[str, Any]:
    """AI Confidence Index = 5-component weighted formula."""
    anom = state["anomaly"]
    rag = state["rag"]
    risk = state["risk"]
    ingestion_q = 1.0 if state["ingestion"]["quality"]["in_range"] else 0.6
    model_agreement = 1.0 - abs(anom["xgb_failure_proba"] - anom["isolation_forest_score"])
    evidence_score = (rag["evidence"][0]["score"] if rag["evidence"] else 0.0)
    rul_tight = 1.0 - min(0.6, risk["rul"]["sigma"] / max(risk["rul"]["rul_hours_mean"], 1) * 0.5)
    rule_agreement = 1.0 if anom["physics_rules_triggered"] else 0.7

    weights = {"ingestion": 0.15, "model_agreement": 0.30,
               "evidence": 0.25, "rul_tightness": 0.15, "rule_agreement": 0.15}
    components = {
        "ingestion": round(ingestion_q, 3),
        "model_agreement": round(model_agreement, 3),
        "evidence": round(evidence_score, 3),
        "rul_tightness": round(rul_tight, 3),
        "rule_agreement": round(rule_agreement, 3),
    }
    total = sum(weights[k] * components[k] for k in weights)
    return {
        "score_pct": round(total * 100, 1),
        "weights": weights,
        "components": components,
    }


def run(state: GraphState) -> GraphState:
    t0 = time.perf_counter()
    anom = state["anomaly"]; risk = state["risk"]; rag = state["rag"]
    biz = state.get("business_context") or {}
    downtime_cost = float(biz.get("downtime_cost_inr_hr", 1_650_000))  # ~$20K
    lead_days = float(biz.get("lead_time_days", 5))
    spare_on_hand = bool(biz.get("spare_on_hand", False))
    spare_part = str(biz.get("spare_part", "SKF-6312-bearing"))

    mpi = _mpi(anom["anomaly_score"], risk["rul"]["rul_hours_mean"],
               downtime_cost, lead_days, spare_on_hand)
    ci = _confidence_index(state)

    # Decision
    if mpi["mpi"] >= 80 or anom["severity"] == "CRITICAL":
        action = "IMMEDIATE_SHUTDOWN_REQUEST"
        priority_tier = "P1"
    elif mpi["mpi"] >= 60:
        action = "PLAN_MAINTENANCE"
        priority_tier = "P2"
    elif mpi["mpi"] >= 35:
        action = "SCHEDULE_INSPECTION"
        priority_tier = "P3"
    else:
        action = "MONITOR"
        priority_tier = "P4"

    sop_id = rag["evidence"][0]["doc_id"] if rag["evidence"] else "n/a"
    short = {
        "IMMEDIATE_SHUTDOWN_REQUEST": "request shutdown approval now",
        "PLAN_MAINTENANCE": "schedule maintenance this shift",
        "SCHEDULE_INSPECTION": "inspect within 24 h",
        "MONITOR": "continue monitoring",
    }[action]

    fmt = {
        "action": action, "action_short": short, "severity": anom["severity"],
        "rul": risk["rul"]["rul_hours_mean"], "sop_id": sop_id,
        "modes": ",".join(anom["physics_rules_triggered"]) or "none",
        "downstream": ",".join(risk["downstream_assets_at_risk"]) or "none",
        "spare_status": "on-hand" if spare_on_hand else "NOT on-hand",
        "spare_part": spare_part, "lead_days": lead_days,
        "spare_on_hand": spare_on_hand, "mpi": mpi["mpi"],
        "priority_tier": priority_tier,
        "cost_inr": downtime_cost * (risk["rul"]["rul_hours_mean"] / 24.0
                                     if action != "MONITOR" else 0.25),
        "confidence_pct": ci["score_pct"],
    }
    role_messages = {role: tpl.format(**fmt) for role, tpl in ROLE_TEMPLATES.items()}

    plan: Dict[str, Any] = {
        "action": action,
        "priority_tier": priority_tier,
        "mpi": mpi,
        "downtime_cost_inr_hr": downtime_cost,
        "estimated_avoidable_cost_inr": round(fmt["cost_inr"], 0),
        "spare_part": spare_part, "spare_on_hand": spare_on_hand,
        "lead_time_days": lead_days,
        "role_messages": role_messages,
        "primary_sop": sop_id,
    }
    state["plan"] = plan
    state["confidence_index"] = ci
    state["decision"] = {
        "action": action, "priority_tier": priority_tier,
        "mpi": mpi["mpi"], "confidence_pct": ci["score_pct"],
    }

    elapsed = (time.perf_counter() - t0) * 1000
    state["trace"].append({
        "agent": "Planner (MPI + Decision)",
        "summary": f"Decision={action}, MPI={mpi['mpi']:.1f}, confidence={ci['score_pct']:.0f}%.",
        "inputs": {"business_context": biz},
        "outputs": plan,
        "confidence": ci["score_pct"] / 100.0,
        "elapsed_ms": round(elapsed, 2),
    })
    return state


def feedback(state: GraphState) -> GraphState:
    """Log step (no-op for the demo; in prod it would write to a feedback store)."""
    state["feedback"] = {
        "logged": True,
        "trace_length": len(state.get("trace", [])),
        "decision": state.get("decision"),
    }
    state["trace"].append({
        "agent": "Feedback Loop",
        "summary": "Decision and trace persisted; awaiting human-in-loop review.",
        "inputs": {}, "outputs": state["feedback"],
        "confidence": 1.0, "elapsed_ms": 0.1,
    })
    return state
