"""Gemini wrapper with graceful fallback to deterministic mode.

USE_GEMINI=auto (default): use Gemini iff GOOGLE_API_KEY or ADC is configured.
USE_GEMINI=off            : always use deterministic fallback (judges-no-key mode).
USE_GEMINI=on             : require Gemini; raise on failure.
"""
from __future__ import annotations
import os
from functools import lru_cache


@lru_cache(maxsize=1)
def _client():
    mode = os.getenv("USE_GEMINI", "auto").lower()
    if mode == "off":
        return None
    try:
        import google.generativeai as genai
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        # If ADC is set on Cloud Run, the library picks it up automatically.
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        return genai.GenerativeModel(model_name)
    except Exception:
        if mode == "on":
            raise
        return None


def synthesize(prompt: str, fallback: str = "") -> str:
    """Run a single-shot Gemini call; return `fallback` on any failure."""
    model = _client()
    if model is None:
        return fallback
    try:
        resp = model.generate_content(
            prompt, generation_config={"max_output_tokens": 220, "temperature": 0.2}
        )
        text = (resp.text or "").strip()
        return text or fallback
    except Exception:
        return fallback
