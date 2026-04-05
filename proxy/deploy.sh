#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Deploy Google Reviews Proxy to Google Cloud Functions (2nd gen)
# ─────────────────────────────────────────────────────────────────────────────
#
# Prerequisites:
#   1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. Authenticate: gcloud auth login
#   3. Set project: gcloud config set project YOUR_PROJECT_ID
#   4. Enable APIs:
#        gcloud services enable cloudfunctions.googleapis.com
#        gcloud services enable cloudbuild.googleapis.com
#        gcloud services enable run.googleapis.com
#        gcloud services enable places-backend.googleapis.com
#
# Usage:
#   1. Edit .env.yaml — replace YOUR_GOOGLE_API_KEY with your real key
#   2. Run: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

FUNCTION_NAME="google-reviews-proxy"
REGION="us-east1"        # Close to Sunrise, FL for low latency
RUNTIME="nodejs20"
ENTRY_POINT="googleReviewsProxy"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploying Google Reviews Proxy to Cloud Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Function:    $FUNCTION_NAME"
echo "  Region:      $REGION"
echo "  Runtime:     $RUNTIME"
echo "  Entry Point: $ENTRY_POINT"
echo ""

# Check if .env.yaml has been configured
if grep -q "YOUR_GOOGLE_API_KEY" .env.yaml; then
  echo "⚠️  ERROR: You must replace YOUR_GOOGLE_API_KEY in .env.yaml first!"
  echo "   Edit .env.yaml and add your real Google API key."
  exit 1
fi

# Deploy
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --region="$REGION" \
  --runtime="$RUNTIME" \
  --source=. \
  --entry-point="$ENTRY_POINT" \
  --trigger-http \
  --allow-unauthenticated \
  --env-vars-file=.env.yaml \
  --memory=256MiB \
  --timeout=30s \
  --max-instances=10 \
  --min-instances=0

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Deployment complete!"
echo ""
echo "  Your proxy URL:"
PROXY_URL=$(gcloud functions describe "$FUNCTION_NAME" --region="$REGION" --gen2 --format='value(serviceConfig.uri)')
echo "  $PROXY_URL"
echo ""
echo "  Test it:"
echo "  curl \"$PROXY_URL/find?query=AI+Consultant+Pros+Sunrise+FL\""
echo ""
echo "  Next steps:"
echo "  1. Copy the proxy URL above"
echo "  2. Update your widget config to use proxyUrl instead of apiKey"
echo "  3. Lock down ALLOWED_ORIGINS in .env.yaml to your domain(s)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
