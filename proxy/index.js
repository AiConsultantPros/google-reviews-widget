/**
 * Google Reviews Proxy — Google Cloud Function
 * 
 * Securely fetches Google Place reviews using a server-side API key.
 * The API key is stored as an environment variable and never exposed to the client.
 * 
 * Endpoints:
 *   GET /reviews?placeId=ChIJ...        → Returns place details + reviews
 *   GET /find?query=AI+Consultant+Pros  → Finds the Place ID for a business name
 * 
 * Environment Variables:
 *   GOOGLE_API_KEY       — Your Google Maps Platform API key (required)
 *   ALLOWED_ORIGINS      — Comma-separated allowed origins for CORS (default: "*")
 *   CACHE_TTL_SECONDS    — How long to cache results in memory (default: 3600 = 1 hour)
 *   ALLOWED_PLACE_IDS    — Optional comma-separated Place IDs this proxy will serve
 *
 * Reliability: if Google errors or times out, /reviews returns the last good
 * copy (X-Cache: STALE) instead of an error. Deploy with min-instances=1 so
 * that copy survives between visits.
 */

const functions = require('@google-cloud/functions-framework');
const fs = require('fs');
const path = require('path');

// Load widget JS once at cold start
let widgetJS = null;
function getWidgetJS() {
  if (!widgetJS) {
    widgetJS = fs.readFileSync(path.join(__dirname, 'widget.js'), 'utf8');
  }
  return widgetJS;
}

// ─── /widget.js Endpoint ───────────────────────────────────────────────────────
function handleWidgetJS(req, res) {
  res.set('Content-Type', 'application/javascript; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour, so fixes reach visitors the same day
  res.set('Access-Control-Allow-Origin', '*');
  return res.send(getWidgetJS());
}

// ─── In-Memory Cache ───────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10) * 1000;

const GOOGLE_TIMEOUT_MS = 8000;

// allowStale: return the entry even if it's past its TTL. Expired entries are
// kept as a backup so a Google outage or quota error doesn't blank the widget.
function getCached(key, allowStale = false) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (!allowStale && Date.now() - entry.timestamp > CACHE_TTL) {
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  // Limit cache size to prevent memory issues
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── CORS Helper ───────────────────────────────────────────────────────────────
function setCorsHeaders(req, res) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
  
  if (allowedOrigins === '*') {
    res.set('Access-Control-Allow-Origin', '*');
  } else {
    // Allowing https://example.com also allows https://www.example.com (and
    // the reverse). A missing www variant blocks the widget for every visitor
    // who typed the other version of the address.
    const origins = new Set();
    allowedOrigins.split(',').map(o => o.trim()).filter(Boolean).forEach(o => {
      origins.add(o);
      origins.add(o.includes('://www.') ? o.replace('://www.', '://') : o.replace('://', '://www.'));
    });
    const requestOrigin = req.get('Origin') || '';
    if (origins.has(requestOrigin)) {
      res.set('Access-Control-Allow-Origin', requestOrigin);
    }
    res.set('Vary', 'Origin');
  }
  
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');
}

// ─── Main HTTP Function ────────────────────────────────────────────────────────
functions.http('googleReviewsProxy', async (req, res) => {
  // Handle CORS preflight
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const path = req.path || '/';

  // Serve the widget script even if the API key is misconfigured, so the
  // widget can still show its saved copy or fallback link.
  if (path === '/widget.js' || path.startsWith('/widget.js')) {
    return handleWidgetJS(req, res);
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  try {
    if (path === '/find' || path.startsWith('/find')) {
      return await handleFind(req, res, apiKey);
    } else {
      return await handleReviews(req, res, apiKey);
    }
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── /reviews Endpoint ─────────────────────────────────────────────────────────
async function handleReviews(req, res, apiKey) {
  const placeId = req.query.placeId;
  if (!placeId) {
    return res.status(400).json({ error: 'Missing required parameter: placeId' });
  }

  // Validate placeId format (basic check)
  if (!/^[A-Za-z0-9_-]+$/.test(placeId) || placeId.length > 300) {
    return res.status(400).json({ error: 'Invalid placeId format' });
  }

  // Optional lock: only serve the Place IDs you list, so nobody can run
  // other businesses' lookups on your Google bill.
  const allowedPlaceIds = (process.env.ALLOWED_PLACE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowedPlaceIds.length && !allowedPlaceIds.includes(placeId)) {
    return res.status(403).json({ error: 'Place ID not allowed' });
  }

  // Browsers may reuse a response for 10 minutes.
  res.set('Cache-Control', 'public, max-age=600');

  // Check cache
  const cacheKey = `reviews:${placeId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  // If Google fails, answer with the last good copy instead of an error.
  const serveStaleOr = (status, body) => {
    const stale = getCached(cacheKey, true);
    if (stale) {
      res.set('X-Cache', 'STALE');
      return res.json(stale);
    }
    res.set('Cache-Control', 'no-store');
    return res.status(status).json(body);
  };

  // Fetch from Google Places API (New). Only the fields the widget uses.
  const fields = [
    'displayName',
    'rating',
    'userRatingCount',
    'reviews',
    'formattedAddress',
    'googleMapsUri',
  ].join(',');

  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=${apiKey}`;

  let response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS),
    });
  } catch (err) {
    console.error('Google API unreachable or timed out:', err.message);
    return serveStaleOr(504, { error: 'Google API timed out' });
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Google API error (${response.status}):`, errorBody);
    return serveStaleOr(502, {
      error: 'Google API request failed',
      status: response.status
    });
  }

  const data = await response.json();

  // Transform to a clean response format
  const result = {
    name: data.displayName?.text || '',
    rating: data.rating || 0,
    userRatingsTotal: data.userRatingCount || 0,
    address: data.formattedAddress || '',
    mapsUrl: data.googleMapsUri || '',
    reviews: (data.reviews || []).map(review => ({
      authorName: review.authorAttribution?.displayName || 'Anonymous',
      profilePhotoUrl: review.authorAttribution?.photoUri || '',
      authorUrl: review.authorAttribution?.uri || '',
      rating: review.rating || 0,
      relativeTimeDescription: review.relativePublishTimeDescription || '',
      text: review.text?.text || '',
      publishTime: review.publishTime || '',
    })),
    cached: false,
    fetchedAt: new Date().toISOString(),
  };

  // Google sometimes answers without the reviews list. Keep the reviews we
  // already had rather than showing an empty widget.
  const previous = getCached(cacheKey, true);
  if (!result.reviews.length && previous && previous.reviews && previous.reviews.length) {
    result.reviews = previous.reviews;
  }

  // Cache the result
  setCache(cacheKey, { ...result, cached: true });

  res.set('X-Cache', 'MISS');
  return res.json(result);
}

// ─── /find Endpoint ────────────────────────────────────────────────────────────
async function handleFind(req, res, apiKey) {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing required parameter: query' });
  }

  if (query.length > 200) {
    return res.status(400).json({ error: 'Query too long (max 200 characters)' });
  }

  // Check cache
  const cacheKey = `find:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  // Use Places API Text Search (New) to find the place
  const url = `https://places.googleapis.com/v1/places:searchText`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount',
    },
    body: JSON.stringify({ textQuery: query }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Google API error (${response.status}):`, errorBody);
    return res.status(response.status).json({ 
      error: 'Google API request failed',
      status: response.status 
    });
  }

  const data = await response.json();
  
  const result = {
    places: (data.places || []).slice(0, 5).map(place => ({
      placeId: place.id,
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      rating: place.rating || 0,
      totalReviews: place.userRatingCount || 0,
    })),
  };

  // Cache the result
  setCache(cacheKey, result);
  
  res.set('X-Cache', 'MISS');
  return res.json(result);
}
