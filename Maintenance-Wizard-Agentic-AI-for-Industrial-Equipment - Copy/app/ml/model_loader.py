"""Lazy-load XGBoost + Isolation Forest + Scaler. Auto-retrains if artifacts missing."""
from __future__ import annotations
import json
import os
import subprocess
import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

import joblib

ART = Path(__file__).resolve().parents[2] / "app" / "ml" / "artifacts"
# Walk up correctly: file is .../app/ml/model_loader.py
ART = Path(__file__).resolve().parent / "artifacts"


@dataclass
class Models:
    xgb: Any
    iso: Any
    scaler: Any
    feature_order: List[str]
    metrics: Dict[str, Any]


def _train_if_needed() -> None:
    needed = ["xgb_model.pkl", "iso_forest.pkl", "scaler.pkl",
              "feature_order.json", "metrics.json"]
    if all((ART / f).exists() for f in needed):
        return
    print("[model_loader] artifacts missing -> retraining", flush=True)
    script = Path(__file__).resolve().parents[2] / "scripts" / "train_xgb.py"
    subprocess.run([sys.executable, str(script)], check=False)


@lru_cache(maxsize=1)
def get_models() -> Models:
    _train_if_needed()
    return Models(
        xgb=joblib.load(ART / "xgb_model.pkl"),
        iso=joblib.load(ART / "iso_forest.pkl"),
        scaler=joblib.load(ART / "scaler.pkl"),
        feature_order=json.loads((ART / "feature_order.json").read_text()),
        metrics=json.loads((ART / "metrics.json").read_text()),
    )


def get_metrics() -> Dict[str, Any]:
    return get_models().metrics
