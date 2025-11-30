#!/bin/bash
set -e

# =============================================================================
# GCP Cloud Run Deployment Script for Weather AI API
# =============================================================================

# Configuration - Update these or set as environment variables
PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="weather-ai-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Qdrant Cloud credentials (set these as env vars before running)
QDRANT_URL="${QDRANT_URL:-}"
QDRANT_API_KEY="${QDRANT_API_KEY:-}"

echo "=========================================="
echo "Deploying Weather AI API to Cloud Run"
echo "=========================================="
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Service: ${SERVICE_NAME}"
echo ""

# Check required variables
if [ "$PROJECT_ID" == "your-project-id" ]; then
    echo "ERROR: Please set GCP_PROJECT_ID environment variable"
    exit 1
fi

if [ -z "$QDRANT_URL" ] || [ -z "$QDRANT_API_KEY" ]; then
    echo "WARNING: QDRANT_URL or QDRANT_API_KEY not set. Chat features may not work."
fi

# Step 1: Enable required APIs (idempotent)
echo ""
echo "[1/4] Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    aiplatform.googleapis.com \
    cloudbuild.googleapis.com \
    --project=${PROJECT_ID}

# Step 2: Build and push container image
echo ""
echo "[2/4] Building container image..."
gcloud builds submit \
    --tag ${IMAGE_NAME} \
    --project=${PROJECT_ID}

# Step 3: Deploy to Cloud Run
echo ""
echo "[3/4] Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --project ${PROJECT_ID} \
    --allow-unauthenticated \
    --min-instances 0 \
    --max-instances 3 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60s \
    --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},GCP_LOCATION=${REGION},QDRANT_URL=${QDRANT_URL},QDRANT_API_KEY=${QDRANT_API_KEY}"

# Step 4: Get service URL
echo ""
echo "[4/4] Deployment complete!"
echo ""
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region ${REGION} \
    --project ${PROJECT_ID} \
    --format 'value(status.url)')

echo "=========================================="
echo "Service URL: ${SERVICE_URL}"
echo "=========================================="
echo ""
echo "Test the deployment:"
echo "  curl ${SERVICE_URL}/health"
echo ""
echo "Next steps:"
echo "  1. Update your frontend config to use: ${SERVICE_URL}"
echo "  2. Ingest the knowledge base: curl -X POST ${SERVICE_URL}/ingest -H 'Content-Type: application/json' -d '{\"content\": \"...\", \"source\": \"weather-terms\"}'"
