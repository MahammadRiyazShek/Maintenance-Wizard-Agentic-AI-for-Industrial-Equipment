"""FAISS retriever with lexical fallback if FAISS/sentence-transformers unavailable."""
from __future__ import annotations
import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path(__file__).resolve().parent
KB_PATH = ROOT / "knowledge_base.json"
IDX_DIR = ROOT / "index"


class Retriever:
    def __init__(self) -> None:
        self.docs: List[Dict[str, Any]] = json.loads(KB_PATH.read_text())
        self._faiss = None
        self._model = None
        self._load_faiss_if_available()

    def _load_faiss_if_available(self) -> None:
        if os.getenv("RAG_DISABLE", "0") == "1":
            return
        try:
            if not (IDX_DIR / "kb.faiss").exists():
                return  # No prebuilt index; use lexical fallback.
            import faiss
            from sentence_transformers import SentenceTransformer
            self._faiss = faiss.read_index(str(IDX_DIR / "kb.faiss"))
            self._model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        except Exception:
            self._faiss = None
            self._model = None

    def search(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        if self._faiss is not None and self._model is not None:
            return self._search_faiss(query, k)
        return self._search_lexical(query, k)

    def _search_faiss(self, query: str, k: int) -> List[Dict[str, Any]]:
        import numpy as np
        v = self._model.encode([query], normalize_embeddings=True).astype("float32")
        scores, idxs = self._faiss.search(v, k)
        out: List[Dict[str, Any]] = []
        for s, i in zip(scores[0], idxs[0]):
            if i < 0:
                continue
            d = dict(self.docs[i])
            d["score"] = float(s)
            out.append(d)
        return out

    def _search_lexical(self, query: str, k: int) -> List[Dict[str, Any]]:
        """BM25-lite term overlap fallback. Works without any ML dependency."""
        terms = [t.lower() for t in re.findall(r"[A-Za-z]{3,}", query)]
        scored = []
        for d in self.docs:
            text = (d["text"] + " " + d.get("asset", "") + " " + d.get("category", "")).lower()
            hits = sum(text.count(t) for t in terms)
            if hits == 0:
                continue
            score = hits / (len(terms) + 3)
            scored.append((score, d))
        scored.sort(key=lambda x: -x[0])
        out = []
        for s, d in scored[:k]:
            dd = dict(d); dd["score"] = round(min(1.0, s), 4)
            out.append(dd)
        if not out:
            # always return at least the generic MPI doc so RAG never empties
            dd = dict(self.docs[-2]); dd["score"] = 0.20
            out.append(dd)
        return out


@lru_cache(maxsize=1)
def get_retriever() -> Retriever:
    return Retriever()
