# Google Reviews Proxy — Google Cloud Function

A secure server-side proxy that fetches Google Place reviews using your API key, keeping it hidden from browser clients. Pairs with the **Google Reviews Widget** for a complete embed solution.

## Architecture

```
┌──────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│  Your Website │───▶│  Cloud Function      │───▶│  Google Places   │
│  (widget.js)  │    │  (holds API key)     │    │  API             │
│               │◀───│  + in-memory cache   │◀───│                  │
│  No API key   │    │                     │    │                  │
│  in browser!  │    │  ALLOWED_ORIGINS     │    │                  │
└──────────────┘    └─────────────────────┘    └──────────────────┘
```

## Quick Start

### 1. Prerequisites

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable places-backend.googleapis.com
```

### 2. Configure

Edit `.env.yaml` and replace `YOUR_GOOGLE_API_KEY` with your actual key:

```yaml
GOOGLE_API_KEY: "AIzaSy...your-real-key..."
ALLOWED_ORIGINS: "https://yourdomain.com,https://www.yourdomain.com"
CACHE_TTL_SECONDS: "3600"
```

**Important:** In production, set `ALLOWED_ORIGINS` to your actual domain(s) to prevent unauthorized access. Use `*` only for testing.

### 3. Deploy

```bash
bash deploy.sh
```

Or manually:

```bash
gcloud functions deploy google-reviews-proxy \
  --gen2 \
  --region=us-east1 \
  --runtime=nodejs20 \
  --source=. \
  --entry-point=googleReviewsProxy \
  --trigger-http \
  --allow-unauthenticated \
  --env-vars-file=.env.yaml \
  --memory=256MiB \
  --timeout=30s \
  --max-instances=10
```

### 4. Get Your Proxy URL

After deployment, get your function URL:

```bash
gcloud functions describe google-reviews-proxy --region=us-east1 --gen2 --format='value(serviceConfig.uri)'
```

This returns something like:
```
https://google-reviews-proxy-abc123-ue.a.run.app
```

## API Endpoints

### GET /reviews

Fetches place details and reviews for a given Place ID.

```bash
curl "https://YOUR_PROXY_URL/reviews?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

**Response:**
```json
{
  "name": "AI Consultant Pros",
  "rating": 4.8,
  "userRatingsTotal": 47,
  "address": "Sunrise, FL 33323",
  "mapsUrl": "https://maps.google.com/?cid=...",
  "reviews": [
    {
      "authorName": "Marcus Johnson",
      "profilePhotoUrl": "https://...",
      "authorUrl": "https://...",
      "rating": 5,
      "relativeTimeDescription": "2 weeks ago",
      "text": "Outstanding AI consulting...",
      "publishTime": "2026-03-20T..."
    }
  ],
  "cached": false,
  "fetchedAt": "2026-04-04T..."
}
```

### GET /find

Looks up a business to find its Place ID.

```bash
curl "https://YOUR_PROXY_URL/find?query=AI+Consultant+Pros+Sunrise+FL"
```

**Response:**
```json
{
  "places": [
    {
      "placeId": "ChIJ...",
      "name": "AI Consultant Pros",
      "address": "Sunrise, FL 33323",
      "rating": 4.8,
      "totalReviews": 47
    }
  ]
}
```

## Using with the Widget

Once deployed, update your widget embed code to use `proxyUrl` instead of `apiKey`:

```html
<div id="google-reviews"></div>
<script src="google-reviews-widget.js"></script>
<script>
  GoogleReviewsWidget.init({
    container: '#google-reviews',
    proxyUrl: 'https://YOUR_PROXY_URL',
    placeId: 'YOUR_PLACE_ID',
    layout: 'carousel',
    showHeader: true,
    autoplay: true,
  });
</script>
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_API_KEY` | Your Google Maps Platform API key | Required |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `*` |
| `CACHE_TTL_SECONDS` | How long to cache API responses in memory | `3600` (1 hour) |

## Security Features

- **API key hidden server-side** — never exposed in client JavaScript
- **CORS origin restriction** — limit which domains can call your proxy
- **Input validation** — Place ID format validation, query length limits
- **Rate limiting via GCF** — set `max-instances` to control concurrency
- **In-memory caching** — reduces API calls and costs (1-hour TTL by default)

## Cost Estimate

- **Google Cloud Functions:** Free tier covers 2M invocations/month
- **Google Places API (New):** ~$0.032 per Place Details request
- With 1-hour caching, a widget embedded on a site with 1,000 daily visitors makes ~24 API calls/day ≈ $0.77/month

## Updating the API Key

To rotate your API key without redeploying code:

```bash
gcloud functions deploy google-reviews-proxy \
  --region=us-east1 \
  --gen2 \
  --update-env-vars GOOGLE_API_KEY=YOUR_NEW_API_KEY
```

## Files

| File | Description |
|------|-------------|
| `index.js` | Cloud Function source code |
| `package.json` | Node.js dependencies |
| `.env.yaml` | Environment variables (edit before deploying) |
| `deploy.sh` | One-command deployment script |
