"""Smoke test: train (if needed), then run the pipeline end-to-end."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import os
os.environ.setdefault("USE_GEMINI", "off")
os.environ.setdefault("RAG_DISABLE", "1")  # use lexical fallback for the test

from app.agents.graph import run_pipeline  # noqa: E402

state = run_pipeline(
    asset_id="HSM-MOTOR-07",
    asset_type="MOTOR",
    reading={
        "air_temp": 300, "process_temp": 307.5,
        "rpm": 1320, "torque": 58, "tool_wear": 215, "type": "M",
    },
    business_context={
        "downtime_cost_inr_hr": 1_650_000,
        "spare_part": "SKF-6312-bearing",
        "spare_on_hand": False, "lead_time_days": 5,
    },
)

print(json.dumps({
    "decision": state["decision"],
    "mpi": state["plan"]["mpi"],
    "confidence_index": state["confidence_index"],
    "rul": state["risk"]["rul"],
    "trace_steps": [t["agent"] for t in state["trace"]],
}, indent=2))

assert state["decision"]["action"] in (
    "MONITOR", "SCHEDULE_INSPECTION", "PLAN_MAINTENANCE", "IMMEDIATE_SHUTDOWN_REQUEST"
)
assert "mpi" in state["plan"]
assert len(state["trace"]) == 6
print("\nOK :)")
