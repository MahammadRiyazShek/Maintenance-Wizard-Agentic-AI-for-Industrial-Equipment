#!/usr/bin/env bash
# =============================================================================
# Maintenance Wizard — One-shot deploy to Google Cloud Run
# -----------------------------------------------------------------------------
# Usage:
#   PROJECT_ID=my-gcp-project GEMINI_API_KEY=AIza... ./deploy.sh
#
# Optional env vars (with sensible defaults):
#   REGION         Cloud Run region              (default: asia-southeast1)
#   SERVICE        Cloud Run service name        (default: maintenance-wizard)
#   REPO           Artifact Registry repo name   (default: maintenance-wizard)
#   MEMORY         Container memory              (default: 1Gi)
#   CPU            Container vCPU                (default: 1)
#   MAX_INSTANCES  Max horizontal autoscale      (default: 10)
#   MIN_INSTANCES  Min instances (cold-start ↓) (default: 0)
# =============================================================================

set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID env var, e.g. PROJECT_ID=my-gcp-project}"
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY env var (get one at https://aistudio.google.com/app/apikey)}"

REGION="${REGION:-asia-southeast1}"
SERVICE="${SERVICE:-maintenance-wizard}"
REPO="${REPO:-maintenance-wizard}"
MEMORY="${MEMORY:-1Gi}"
CPU="${CPU:-1}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:latest"

echo "================================================================="
echo " Maintenance Wizard → Cloud Run deploy"
echo " Project : ${PROJECT_ID}"
echo " Region  : ${REGION}"
echo " Service : ${SERVICE}"
echo " Image   : ${IMAGE}"
echo "================================================================="

echo "==> [1/5] Enabling required APIs (idempotent)…"
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    --project "${PROJECT_ID}"

echo "==> [2/5] Ensuring Artifact Registry repo '${REPO}' exists in ${REGION}…"
gcloud artifacts repositories describe "${REPO}" \
    --location "${REGION}" \
    --project "${PROJECT_ID}" >/dev/null 2>&1 \
  || gcloud artifacts repositories create "${REPO}" \
        --repository-format=docker \
        --location "${REGION}" \
        --project "${PROJECT_ID}" \
        --description "Maintenance Wizard container images"

echo "==> [3/5] Building image with Cloud Build (this takes 3–6 min)…"
gcloud builds submit \
    --tag "${IMAGE}" \
    --project "${PROJECT_ID}" \
    --timeout=1800s \
    --machine-type=E2_HIGHCPU_8

echo "==> [4/5] Deploying revision to Cloud Run…"
gcloud run deploy "${SERVICE}" \
    --image "${IMAGE}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --cpu "${CPU}" \
    --memory "${MEMORY}" \
    --min-instances "${MIN_INSTANCES}" \
    --max-instances "${MAX_INSTANCES}" \
    --timeout 300 \
    --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=${GEMINI_API_KEY}"

echo "==> [5/5] Verifying deployment…"
URL=$(gcloud run services describe "${SERVICE}" \
        --region "${REGION}" \
        --project "${PROJECT_ID}" \
        --format='value(status.url)')

echo ""
echo "================================================================="
echo " ✅ Deployed successfully"
echo " 🌐 Service URL : ${URL}"
echo " 🩺 Healthcheck : ${URL}/api/health"
echo "================================================================="

# Quick smoke test (does not fail the script if the service is still warming).
sleep 5
echo "==> Smoke testing /api/health…"
curl -fsS "${URL}/api/health" || echo "(health check pending — try again in 10 s)"
echo ""
