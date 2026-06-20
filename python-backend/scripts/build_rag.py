"""Build a FAISS index over the bundled maintenance knowledge base."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KB = ROOT / "app" / "rag" / "knowledge_base.json"
IDX = ROOT / "app" / "rag" / "index"
IDX.mkdir(parents=True, exist_ok=True)


def main() -> None:
    import numpy as np
    import faiss
    from sentence_transformers import SentenceTransformer

    docs = json.loads(KB.read_text())
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    texts = [d["text"] for d in docs]
    vecs = model.encode(texts, normalize_embeddings=True).astype("float32")
    idx = faiss.IndexFlatIP(vecs.shape[1])
    idx.add(vecs)
    faiss.write_index(idx, str(IDX / "kb.faiss"))
    (IDX / "kb_docs.json").write_text(json.dumps(docs, indent=2))
    print(f"[rag] indexed {len(docs)} docs, dim={vecs.shape[1]} -> {IDX}")


if __name__ == "__main__":
    main()
