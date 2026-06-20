# Deploy Maintenance Wizard to Google Cloud Run

> One-page operational runbook. Tested on `asia-southeast1` and `asia-south1`.

---

## 0 · Prerequisites

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com \
                       containerregistry.googleapis.com
```

You will also need a **Gemini API key** from <https://aistudio.google.com/app/apikey>.

---

## 1 · One-command deploy (recommended)

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY=YOUR_GEMINI_KEY
```

That single command:

1. Builds the multi-stage Alpine Docker image (~ 90 MB).
2. Pushes the image to `gcr.io/$PROJECT_ID/maintenance-wizard:latest` **and** `:$SHORT_SHA`.
3. Deploys to Cloud Run in `asia-southeast1` with sensible defaults:
   - 1 vCPU · 1 GiB RAM · `max-instances=10` · `--allow-unauthenticated`
   - Env vars: `NODE_ENV=production`, `GEMINI_API_KEY=<your-key>`

---

## 2 · Manual deploy (if you need fine-grained control)

```bash
# Build & push
docker build -t gcr.io/$PROJECT_ID/maintenance-wizard:latest .
docker push gcr.io/$PROJECT_ID/maintenance-wizard:latest

# Deploy
gcloud run deploy maintenance-wizard \
  --image=gcr.io/$PROJECT_ID/maintenance-wizard:latest \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars=NODE_ENV=production,GEMINI_API_KEY=YOUR_GEMINI_KEY
```

The deploy command prints the service URL (e.g. `https://maintenance-wizard-xxxxx-as.a.run.app`).

---

## 3 · Healthcheck

```bash
curl https://<your-cloud-run-url>/api/health
# → {"status":"up","timestamp":"...","keyConfigured":true}
```

`keyConfigured: true` confirms the Gemini key reached the runtime.

---

## 4 · Custom Domain (optional)

```bash
gcloud beta run domain-mappings create \
  --service=maintenance-wizard \
  --domain=wizard.yourcompany.com \
  --region=asia-southeast1
```

Follow the DNS records Cloud Run prints.

---

## 5 · Update / redeploy

Push to your repo and re-run the build command (or wire it to a Cloud Build trigger):

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_KEY=YOUR_GEMINI_KEY
```

---

## 6 · Rollback

List revisions and route traffic back:

```bash
gcloud run revisions list --service=maintenance-wizard --region=asia-southeast1
gcloud run services update-traffic maintenance-wizard \
  --to-revisions=maintenance-wizard-00007-xyz=100 \
  --region=asia-southeast1
```

---

## 7 · Logs & Tracing

```bash
gcloud run services logs read maintenance-wizard \
  --region=asia-southeast1 --limit=200
```

Or open the [Cloud Run console](https://console.cloud.google.com/run) → service → **Logs**.

---

## 8 · Cost Notes

- **Cold start**: ~1.5 s thanks to the Distroless-style Alpine image.
- **At 0 traffic**: $0 (autoscale to zero).
- **At ~100 req/min**: < $5 / month including egress.
- **Gemini calls**: billed separately under your AI Studio key.

---

## 9 · Troubleshooting

| Symptom | Fix |
|---|---|
| `Container failed to start` | Confirm `PORT=8080` is honoured. The server.ts reads `process.env.PORT`. |
| `403 from Container Registry` | Run `gcloud auth configure-docker`. |
| `keyConfigured: false` in /api/health | Re-run deploy with `--set-env-vars=GEMINI_API_KEY=...` or set it in the Cloud Run console → **Variables**. |
| Build fails on `npm ci` | Make sure `package-lock.json` is committed. |
| Static assets 404 | Confirm `dist/` is included in the runtime stage — the included Dockerfile does this. |

---

**That's it — production-grade deploy in under 4 minutes.** 🚀
