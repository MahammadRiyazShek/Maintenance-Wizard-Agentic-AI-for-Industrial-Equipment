#!/usr/bin/env bash
# One-shot deploy to Google Cloud Run.
# Usage:  PROJECT_ID=my-gcp-project ./deploy.sh
set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID env var}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-maintenance-wizard}"
REPO="${REPO:-maintenance-wizard}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}:latest"

echo "==> Enabling required APIs"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
    cloudbuild.googleapis.com aiplatform.googleapis.com \
    --project "${PROJECT_ID}"

echo "==> Ensuring Artifact Registry repo exists"
gcloud artifacts repositories describe "${REPO}" --location "${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1 \
    || gcloud artifacts repositories create "${REPO}" --repository-format=docker --location "${REGION}" --project "${PROJECT_ID}"

echo "==> Building image with Cloud Build: ${IMAGE}"
gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}" --timeout=1800s

echo "==> Deploying to Cloud Run: ${SERVICE} @ ${REGION}"
gcloud run deploy "${SERVICE}" \
    --image "${IMAGE}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --allow-unauthenticated \
    --cpu 2 --memory 2Gi \
    --min-instances 0 --max-instances 3 \
    --port 8080 \
    --set-env-vars "GEMINI_MODEL=gemini-1.5-flash,USE_GEMINI=auto"

echo "==> Done. Service URL:"
gcloud run services describe "${SERVICE}" --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)'
