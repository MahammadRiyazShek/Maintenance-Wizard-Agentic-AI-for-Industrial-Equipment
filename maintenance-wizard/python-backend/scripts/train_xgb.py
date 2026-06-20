"""
Train XGBoost + Isolation Forest on the UCI AI4I 2020 Predictive Maintenance Dataset.

This script:
  1. Downloads ai4i2020.csv from UCI (with synthetic fallback if offline).
  2. Adds physics-derived features (temp diff, power, strain) per the
     AI4I paper failure modes (TWF, HDF, PWF, OSF).
  3. Trains XGBoost classifier + Isolation Forest anomaly detector.
  4. Saves artifacts to app/ml/artifacts/.

Re-run anytime; idempotent.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from urllib.request import urlretrieve

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    accuracy_score, classification_report, f1_score,
    precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "app" / "ml" / "artifacts"
ART.mkdir(parents=True, exist_ok=True)
LOCAL_CSV = ART / "ai4i2020.csv"
AI4I_URL = (
    "https://archive.ics.uci.edu/ml/machine-learning-databases/"
    "00601/ai4i2020.csv"
)

FEATURES = [
    "Air temperature [K]", "Process temperature [K]",
    "Rotational speed [rpm]", "Torque [Nm]", "Tool wear [min]",
    "temp_diff", "power_w", "strain",
    "type_L", "type_M", "type_H",
]


def synthesize_ai4i(n: int = 10000, seed: int = 42) -> pd.DataFrame:
    """Physics-faithful synthetic AI4I 2020 dataset (fallback when UCI is unreachable)."""
    rng = np.random.default_rng(seed)
    types = rng.choice(["L", "M", "H"], size=n, p=[0.5, 0.3, 0.2])
    air_t = rng.normal(300, 2, n)
    proc_t = air_t + rng.normal(10, 1, n)
    rpm = rng.normal(1538, 180, n)
    torque = np.clip(rng.normal(40, 10, n), 3.8, 76.6)
    wear = rng.integers(0, 250, n)

    # AI4I 2020 failure-mode physics rules
    twf = wear > 200                                               # Tool wear failure
    hdf = (proc_t - air_t < 8.6) & (rpm < 1380)                    # Heat dissipation
    pwf_w = torque * rpm * 2 * np.pi / 60
    pwf = (pwf_w < 3500) | (pwf_w > 9000)                          # Power
    osf_strain = wear * torque
    osf_thresh = np.where(types == "L", 11000, np.where(types == "M", 12000, 13000))
    osf = osf_strain > osf_thresh                                  # Overstrain

    fail = (twf | hdf | pwf | osf).astype(int)
    # Add realistic noise: 5% false positive, 10% missed
    keep = rng.random(n) < 0.95
    fail = fail & keep
    extra = rng.random(n) < 0.005
    fail = (fail | extra).astype(int)

    return pd.DataFrame({
        "UDI": np.arange(1, n + 1),
        "Product ID": [f"{t}{i:05d}" for t, i in zip(types, range(n))],
        "Type": types,
        "Air temperature [K]": air_t.round(1),
        "Process temperature [K]": proc_t.round(1),
        "Rotational speed [rpm]": rpm.round().astype(int),
        "Torque [Nm]": torque.round(1),
        "Tool wear [min]": wear,
        "Machine failure": fail,
        "TWF": twf.astype(int) & fail, "HDF": hdf.astype(int) & fail,
        "PWF": pwf.astype(int) & fail, "OSF": osf.astype(int) & fail,
        "RNF": np.zeros(n, dtype=int),
    })


def download_dataset() -> pd.DataFrame:
    if LOCAL_CSV.exists():
        print(f"[train] Using cached dataset: {LOCAL_CSV}")
        return pd.read_csv(LOCAL_CSV)
    try:
        print(f"[train] Downloading {AI4I_URL}")
        urlretrieve(AI4I_URL, LOCAL_CSV)
        return pd.read_csv(LOCAL_CSV)
    except Exception as e:
        print(f"[train] Download failed ({e}); using physics-faithful synthetic data.")
        df = synthesize_ai4i()
        df.to_csv(LOCAL_CSV, index=False)
        return df


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["temp_diff"] = df["Process temperature [K]"] - df["Air temperature [K]"]
    df["power_w"] = df["Torque [Nm]"] * df["Rotational speed [rpm]"] * 2 * np.pi / 60
    df["strain"] = df["Tool wear [min]"] * df["Torque [Nm]"]
    for v in ("L", "M", "H"):
        df[f"type_{v}"] = (df["Type"] == v).astype(int)
    return df


def main() -> None:
    df = download_dataset()
    df = add_features(df)
    print(f"[train] dataset shape: {df.shape}")

    X = df[FEATURES].values
    y = df["Machine failure"].astype(int).values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y,
    )
    scaler = StandardScaler().fit(X_train)
    Xtr = scaler.transform(X_train)
    Xte = scaler.transform(X_test)

    pos_weight = (y_train == 0).sum() / max((y_train == 1).sum(), 1)

    clf = XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.1,
        subsample=0.9, colsample_bytree=0.9,
        scale_pos_weight=pos_weight,
        eval_metric="logloss", tree_method="hist",
        n_jobs=1, verbosity=0, random_state=42,
    )
    clf.fit(Xtr, y_train)
    yp = clf.predict(Xte)
    yp_proba = clf.predict_proba(Xte)[:, 1]
    acc = accuracy_score(y_test, yp)
    f1 = f1_score(y_test, yp)
    prec = precision_score(y_test, yp, zero_division=0)
    rec = recall_score(y_test, yp, zero_division=0)
    try:
        auc = roc_auc_score(y_test, yp_proba)
    except Exception:
        auc = float("nan")
    print(f"[train] XGBoost  accuracy={acc:.4f}  f1={f1:.4f}  precision={prec:.4f}  recall={rec:.4f}  auc={auc:.4f}")
    print(classification_report(y_test, yp, digits=4))

    iso = IsolationForest(n_estimators=150, contamination=0.05,
                          random_state=42, n_jobs=1).fit(Xtr)

    metrics = {
        "model": "XGBoost+IsolationForest",
        "dataset": "UCI AI4I 2020 (or physics-faithful synthetic fallback)",
        "n_samples": int(df.shape[0]),
        "features": FEATURES,
        "accuracy": float(acc),
        "f1": float(f1),
        "precision": float(prec),
        "recall": float(rec),
        "roc_auc": float(auc) if not np.isnan(auc) else None,
        "failure_modes": ["TWF", "HDF", "PWF", "OSF"],
    }

    joblib.dump(clf, ART / "xgb_model.pkl")
    joblib.dump(iso, ART / "iso_forest.pkl")
    joblib.dump(scaler, ART / "scaler.pkl")
    (ART / "feature_order.json").write_text(json.dumps(FEATURES, indent=2))
    (ART / "metrics.json").write_text(json.dumps(metrics, indent=2))
    print(f"[train] saved artifacts to {ART}")


if __name__ == "__main__":
    main()
