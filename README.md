# Google Reviews Widget v2.0

A self-contained, embeddable JavaScript widget that displays live Google reviews on any website. Drop in one script tag and go.

## Features

- **3 layout modes** — Carousel (with autoplay), Grid, and List
- **"See all reviews" modal** — Full overlay with all reviews
- **Secure proxy mode** — API key stays server-side via Cloud Function proxy
- **Direct mode** — Also supports client-side Google Maps API (not recommended)
- **Demo mode** — Works with sample data when no credentials are provided
- **Fully responsive** — 320px to any width
- **Zero dependencies** — Pure vanilla JS, no frameworks
- **Namespaced CSS** — All classes prefixed with `grw-` to avoid conflicts
- **Accessible** — Keyboard navigation, ARIA labels, focus management
- **Google attribution** — Compliant with Google's Terms of Service
- **Self-healing (v2.1)** — Puts itself back if a page builder wipes or re-renders it, waits for late containers, retries slow requests, and shows the last good reviews if the proxy is down

## Quick Start (Self-Healing — Recommended)

One `<div>` and one `<script>`. No inline `init()` call, so there's no race if your site builder loads scripts out of order.

```html
<div data-grw-place-id="YOUR_PLACE_ID" data-grw-layout="carousel"></div>
<script src="https://YOUR_PROXY_URL/widget.js" async></script>
```

The proxy URL defaults to wherever `widget.js` was loaded from. Optional attributes: `data-grw-proxy-url`, `data-grw-show-header="false"`, `data-grw-autoplay="false"`, `data-grw-autoplay-speed`, `data-grw-max-reviews`, `data-grw-min-rating`, `data-grw-theme`.

**Why the widget used to disappear (fixed in v2.1):**
1. Site builders re-render page sections after load, wiping the widget. It now checks every second and redraws itself.
2. If `widget.js` loaded after the inline `init()` ran, you got `GoogleReviewsWidget is not defined`. The data-attribute embed has no inline code.
3. A container added late (lazy sections, page navigation) gave "Container not found". The widget now waits for it.
4. A cold start or Google hiccup showed an error. It now retries 3 times, keeps the last good copy in the browser for 3 days, and the proxy serves its last good copy if Google fails.

## Quick Start (Script — via proxy)

Deploy the proxy server first (see `google-reviews-proxy/`), then:

```html
<div id="google-reviews"></div>
<script src="google-reviews-widget.js"></script>
<script>
  GoogleReviewsWidget.init({
    container: '#google-reviews',
    proxyUrl: 'https://YOUR_CLOUD_FUNCTION_URL',
    placeId: 'YOUR_PLACE_ID',
    layout: 'carousel',
    showHeader: true,
    autoplay: true,
  });
</script>
```

## Quick Start (Direct — API Key in Client)

```html
<div id="google-reviews"></div>
<script src="google-reviews-widget.js"></script>
<script>
  GoogleReviewsWidget.init({
    container: '#google-reviews',
    apiKey: 'YOUR_GOOGLE_API_KEY',
    placeId: 'YOUR_PLACE_ID',
    layout: 'carousel',
  });
</script>
```

**Warning:** This exposes your API key in client-side code. At minimum, restrict the key to your domain in Google Cloud Console.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string/element | — | CSS selector or DOM element (required) |
| `proxyUrl` | string | `''` | URL of your Cloud Function proxy (recommended) |
| `apiKey` | string | `''` | Google Maps API key (client-side, less secure) |
| `placeId` | string | `''` | Google Place ID for your business |
| `layout` | string | `'carousel'` | `'carousel'`, `'grid'`, or `'list'` |
| `showHeader` | boolean | `true` | Show business name, rating, and review count |
| `autoplay` | boolean | `true` | Auto-advance carousel slides |
| `autoplaySpeed` | number | `5000` | Milliseconds between carousel slides |
| `maxReviews` | number | `5` | Max reviews to display (1-5) |
| `minRating` | number | `0` | Filter out reviews below this star rating |

**Priority:** If both `proxyUrl` and `apiKey` are provided, the proxy is used. If neither is provided, demo data is shown.

## API Methods

```js
// Initialize
var widget = GoogleReviewsWidget.init({ ... });

// Destroy a single instance
widget.destroy();

// Destroy all instances
GoogleReviewsWidget.destroyAll();

// Check version
console.log(GoogleReviewsWidget.version); // "2.0.0"
```

## Finding Your Place ID

**Option A:** Use the proxy's `/find` endpoint:
```bash
curl "https://YOUR_PROXY_URL/find?query=AI+Consultant+Pros+Sunrise+FL"
```

**Option B:** Use Google's [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)

## Browser Support

Chrome, Firefox, Safari, Edge — all modern versions. IE11 is not supported.

## Files

| File | Size | Description |
|------|------|-------------|
| `google-reviews-widget.js` | ~45KB | Complete widget (CSS + HTML + JS bundled) |
| `index.html` | ~25KB | Demo page with live preview and config panel |
