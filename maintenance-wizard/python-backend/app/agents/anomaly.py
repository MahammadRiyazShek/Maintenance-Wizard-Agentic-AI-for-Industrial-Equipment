"""Agent 2 - ANOMALY: XGBoost classifier + Isolation Forest + physics ensemble."""
from __future__ import annotations
import time
from typing import Any, Dict

import numpy as np

from ..ml.model_loader import get_models
from .state import GraphState


def _physics_rules(r: Dict[str, Any], f: Dict[str, Any], asset_type: str) -> Dict[str, bool]:
    """AI4I 2020 failure-mode physics rules."""
    rules = {
        "TWF": float(r["tool_wear"]) > 200.0,
        "HDF": (f["temp_diff"] < 8.6) and (float(r["rpm"]) < 1380.0),
        "PWF": (f["power_w"] < 3500.0) or (f["power_w"] > 9000.0),
    }
    t = str(r.get("type", "M"))
    osf_thresh = {"L": 11000, "M": 12000, "H": 13000}.get(t, 12000)
    rules["OSF"] = f["strain"] > osf_thresh
    return rules


def run(state: GraphState) -> GraphState:
    t0 = time.perf_counter()
    ing = state["ingestion"]
    r = ing["reading"]
    f = ing["features"]
    asset_type = state.get("asset_type", "MOTOR")

    models = get_models()
    feat_order = models.feature_order
    type_str = str(r.get("type", "M"))
    vec = {
        "Air temperature [K]": float(r["air_temp"]),
        "Process temperature [K]": float(r["process_temp"]),
        "Rotational speed [rpm]": float(r["rpm"]),
        "Torque [Nm]": float(r["torque"]),
        "Tool wear [min]": float(r["tool_wear"]),
        "temp_diff": f["temp_diff"],
        "power_w": f["power_w"],
        "strain": f["strain"],
        "type_L": 1.0 if type_str == "L" else 0.0,
        "type_M": 1.0 if type_str == "M" else 0.0,
        "type_H": 1.0 if type_str == "H" else 0.0,
    }
    X = np.array([[vec[k] for k in feat_order]], dtype=float)
    Xs = models.scaler.transform(X)

    proba = float(models.xgb.predict_proba(Xs)[0, 1])
    iso_score = float(-models.iso.score_samples(Xs)[0])  # higher = more anomalous
    iso_norm = max(0.0, min(1.0, (iso_score - 0.4) / 0.4))

    rules = _physics_rules(r, f, asset_type)
    triggered = [k for k, v in rules.items() if v]
    rule_score = min(1.0, 0.25 * len(triggered))

    # Weighted ensemble
    score = 0.55 * proba + 0.25 * iso_norm + 0.20 * rule_score
    severity = ("CRITICAL" if score > 0.75 else
                "HIGH" if score > 0.5 else
                "MEDIUM" if score > 0.3 else "LOW")

    anomaly: Dict[str, Any] = {
        "anomaly_score": round(score, 4),
        "xgb_failure_proba": round(proba, 4),
        "isolation_forest_score": round(iso_norm, 4),
        "physics_rules_triggered": triggered,
        "severity": severity,
        "model_accuracy": models.metrics.get("accuracy"),
    }
    state["anomaly"] = anomaly

    elapsed = (time.perf_counter() - t0) * 1000
    state["trace"].append({
        "agent": "Anomaly Detector",
        "summary": (f"Ensemble score {score:.2f} ({severity}); "
                    f"XGBoost p={proba:.2f}; rules={triggered or 'none'}."),
        "inputs": {"features": f},
        "outputs": anomaly,
        "confidence": min(1.0, 0.6 + score * 0.4),
        "elapsed_ms": round(elapsed, 2),
    })
    return state
