# 🚀 Cloud Run Deployment Guide — Maintenance Wizard

This package is **production-ready** for Google Cloud Run. Pick the path that
matches your situation.

---

## Prerequisites (one-time)

```bash
# 1. Install gcloud:  https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Get a Gemini API key:  https://aistudio.google.com/app/apikey
export GEMINI_API_KEY="AIza...your-key..."
export PROJECT_ID="your-gcp-project-id"
```

The deploy script enables the required APIs automatically
(`run`, `artifactregistry`, `cloudbuild`).

---

## Path A — One-shot script (recommended)

```bash
chmod +x deploy.sh
PROJECT_ID=$PROJECT_ID GEMINI_API_KEY=$GEMINI_API_KEY ./deploy.sh
```

This single command:

1. Enables Cloud Run, Cloud Build, Artifact Registry APIs.
2. Creates the Artifact Registry repo if it does not exist.
3. Builds the multi-stage Docker image with Cloud Build.
4. Deploys the image to Cloud Run in `asia-southeast1`.
5. Prints the public URL and runs a `/api/health` smoke test.

**Override any default:**

```bash
REGION=us-central1 \
SERVICE=maintenance-wizard-prod \
MEMORY=2Gi CPU=2 MAX_INSTANCES=20 \
PROJECT_ID=$PROJECT_ID GEMINI_API_KEY=$GEMINI_API_KEY \
./deploy.sh
```

---

## Path B — Cloud Build YAML

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY=$GEMINI_API_KEY,_REGION=asia-southeast1
```

Useful when wiring the deploy into a GitHub / Cloud Source Repositories trigger.

---

## Path C — Pure `gcloud` (no script, no YAML)

```bash
# Build with Cloud Build (no Docker daemon needed locally)
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/maintenance-wizard:latest \
  --timeout=1800s

# Deploy
gcloud run deploy maintenance-wizard \
  --image=gcr.io/$PROJECT_ID/maintenance-wizard:latest \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi --cpu=1 \
  --min-instances=0 --max-instances=10 \
  --timeout=300 \
  --set-env-vars=NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY
```

---

## Path D — Local Docker build (for testing the image)

```bash
docker build -t maintenance-wizard:local .
docker run --rm -p 8080:8080 \
  -e GEMINI_API_KEY=$GEMINI_API_KEY \
  -e NODE_ENV=production \
  maintenance-wizard:local

# In another shell:
curl http://localhost:8080/api/health
open  http://localhost:8080
```

---

## Verifying the deploy

```bash
URL=$(gcloud run services describe maintenance-wizard \
        --region=asia-southeast1 --format='value(status.url)')

curl  $URL/api/health         # → {"status":"up","keyConfigured":true,...}
curl  $URL/api/assets | jq .  # → seed asset telemetry
curl  $URL/api/autopilot/events?limit=3 | jq .  # daemon timeline
open  $URL                    # the React UI
```

If `keyConfigured` is `false`, the env var didn't reach the container — re-deploy
with `--set-env-vars=GEMINI_API_KEY=...` or set it in the Cloud Run console.

---

## Environment variables (Cloud Run)

| Variable          | Required | Purpose                                                    |
| ----------------- | -------- | ---------------------------------------------------------- |
| `GEMINI_API_KEY`  | ✅ Yes   | Server-side key for Gemini 2.5 Flash (diagnose / chat).   |
| `NODE_ENV`        | ✅ Yes   | Set to `production` so the server serves `dist/` statics.  |
| `PORT`            | (auto)   | Cloud Run injects this; the server reads `process.env.PORT`. |
| `APP_URL`         | optional | Public URL of the deployed app (self-referential links).   |

---

## Updating / redeploying

Just re-run the same script — Cloud Run rolls out a new revision with zero
downtime and keeps the old one for instant rollback.

```bash
gcloud run revisions list --service=maintenance-wizard --region=asia-southeast1
gcloud run services update-traffic maintenance-wizard \
  --to-revisions=maintenance-wizard-00007-xyz=100 \
  --region=asia-southeast1
```

---

## Cost expectations

| Scenario          | Approx monthly cost              |
| ----------------- | -------------------------------- |
| Idle / 0 traffic  | **$0** (Cloud Run scales to zero) |
| ~100 req / minute | **< $5** + Gemini token spend     |
| Heavy demo day    | ~$10–20 + Gemini token spend      |

Gemini calls are billed separately under your AI Studio key.

---

## Optional — Python agentic backend (`python-backend/`)

The bundle also includes a second, **standalone** Python service
(`python-backend/`) — a FastAPI + LangGraph + XGBoost + FAISS implementation of
the same agent. It deploys identically:

```bash
cd python-backend
PROJECT_ID=$PROJECT_ID ./deploy.sh
```

You do **not** need it to run the main UI — the React/Express app is fully
self-contained. Use it only if you want a Python-native reference of the
5-agent pipeline.

---

## Troubleshooting

| Symptom                                  | Fix                                                         |
| ---------------------------------------- | ----------------------------------------------------------- |
| `Container failed to start`              | Confirm `PORT=8080` is unset in `.env` (Cloud Run injects).  |
| `keyConfigured: false`                   | Re-deploy with `--set-env-vars=GEMINI_API_KEY=...`.          |
| `403 from Artifact Registry`             | `gcloud auth configure-docker $REGION-docker.pkg.dev`.      |
| `npm ci` fails in build                  | Make sure `package-lock.json` is committed (it is here).    |
| Static assets 404                        | `dist/` is created during `npm run build` — verify build logs. |
| Gemini 503 / rate-limit                  | Add retry/backoff; verify the API key is on a paid project. |

---

**You're done. Open the URL and ship it.** 🛠️⚡
