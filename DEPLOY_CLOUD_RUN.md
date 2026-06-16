# 🚀 Google Cloud Run — One-Shot Deploy Guide

Maintenance Wizard is fully containerized. This single guide is everything you need to go from `unzip` → public Cloud Run URL.

---

## ✅ Pre-flight checklist (one-time)

```bash
# 1. Install gcloud CLI:  https://cloud.google.com/sdk/docs/install
gcloud --version

# 2. Authenticate
gcloud auth login
gcloud auth application-default login

# 3. Pick / set your project
gcloud config set project YOUR_PROJECT_ID

# 4. Enable the 3 required APIs (idempotent — safe to re-run)
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 🚀 Option A — Fastest path: `gcloud run deploy` (recommended)

This builds the Docker image on Google's servers and deploys in one shot:

```bash
gcloud run deploy maintenance-wizard \
  --source=. \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --timeout=300 \
  --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=YOUR_GEMINI_KEY"
```

The first deploy takes ~4-6 minutes. Subsequent deploys ~2 minutes.

When it finishes, you'll see:
```
Service [maintenance-wizard] revision [maintenance-wizard-00001-xyz] has been deployed
Service URL: https://maintenance-wizard-XXXXX-as.a.run.app
```

✅ **That URL is your live app.** Open it in a browser.

---

## 🛠️ Option B — Cloud Build pipeline (CI/CD style)

Use this if you want every `git push` to redeploy automatically.

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY=YOUR_GEMINI_KEY
```

`cloudbuild.yaml` is already wired to:
1. Build the Docker image via the multi-stage `Dockerfile`.
2. Push it to `gcr.io/$PROJECT_ID/maintenance-wizard`.
3. Deploy to Cloud Run in `asia-southeast1`.

---

## 🧪 Verify your deployment

```bash
# Replace with your service URL
SERVICE_URL="https://maintenance-wizard-XXXXX-as.a.run.app"

curl -s "$SERVICE_URL/api/health" | jq
# Expected: {"status":"up","timestamp":"...","keyConfigured":true}

curl -s "$SERVICE_URL/api/assets" | jq 'length'
# Expected: 18  (the 18 modeled steel-plant assets)
```

---

## 🔑 Environment variables

| Variable          | Required | Default | Notes                                     |
| ----------------- | -------- | ------- | ----------------------------------------- |
| `GEMINI_API_KEY`  | Yes      | —       | Get one at https://aistudio.google.com/   |
| `NODE_ENV`        | No       | —       | Set to `production` (the Dockerfile does) |
| `PORT`            | No       | `8080`  | Cloud Run sets this automatically         |

To update the key on an existing service without rebuilding:
```bash
gcloud run services update maintenance-wizard \
  --region=asia-southeast1 \
  --update-env-vars="GEMINI_API_KEY=NEW_KEY"
```

---

## 🏗️ Local Docker test (optional — sanity check before deploy)

```bash
docker build -t maintenance-wizard .
docker run -p 8080:8080 -e GEMINI_API_KEY=YOUR_KEY maintenance-wizard
# Open http://localhost:8080
```

---

## 🐛 Troubleshooting

| Symptom                                | Fix                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| `ERROR: ... container failed to start` | Check logs: `gcloud run services logs read maintenance-wizard --region=asia-southeast1` |
| `503 Service Unavailable` on first hit | Cold-start. Refresh after 5-10 s. Set `--min-instances=1` to eliminate.        |
| Gemini calls return 500                | `GEMINI_API_KEY` missing or quota exceeded.                                    |
| Build is slow                          | Use Option B (Cloud Build) — runs on bigger machines.                          |

---

## 📊 Recommended Cloud Run settings for judging

```bash
gcloud run services update maintenance-wizard \
  --region=asia-southeast1 \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=80 \
  --cpu-boost
```

* `--min-instances=1` → no cold starts during judging.
* `--cpu-boost` → faster first response.
* `--concurrency=80` → handles a judge clicking through quickly.
