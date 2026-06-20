"""Maintenance Wizard - FastAPI app entrypoint."""
from __future__ import annotations
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from .agents import run_pipeline, AGENT_TOPOLOGY
from .ml.model_loader import get_metrics
from . import viz

ROOT = Path(__file__).resolve().parent
app = FastAPI(title="Maintenance Wizard", version="1.0.0")
app.mount("/static", StaticFiles(directory=str(ROOT / "static")), name="static")
templates = Jinja2Templates(directory=str(ROOT / "templates"))


class Reading(BaseModel):
    air_temp: float = Field(300.0, description="Air temperature (K)")
    process_temp: float = Field(310.0, description="Process temperature (K)")
    rpm: float = Field(1500.0, description="Rotational speed (rpm)")
    torque: float = Field(40.0, description="Torque (Nm)")
    tool_wear: float = Field(0.0, description="Tool wear (min)")
    type: str = Field("M", description="Product quality L/M/H")


class BusinessContext(BaseModel):
    downtime_cost_inr_hr: float = 1_650_000   # ~ $20K/hr
    spare_part: str = "SKF-6312-bearing"
    spare_on_hand: bool = False
    lead_time_days: float = 5.0


class AnalyzeRequest(BaseModel):
    asset_id: str = "HSM-MOTOR-07"
    asset_type: str = "MOTOR"
    reading: Reading = Field(default_factory=Reading)
    business_context: BusinessContext = Field(default_factory=BusinessContext)


@app.get("/health")
def health():
    return {"status": "ok", "metrics": get_metrics()}


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    metrics = get_metrics()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "metrics": metrics,
        "topology": AGENT_TOPOLOGY,
    })


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "metrics": get_metrics(),
        "topology": AGENT_TOPOLOGY,
    })


@app.get("/judges", response_class=HTMLResponse)
def judges(request: Request):
    return templates.TemplateResponse("judges.html", {
        "request": request,
        "metrics": get_metrics(),
    })


@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    state = run_pipeline(
        asset_id=req.asset_id,
        asset_type=req.asset_type,
        reading=req.reading.model_dump(),
        business_context=req.business_context.model_dump(),
    )
    # Strip non-serialisable / heavy fields
    out: Dict[str, Any] = {
        "asset_id": state["asset_id"],
        "asset_type": state["asset_type"],
        "ingestion": state["ingestion"],
        "anomaly": state["anomaly"],
        "rag": state["rag"],
        "risk": state["risk"],
        "plan": state["plan"],
        "feedback": state["feedback"],
        "confidence_index": state["confidence_index"],
        "decision": state["decision"],
        "trace": state["trace"],
    }
    return JSONResponse(out)


@app.get("/api/viz/topology")
def viz_topology():
    return viz.topology_figure(AGENT_TOPOLOGY)


@app.get("/api/viz/twin")
def viz_twin(cooling: float = 0.2, motor: float = 0.45,
             gearbox: float = 0.3, coiler: float = 0.15):
    return viz.twin_3d({
        "cooling": cooling, "motor": motor, "gearbox": gearbox, "coiler": coiler,
    })


@app.get("/api/viz/cascade")
def viz_cascade(origin: str = "COOLING", severity: float = 0.8):
    return viz.cascade_graph(origin=origin, severity=severity)


@app.get("/api/viz/mpi")
def viz_mpi(severity: float = 60, rul_urgency: float = 70, cost: float = 50,
            lead_time: float = 35, spare_penalty: float = 100, total: float = 78):
    return viz.mpi_breakdown({
        "severity": severity, "rul_urgency": rul_urgency, "cost": cost,
        "lead_time": lead_time, "spare_penalty": spare_penalty,
    }, total)


@app.get("/api/viz/roi")
def viz_roi(downtime_cost_inr_hr: float = 1_650_000, lead_days_max: int = 14):
    return viz.roi_curve(downtime_cost_inr_hr, lead_days_max)


@app.post("/admin/retrain")
def retrain():
    script = Path(__file__).resolve().parents[1] / "scripts" / "train_xgb.py"
    proc = subprocess.run([sys.executable, str(script)], capture_output=True, text=True)
    # Clear the lazy cache so the new model is picked up
    from .ml import model_loader
    model_loader.get_models.cache_clear()
    return {
        "ok": proc.returncode == 0,
        "stdout_tail": proc.stdout.splitlines()[-20:],
        "stderr_tail": proc.stderr.splitlines()[-20:],
        "metrics": get_metrics(),
    }
