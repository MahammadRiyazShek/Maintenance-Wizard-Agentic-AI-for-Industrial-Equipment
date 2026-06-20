"""Agent 4 - RISK: Remaining Useful Life (RUL) estimation with confidence interval +
cascade failure propagation across the asset dependency graph."""
from __future__ import annotations
import math
import time
from typing import Any, Dict, List

from .state import GraphState

# Asset dependency graph (cascade rules)
# origin -> list of (downstream, delay_minutes, severity_decay)
DEPENDENCY = {
    "COOLING": [("MOTOR", 1.5, 0.85), ("GEARBOX", 6.0, 0.70)],
    "MOTOR":   [("GEARBOX", 4.5, 0.80)],
    "GEARBOX": [("COILER", 5.0, 0.75)],
    "COILER":  [],
}


def _rul_hours(anom_score: float, tool_wear: float, severity: str) -> Dict[str, Any]:
    """Heuristic RUL model approximating a Random Forest regressor fit on AI4I 2020.

    The relationship is monotonic: higher anomaly score & tool wear -> lower RUL.
    """
    base = 720.0  # 30 days nominal
    decay = (1.0 - anom_score) ** 1.8 * base
    wear_penalty = max(0.0, tool_wear - 100.0) * 1.4
    mu = max(2.0, decay - wear_penalty)
    sigma = max(1.5, mu * 0.18)
    lo = max(1.0, mu - 1.645 * sigma)
    hi = mu + 1.645 * sigma
    return {
        "rul_hours_mean": round(mu, 1),
        "rul_hours_ci90": [round(lo, 1), round(hi, 1)],
        "sigma": round(sigma, 2),
    }


def _cascade(origin: str, severity: float) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    queue = [(origin, severity, 0.0)]
    seen = {origin}
    while queue:
        node, sev, t = queue.pop(0)
        for child, delay, decay in DEPENDENCY.get(node, []):
            new_sev = sev * decay
            new_t = t + delay
            out.append({
                "from": node, "to": child,
                "eta_minutes": round(new_t, 1),
                "projected_severity": round(new_sev, 3),
            })
            if child not in seen and new_sev > 0.25:
                seen.add(child)
                queue.append((child, new_sev, new_t))
    return out


def run(state: GraphState) -> GraphState:
    t0 = time.perf_counter()
    anom = state["anomaly"]
    ing = state["ingestion"]
    rul = _rul_hours(anom["anomaly_score"], float(ing["reading"]["tool_wear"]),
                     anom["severity"])
    cascade = _cascade(state.get("asset_type", "MOTOR"), anom["anomaly_score"])

    risk_out: Dict[str, Any] = {
        "rul": rul,
        "cascade": cascade,
        "downstream_assets_at_risk": sorted({c["to"] for c in cascade}),
    }
    state["risk"] = risk_out

    elapsed = (time.perf_counter() - t0) * 1000
    state["trace"].append({
        "agent": "Risk (RUL + Cascade)",
        "summary": (f"RUL {rul['rul_hours_mean']} h "
                    f"(90% CI {rul['rul_hours_ci90'][0]}-{rul['rul_hours_ci90'][1]} h); "
                    f"{len(cascade)} downstream propagation paths."),
        "inputs": {"anomaly_score": anom["anomaly_score"]},
        "outputs": risk_out,
        "confidence": 0.85 - min(0.35, anom["anomaly_score"] * 0.3),
        "elapsed_ms": round(elapsed, 2),
    })
    return state
