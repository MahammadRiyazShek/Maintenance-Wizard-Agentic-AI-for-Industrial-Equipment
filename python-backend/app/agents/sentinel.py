"""Agent 1 - SENTINEL (Ingestion): validate, normalize, derive physics features."""
from __future__ import annotations
import math
import time
from typing import Any, Dict

from .state import GraphState

# AI4I 2020 nominal operating envelope
ENVELOPE = {
    "air_temp":     (295.0, 305.0),
    "process_temp": (305.0, 315.0),
    "rpm":          (1168.0, 2886.0),
    "torque":       (3.8, 76.6),
    "tool_wear":    (0.0, 253.0),
}


def run(state: GraphState) -> GraphState:
    t0 = time.perf_counter()
    r = dict(state.get("reading") or {})
    # Required keys with safe defaults
    r.setdefault("air_temp", 300.0)
    r.setdefault("process_temp", 310.0)
    r.setdefault("rpm", 1500.0)
    r.setdefault("torque", 40.0)
    r.setdefault("tool_wear", 0.0)
    r.setdefault("type", "M")

    # Physics-derived features
    temp_diff = float(r["process_temp"]) - float(r["air_temp"])
    power_w = float(r["torque"]) * float(r["rpm"]) * 2 * math.pi / 60.0
    strain = float(r["tool_wear"]) * float(r["torque"])

    # Range/quality check
    in_range = True
    flags = []
    for k, (lo, hi) in ENVELOPE.items():
        v = float(r.get(k, (lo + hi) / 2))
        if not (lo - 0.5 * (hi - lo) <= v <= hi + 0.5 * (hi - lo)):
            in_range = False
            flags.append(f"{k}_out_of_envelope")

    ingestion: Dict[str, Any] = {
        "reading": r,
        "features": {
            "temp_diff": round(temp_diff, 3),
            "power_w": round(power_w, 2),
            "strain": round(strain, 2),
        },
        "quality": {"in_range": in_range, "flags": flags},
    }
    state["ingestion"] = ingestion

    elapsed = (time.perf_counter() - t0) * 1000
    trace = state.setdefault("trace", [])
    trace.append({
        "agent": "Sentinel (Ingestion)",
        "summary": f"Validated reading and derived physics features (temp_diff={temp_diff:.1f} K, power={power_w:.0f} W).",
        "inputs": {"asset_id": state.get("asset_id"), "asset_type": state.get("asset_type")},
        "outputs": ingestion,
        "confidence": 1.0 if in_range else 0.6,
        "elapsed_ms": round(elapsed, 2),
    })
    return state
