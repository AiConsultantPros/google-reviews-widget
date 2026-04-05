/**
 * Google Reviews Widget v2.0.0
 * A self-contained, embeddable widget for displaying Google Reviews
 * https://github.com/AiConsultantPros/google-reviews-widget
 *
 * Usage (Secure — via proxy server, recommended):
 *   GoogleReviewsWidget.init({
 *     container: '#google-reviews',
 *     proxyUrl: 'https://YOUR_CLOUD_FUNCTION_URL',
 *     placeId: 'YOUR_PLACE_ID',
 *     layout: 'carousel',
 *   });
 *
 * Usage (Direct — API key exposed in client):
 *   GoogleReviewsWidget.init({
 *     container: '#google-reviews',
 *     apiKey: 'YOUR_API_KEY',
 *     placeId: 'YOUR_PLACE_ID',
 *     layout: 'carousel',
 *   });
 */
(function () {
  'use strict';

  /* ========================================================================
   * DEMO DATA
   * ======================================================================== */
  var DEMO_DATA = {
    name: 'AI Consultant Pros',
    rating: 4.8,
    userRatingsTotal: 47,
    photoUrl: '',
    reviews: [
      {
        authorName: 'Marcus Johnson',
        profilePhotoUrl: '',
        rating: 5,
        relativeTimeDescription: '2 weeks ago',
        text: 'Absolutely outstanding AI consulting services. The team helped us implement automation workflows that saved our company over 40 hours per week. Their knowledge of Google Cloud and AI agents is unmatched. Highly recommend for any business looking to leverage AI.',
        authorUrl: '#',
      },
      {
        authorName: 'Sarah Chen',
        profilePhotoUrl: '',
        rating: 5,
        relativeTimeDescription: '1 month ago',
        text: 'Game-changing experience working with AI Consultant Pros. They built custom AI agents for our customer service team that handle 80% of inquiries automatically. The ROI has been incredible.',
        authorUrl: '#',
      },
      {
        authorName: 'David Rodriguez',
        profilePhotoUrl: '',
        rating: 5,
        relativeTimeDescription: '2 months ago',
        text: 'Professional, knowledgeable, and results-driven. They took our manual processes and transformed them into automated AI workflows. The n8n automations they set up are running perfectly.',
        authorUrl: '#',
      },
      {
        authorName: 'Emily Thompson',
        profilePhotoUrl: '',
        rating: 4,
        relativeTimeDescription: '3 months ago',
        text: 'Great training program on AI implementation for businesses. The bootcamp covered everything from prompt engineering to building voice agents. Would definitely attend again.',
        authorUrl: '#',
      },
      {
        authorName: 'James Williams',
        profilePhotoUrl: '',
        rating: 5,
        relativeTimeDescription: '3 months ago',
        text: 'The best decision we made was hiring AI Consultant Pros to overhaul our business processes. Their expertise in AI agents and workflow automation is top-tier. They delivered ahead of schedule and the results exceeded our expectations.',
        authorUrl: '#',
      },
    ],
  };

  /* ========================================================================
   * CSS (namespaced with grw- prefix)
   * ======================================================================== */
  var CSS = `
/* Google Reviews Widget — all rules namespaced with .grw- */
:root {
  --grw-bg: #F8F8F8;
  --grw-card-bg: #FFFFFF;
  --grw-text: #1a1a1a;
  --grw-text-secondary: #6b7280;
  --grw-star: #FBBF24;
  --grw-accent: #4285F4;
  --grw-border: #E5E7EB;
  --grw-radius-card: 12px;
  --grw-radius-btn: 8px;
  --grw-shadow: 0 1px 3px rgba(0,0,0,0.08);
  --grw-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --grw-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grw-container {
  font-family: var(--grw-font);
  background: var(--grw-bg);
  border-radius: var(--grw-radius-card);
  padding: 24px;
  color: var(--grw-text);
  line-height: 1.5;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 100%;
  position: relative;
}
.grw-container *, .grw-container *::before, .grw-container *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ---- Header ---- */
.grw-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.grw-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}
.grw-header-photo {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--grw-border);
}
.grw-header-info {
  min-width: 0;
}
.grw-business-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--grw-text);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.grw-header-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.grw-rating-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--grw-text);
  line-height: 1;
}
.grw-stars-container {
  display: flex;
  align-items: center;
  gap: 2px;
}
.grw-star-svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.grw-review-count {
  font-size: 13px;
  color: var(--grw-text-secondary);
}
.grw-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.grw-layout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--grw-radius-btn);
  border: 1px solid var(--grw-border);
  background: var(--grw-card-bg);
  cursor: pointer;
  transition: all var(--grw-transition);
  color: var(--grw-text-secondary);
  padding: 0;
}
.grw-layout-btn:hover {
  border-color: var(--grw-accent);
  color: var(--grw-accent);
}
.grw-layout-btn.grw-active {
  border-color: var(--grw-accent);
  background: var(--grw-accent);
  color: #fff;
}
.grw-layout-btn svg {
  width: 16px;
  height: 16px;
}
.grw-google-attr {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--grw-text-secondary);
  margin-top: 4px;
}
.grw-google-attr svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ---- Review Card ---- */
.grw-card {
  background: var(--grw-card-bg);
  border-radius: var(--grw-radius-card);
  border: 1px solid var(--grw-border);
  padding: 20px;
  box-shadow: var(--grw-shadow);
  transition: box-shadow var(--grw-transition);
}
.grw-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.grw-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.grw-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--grw-border);
}
.grw-avatar-fallback {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}
.grw-card-author-info {
  min-width: 0;
  flex: 1;
}
.grw-author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--grw-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.grw-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.grw-card-stars {
  display: flex;
  align-items: center;
  gap: 1px;
}
.grw-card-star {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.grw-card-time {
  font-size: 12px;
  color: var(--grw-text-secondary);
}
.grw-card-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--grw-text);
  margin: 0;
}
.grw-read-more {
  background: none;
  border: none;
  color: var(--grw-accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-top: 4px;
  font-family: var(--grw-font);
}
.grw-read-more:hover {
  text-decoration: underline;
}
.grw-card-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  font-size: 12px;
  color: var(--grw-accent);
  text-decoration: none;
  font-weight: 500;
}
.grw-card-link:hover {
  text-decoration: underline;
}
.grw-card-link svg {
  width: 12px;
  height: 12px;
}

/* ---- Carousel Layout ---- */
.grw-carousel-wrapper {
  position: relative;
  overflow: hidden;
}
.grw-carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.grw-carousel-slide {
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  flex: 0 0 100%;
  padding: 0 40px;
}
.grw-carousel-slide .grw-card {
  height: 100%;
}
.grw-carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--grw-border);
  background: var(--grw-card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all var(--grw-transition);
  z-index: 2;
  color: var(--grw-text);
  padding: 0;
}
.grw-carousel-nav:hover {
  background: var(--grw-accent);
  border-color: var(--grw-accent);
  color: #fff;
}
.grw-carousel-nav svg {
  width: 18px;
  height: 18px;
}
.grw-carousel-prev {
  left: 4px;
}
.grw-carousel-next {
  right: 4px;
}
.grw-carousel-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}
.grw-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--grw-border);
  border: none;
  cursor: pointer;
  transition: all var(--grw-transition);
  padding: 0;
}
.grw-dot.grw-active {
  background: var(--grw-accent);
  transform: scale(1.25);
}

/* ---- Grid Layout ---- */
.grw-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 639px) {
  .grw-grid {
    grid-template-columns: 1fr;
  }
}

/* ---- List Layout ---- */
.grw-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- Footer ---- */
.grw-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--grw-border);
  flex-wrap: wrap;
  gap: 8px;
}
.grw-see-all {
  background: none;
  border: none;
  color: var(--grw-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--grw-font);
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
}
.grw-see-all:hover {
  text-decoration: underline;
}
.grw-see-all svg {
  width: 14px;
  height: 14px;
}
.grw-footer-attr {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--grw-text-secondary);
}
.grw-footer-attr svg {
  width: 46px;
  height: 16px;
  flex-shrink: 0;
}

/* ---- Modal ---- */
.grw-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.grw-modal-backdrop.grw-modal-open {
  opacity: 1;
  visibility: visible;
}
.grw-modal {
  background: var(--grw-card-bg);
  border-radius: var(--grw-radius-card);
  width: 90%;
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 28px;
  position: relative;
  transform: translateY(20px) scale(0.97);
  transition: transform 0.3s ease;
}
.grw-modal-backdrop.grw-modal-open .grw-modal {
  transform: translateY(0) scale(1);
}
.grw-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--grw-border);
  background: var(--grw-card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--grw-text);
  transition: all var(--grw-transition);
  padding: 0;
  z-index: 1;
}
.grw-modal-close:hover {
  background: #f3f4f6;
}
.grw-modal-close svg {
  width: 16px;
  height: 16px;
}
.grw-modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: var(--grw-text);
  padding-right: 40px;
}
.grw-modal-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- Loading Skeleton ---- */
.grw-skeleton {
  animation: grw-pulse 1.5s ease-in-out infinite;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 8px;
}
@keyframes grw-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.grw-skeleton-header {
  height: 60px;
  margin-bottom: 20px;
}
.grw-skeleton-card {
  height: 180px;
  border-radius: var(--grw-radius-card);
}

/* ---- Error State ---- */
.grw-error {
  text-align: center;
  padding: 32px 16px;
  color: var(--grw-text-secondary);
  font-size: 14px;
}
.grw-error-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
.grw-error-title {
  font-weight: 600;
  color: var(--grw-text);
  margin: 0 0 4px 0;
  font-size: 15px;
}

/* ---- Responsive ---- */
@media (max-width: 480px) {
  .grw-container {
    padding: 16px;
  }
  .grw-header {
    flex-direction: column;
  }
  .grw-rating-value {
    font-size: 24px;
  }
  .grw-business-name {
    font-size: 16px;
  }
  .grw-card {
    padding: 16px;
  }
}

/* ---- Accessibility ---- */
.grw-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
`;

  /* ========================================================================
   * SVG ICONS
   * ======================================================================== */
  var ICONS = {
    starFilled: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    starEmpty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    starHalf: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grw-half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#grw-half)" stroke="currentColor" stroke-width="1.5"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="15 18 9 12 15 6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="9 18 15 12 9 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    layoutCarousel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/></svg>',
    layoutGrid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    layoutList: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
    googleLogo: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
    googleWordmark: '<svg viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/><path fill="#34A853" d="M225 3v65h-9.5V3h9.5z"/><path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/><path fill="#4285F4" d="M35.29 41.19V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/></svg>',
  };

  /* ========================================================================
   * AVATAR COLORS
   * ======================================================================== */
  var AVATAR_COLORS = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853',
    '#FF6D01', '#46BDC6', '#7BAAF7', '#F07B72',
  ];

  function getAvatarColor(name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  /* ========================================================================
   * UTILITY FUNCTIONS
   * ======================================================================== */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') {
          node.className = attrs[key];
        } else if (key === 'innerHTML') {
          node.innerHTML = attrs[key];
        } else if (key === 'textContent') {
          node.textContent = attrs[key];
        } else if (key.startsWith('on')) {
          node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      children.forEach(function (child) {
        if (typeof child === 'string') {
          node.appendChild(document.createTextNode(child));
        } else if (child) {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  function renderStars(rating, size) {
    size = size || 16;
    var container = el('div', { className: 'grw-card-stars', 'aria-label': rating + ' out of 5 stars', role: 'img' });
    for (var i = 1; i <= 5; i++) {
      var starEl = el('span', {
        className: 'grw-card-star',
        innerHTML: i <= Math.floor(rating)
          ? ICONS.starFilled
          : (i - 0.5 <= rating ? ICONS.starHalf : ICONS.starEmpty),
      });
      starEl.style.color = i <= Math.ceil(rating) ? 'var(--grw-star)' : '#D1D5DB';
      starEl.style.width = size + 'px';
      starEl.style.height = size + 'px';
      starEl.querySelector('svg').style.width = size + 'px';
      starEl.querySelector('svg').style.height = size + 'px';
      container.appendChild(starEl);
    }
    return container;
  }

  function renderHeaderStars(rating) {
    var container = el('div', { className: 'grw-stars-container', 'aria-label': rating + ' out of 5 stars', role: 'img' });
    for (var i = 1; i <= 5; i++) {
      var starEl = el('span', {
        className: 'grw-star-svg',
        innerHTML: i <= Math.floor(rating)
          ? ICONS.starFilled
          : (i - 0.5 <= rating ? ICONS.starHalf : ICONS.starEmpty),
      });
      starEl.style.color = i <= Math.ceil(rating) ? 'var(--grw-star)' : '#D1D5DB';
      container.appendChild(starEl);
    }
    return container;
  }

  /* ========================================================================
   * REVIEW CARD RENDERER
   * ======================================================================== */
  function renderCard(review, truncateLength) {
    truncateLength = truncateLength || 150;
    var card = el('div', { className: 'grw-card' });

    // Header with avatar + name
    var header = el('div', { className: 'grw-card-header' });
    if (review.profilePhotoUrl) {
      var avatar = el('img', {
        className: 'grw-avatar',
        src: review.profilePhotoUrl,
        alt: review.authorName,
        loading: 'lazy',
      });
      avatar.onerror = function () {
        this.style.display = 'none';
        this.parentNode.insertBefore(makeFallbackAvatar(review.authorName), this);
      };
      header.appendChild(avatar);
    } else {
      header.appendChild(makeFallbackAvatar(review.authorName));
    }

    var authorInfo = el('div', { className: 'grw-card-author-info' });
    authorInfo.appendChild(el('div', { className: 'grw-author-name', textContent: review.authorName }));
    var meta = el('div', { className: 'grw-card-meta' });
    meta.appendChild(renderStars(review.rating));
    meta.appendChild(el('span', { className: 'grw-card-time', textContent: review.relativeTimeDescription }));
    authorInfo.appendChild(meta);
    header.appendChild(authorInfo);
    card.appendChild(header);

    // Review text
    var text = review.text || '';
    var isTruncated = text.length > truncateLength;
    var textEl = el('p', { className: 'grw-card-text' });
    textEl.textContent = isTruncated ? text.substring(0, truncateLength) + '...' : text;
    card.appendChild(textEl);

    if (isTruncated) {
      var expanded = false;
      var readMore = el('button', {
        className: 'grw-read-more',
        textContent: 'Read more',
        'aria-expanded': 'false',
        onClick: function () {
          expanded = !expanded;
          textEl.textContent = expanded ? text : text.substring(0, truncateLength) + '...';
          readMore.textContent = expanded ? 'Show less' : 'Read more';
          readMore.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        },
      });
      card.appendChild(readMore);
    }

    return card;
  }

  function makeFallbackAvatar(name) {
    var initials = name ? name.charAt(0) : '?';
    var avatar = el('div', {
      className: 'grw-avatar-fallback',
      textContent: initials,
      'aria-hidden': 'true',
    });
    avatar.style.backgroundColor = getAvatarColor(name || '');
    return avatar;
  }

  /* ========================================================================
   * MAIN WIDGET CLASS
   * ======================================================================== */
  function Widget(config) {
    this.config = Object.assign(
      {
        container: null,
        proxyUrl: '',
        apiKey: '',
        placeId: '',
        layout: 'carousel',
        theme: 'light',
        maxReviews: 5,
        minRating: 0,
        showHeader: true,
        autoplay: true,
        autoplaySpeed: 5000,
      },
      config
    );

    this.data = null;
    this.currentLayout = this.config.layout;
    this.carouselIndex = 0;
    this.autoplayInterval = null;
    this.containerEl = null;
    this.modalEl = null;
    this.reviews = [];
    this._bodyOverflow = '';

    // Resolve container
    if (typeof this.config.container === 'string') {
      this.containerEl = document.querySelector(this.config.container);
    } else {
      this.containerEl = this.config.container;
    }

    if (!this.containerEl) {
      console.error('GoogleReviewsWidget: Container not found:', this.config.container);
      return;
    }

    this._injectCSS();
    this._init();
  }

  Widget.prototype._injectCSS = function () {
    if (document.getElementById('grw-styles')) return;
    var style = document.createElement('style');
    style.id = 'grw-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  };

  Widget.prototype._init = function () {
    var self = this;

    // Show loading state
    this._renderLoading();

    // Priority: proxyUrl > apiKey > demo data
    if (this.config.proxyUrl && this.config.placeId) {
      // SECURE MODE: Fetch via proxy server (API key stays server-side)
      this._fetchViaProxy();
      return;
    }

    if (this.config.apiKey && this.config.placeId) {
      // DIRECT MODE: Use Google Maps JavaScript API (API key in client)
      this._loadGoogleMapsAPI(function () {
        self._fetchPlaceData();
      });
      return;
    }

    // DEMO MODE: No credentials provided
    this.data = DEMO_DATA;
    this.reviews = this._filterReviews(DEMO_DATA.reviews);
    this._render();
  };

  /* ========================================================================
   * PROXY FETCH (Secure — API key never in browser)
   * ======================================================================== */
  Widget.prototype._fetchViaProxy = function () {
    var self = this;
    var url = this.config.proxyUrl.replace(/\/$/, '') + '/reviews?placeId=' + encodeURIComponent(this.config.placeId);

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Proxy returned status ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        self.data = {
          name: data.name || '',
          rating: data.rating || 0,
          userRatingsTotal: data.userRatingsTotal || 0,
          mapsUrl: data.mapsUrl || '',
          photoUrl: '',
          reviews: (data.reviews || []).map(function (r) {
            return {
              authorName: r.authorName || 'Anonymous',
              profilePhotoUrl: r.profilePhotoUrl || '',
              rating: r.rating || 0,
              relativeTimeDescription: r.relativeTimeDescription || '',
              text: r.text || '',
              authorUrl: r.authorUrl || '#',
            };
          }),
        };

        self.reviews = self._filterReviews(self.data.reviews);
        self._render();
      })
      .catch(function (err) {
        console.error('GoogleReviewsWidget proxy error:', err);
        self._renderError('Could not fetch reviews via proxy. Check your proxy URL and Place ID.');
      });
  };

  Widget.prototype._loadGoogleMapsAPI = function (callback) {
    var self = this;
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      callback();
      return;
    }

    // Check if script is loading
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      // Wait for it
      var check = setInterval(function () {
        if (window.google && window.google.maps) {
          clearInterval(check);
          callback();
        }
      }, 100);
      return;
    }

    var script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=' +
      encodeURIComponent(self.config.apiKey) +
      '&libraries=places&callback=__grwMapsCallback';
    script.async = true;
    script.defer = true;

    window.__grwMapsCallback = function () {
      delete window.__grwMapsCallback;
      callback();
    };

    script.onerror = function () {
      self._renderError('Failed to load Google Maps API. Please check your API key.');
    };

    document.head.appendChild(script);
  };

  Widget.prototype._fetchPlaceData = function () {
    var self = this;

    // Create a hidden map for the PlacesService
    var mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);

    var map = new google.maps.Map(mapDiv, { center: { lat: 0, lng: 0 }, zoom: 1 });
    var service = new google.maps.places.PlacesService(map);

    service.getDetails(
      {
        placeId: self.config.placeId,
        fields: ['name', 'rating', 'user_ratings_total', 'reviews', 'photos'],
      },
      function (place, status) {
        mapDiv.remove();

        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          self._renderError('Could not fetch place details. Status: ' + status);
          return;
        }

        var photoUrl = '';
        if (place.photos && place.photos.length > 0) {
          photoUrl = place.photos[0].getUrl({ maxWidth: 80 });
        }

        self.data = {
          name: place.name || '',
          rating: place.rating || 0,
          userRatingsTotal: place.user_ratings_total || 0,
          photoUrl: photoUrl,
          reviews: (place.reviews || []).map(function (r) {
            return {
              authorName: r.author_name,
              profilePhotoUrl: r.profile_photo_url || '',
              rating: r.rating,
              relativeTimeDescription: r.relative_time_description,
              text: r.text,
              authorUrl: r.author_url || '#',
            };
          }),
        };

        self.reviews = self._filterReviews(self.data.reviews);
        self._render();
      }
    );
  };

  Widget.prototype._filterReviews = function (reviews) {
    var max = Math.min(this.config.maxReviews, 5);
    var min = this.config.minRating;
    return reviews
      .filter(function (r) {
        return r.rating >= min;
      })
      .slice(0, max);
  };

  /* ========================================================================
   * RENDERING
   * ======================================================================== */
  Widget.prototype._renderLoading = function () {
    this.containerEl.innerHTML = '';
    var container = el('div', { className: 'grw-container', 'aria-busy': 'true', 'aria-label': 'Loading reviews' });
    container.appendChild(el('div', { className: 'grw-skeleton grw-skeleton-header' }));
    container.appendChild(el('div', { className: 'grw-skeleton grw-skeleton-card' }));
    this.containerEl.appendChild(container);
  };

  Widget.prototype._renderError = function (message) {
    this.containerEl.innerHTML = '';
    var container = el('div', { className: 'grw-container' });
    var errorEl = el('div', { className: 'grw-error' });
    errorEl.appendChild(el('div', { className: 'grw-error-icon', innerHTML: '&#9888;' }));
    errorEl.appendChild(el('p', { className: 'grw-error-title', textContent: 'Unable to load reviews' }));
    errorEl.appendChild(el('p', { textContent: message }));
    container.appendChild(errorEl);
    this.containerEl.appendChild(container);
  };

  Widget.prototype._render = function () {
    var self = this;
    this.containerEl.innerHTML = '';

    var container = el('div', { className: 'grw-container', role: 'region', 'aria-label': 'Google Reviews for ' + (this.data.name || 'this business') });

    // Header
    if (this.config.showHeader) {
      container.appendChild(this._renderHeader());
    }

    // Reviews
    container.appendChild(this._renderLayout());

    // Footer
    container.appendChild(this._renderFooter());

    this.containerEl.appendChild(container);

    // Start autoplay if carousel
    if (this.currentLayout === 'carousel' && this.config.autoplay) {
      this._startAutoplay();
    }
  };

  Widget.prototype._renderHeader = function () {
    var self = this;
    var header = el('div', { className: 'grw-header' });

    var left = el('div', { className: 'grw-header-left' });

    // Business photo
    if (this.data.photoUrl) {
      left.appendChild(
        el('img', {
          className: 'grw-header-photo',
          src: this.data.photoUrl,
          alt: this.data.name,
        })
      );
    }

    var info = el('div', { className: 'grw-header-info' });
    info.appendChild(el('h3', { className: 'grw-business-name', textContent: this.data.name }));

    var ratingRow = el('div', { className: 'grw-header-rating-row' });
    ratingRow.appendChild(el('span', { className: 'grw-rating-value', textContent: this.data.rating.toFixed(1) }));
    ratingRow.appendChild(renderHeaderStars(this.data.rating));
    ratingRow.appendChild(
      el('span', {
        className: 'grw-review-count',
        textContent: '(' + this.data.userRatingsTotal + ' reviews)',
      })
    );
    info.appendChild(ratingRow);

    // Google attribution in header
    var attr = el('div', { className: 'grw-google-attr' });
    attr.appendChild(el('span', { innerHTML: ICONS.googleLogo, className: 'grw-google-attr' }));
    attr.querySelector('svg').style.width = '14px';
    attr.querySelector('svg').style.height = '14px';
    attr.appendChild(document.createTextNode('Powered by Google'));
    info.appendChild(attr);

    left.appendChild(info);
    header.appendChild(left);

    // Layout switcher
    var right = el('div', { className: 'grw-header-right' });
    var layouts = [
      { key: 'carousel', icon: ICONS.layoutCarousel, label: 'Carousel view' },
      { key: 'grid', icon: ICONS.layoutGrid, label: 'Grid view' },
      { key: 'list', icon: ICONS.layoutList, label: 'List view' },
    ];
    layouts.forEach(function (l) {
      var btn = el('button', {
        className: 'grw-layout-btn' + (self.currentLayout === l.key ? ' grw-active' : ''),
        innerHTML: l.icon,
        'aria-label': l.label,
        title: l.label,
        onClick: function () {
          self._stopAutoplay();
          self.currentLayout = l.key;
          self._render();
        },
      });
      right.appendChild(btn);
    });
    header.appendChild(right);

    return header;
  };

  Widget.prototype._renderLayout = function () {
    switch (this.currentLayout) {
      case 'grid':
        return this._renderGrid();
      case 'list':
        return this._renderList();
      case 'carousel':
      default:
        return this._renderCarousel();
    }
  };

  /* ---- Carousel ---- */
  Widget.prototype._renderCarousel = function () {
    var self = this;
    var wrapper = el('div', { className: 'grw-carousel-wrapper', role: 'group', 'aria-roledescription': 'carousel', 'aria-label': 'Customer reviews' });

    var track = el('div', { className: 'grw-carousel-track' });
    this.reviews.forEach(function (review, i) {
      var slide = el('div', {
        className: 'grw-carousel-slide',
        role: 'tabpanel',
        'aria-roledescription': 'slide',
        'aria-label': 'Review ' + (i + 1) + ' of ' + self.reviews.length,
      });
      slide.appendChild(renderCard(review));
      track.appendChild(slide);
    });
    wrapper.appendChild(track);

    // Nav buttons
    if (this.reviews.length > 1) {
      var prev = el('button', {
        className: 'grw-carousel-nav grw-carousel-prev',
        innerHTML: ICONS.chevronLeft,
        'aria-label': 'Previous review',
        onClick: function () {
          self._pauseAutoplay();
          self._goToSlide(self.carouselIndex - 1);
        },
      });
      var next = el('button', {
        className: 'grw-carousel-nav grw-carousel-next',
        innerHTML: ICONS.chevronRight,
        'aria-label': 'Next review',
        onClick: function () {
          self._pauseAutoplay();
          self._goToSlide(self.carouselIndex + 1);
        },
      });
      wrapper.appendChild(prev);
      wrapper.appendChild(next);

      // Dots
      var dots = el('div', { className: 'grw-carousel-dots', role: 'tablist', 'aria-label': 'Review navigation' });
      this.reviews.forEach(function (_, i) {
        var dot = el('button', {
          className: 'grw-dot' + (i === self.carouselIndex ? ' grw-active' : ''),
          'aria-label': 'Go to review ' + (i + 1),
          role: 'tab',
          'aria-selected': i === self.carouselIndex ? 'true' : 'false',
          onClick: function () {
            self._pauseAutoplay();
            self._goToSlide(i);
          },
        });
        dots.appendChild(dot);
      });
      wrapper.appendChild(dots);
    }

    // Store refs
    this._carouselTrack = track;
    this._carouselDots = wrapper.querySelector('.grw-carousel-dots');

    // Set initial position
    track.style.transform = 'translateX(-' + this.carouselIndex * 100 + '%)';

    // Keyboard support
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        self._pauseAutoplay();
        self._goToSlide(self.carouselIndex - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        self._pauseAutoplay();
        self._goToSlide(self.carouselIndex + 1);
        e.preventDefault();
      }
    });

    return wrapper;
  };

  Widget.prototype._goToSlide = function (index) {
    if (this.reviews.length === 0) return;
    this.carouselIndex = ((index % this.reviews.length) + this.reviews.length) % this.reviews.length;
    if (this._carouselTrack) {
      this._carouselTrack.style.transform = 'translateX(-' + this.carouselIndex * 100 + '%)';
    }
    if (this._carouselDots) {
      var dots = this._carouselDots.querySelectorAll('.grw-dot');
      dots.forEach(function (dot, i) {
        dot.classList.toggle('grw-active', i === this.carouselIndex);
        dot.setAttribute('aria-selected', i === this.carouselIndex ? 'true' : 'false');
      }.bind(this));
    }
  };

  Widget.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (this.reviews.length <= 1) return;
    this.autoplayInterval = setInterval(function () {
      self._goToSlide(self.carouselIndex + 1);
    }, this.config.autoplaySpeed);
  };

  Widget.prototype._stopAutoplay = function () {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    if (this._restartTimeout) {
      clearTimeout(this._restartTimeout);
      this._restartTimeout = null;
    }
  };

  // Pauses autoplay briefly, then resumes after 8 seconds
  Widget.prototype._pauseAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.config.autoplay || this.currentLayout !== 'carousel') return;
    this._restartTimeout = setTimeout(function () {
      self._startAutoplay();
    }, 8000);
  };

  /* ---- Grid ---- */
  Widget.prototype._renderGrid = function () {
    var grid = el('div', { className: 'grw-grid' });
    this.reviews.forEach(function (review) {
      grid.appendChild(renderCard(review));
    });
    return grid;
  };

  /* ---- List ---- */
  Widget.prototype._renderList = function () {
    var list = el('div', { className: 'grw-list' });
    this.reviews.forEach(function (review) {
      list.appendChild(renderCard(review, 300));
    });
    return list;
  };

  /* ---- Footer ---- */
  Widget.prototype._renderFooter = function () {
    var self = this;
    var footer = el('div', { className: 'grw-footer' });

    var mapsUrl = this.data.mapsUrl || 'https://www.google.com/maps/place/?q=place_id:' + (this.config.placeId || '');
    if (mapsUrl && this.config.placeId) {
      var seeAll = el('a', {
        className: 'grw-see-all',
        innerHTML: 'See all reviews ' + ICONS.arrowRight,
        href: mapsUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': 'See all reviews on Google Maps',
      });
      footer.appendChild(seeAll);
    } else {
      footer.appendChild(el('span'));
    }

    // Google attribution
    var attr = el('div', { className: 'grw-footer-attr' });
    var logoSpan = el('span', { innerHTML: ICONS.googleWordmark });
    logoSpan.querySelector('svg').style.width = '46px';
    logoSpan.querySelector('svg').style.height = '16px';
    attr.appendChild(logoSpan);
    attr.appendChild(document.createTextNode(' reviews'));
    footer.appendChild(attr);

    return footer;
  };

  /* ---- Modal ---- */
  Widget.prototype._openModal = function () {
    var self = this;
    this._stopAutoplay();

    // Save body scroll position
    this._bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var backdrop = el('div', {
      className: 'grw-modal-backdrop',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'All reviews for ' + (this.data.name || 'this business'),
    });

    var modal = el('div', { className: 'grw-modal' });

    var closeBtn = el('button', {
      className: 'grw-modal-close',
      innerHTML: ICONS.close,
      'aria-label': 'Close modal',
      onClick: function () {
        self._closeModal();
      },
    });
    modal.appendChild(closeBtn);

    modal.appendChild(el('h2', { className: 'grw-modal-title', textContent: 'Reviews for ' + (this.data.name || 'this business') }));

    var list = el('div', { className: 'grw-modal-list' });
    this.reviews.forEach(function (review) {
      list.appendChild(renderCard(review, 500));
    });
    modal.appendChild(list);

    backdrop.appendChild(modal);

    // Click backdrop to close
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) {
        self._closeModal();
      }
    });

    // Escape key
    this._escHandler = function (e) {
      if (e.key === 'Escape') {
        self._closeModal();
      }
    };
    document.addEventListener('keydown', this._escHandler);

    document.body.appendChild(backdrop);
    this.modalEl = backdrop;

    // Trigger animation
    requestAnimationFrame(function () {
      backdrop.classList.add('grw-modal-open');
    });

    // Focus close button
    closeBtn.focus();
  };

  Widget.prototype._closeModal = function () {
    var self = this;
    if (!this.modalEl) return;

    document.body.style.overflow = this._bodyOverflow || '';

    this.modalEl.classList.remove('grw-modal-open');
    setTimeout(function () {
      if (self.modalEl && self.modalEl.parentNode) {
        self.modalEl.parentNode.removeChild(self.modalEl);
      }
      self.modalEl = null;
    }, 300);

    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
  };

  /* ========================================================================
   * PUBLIC API METHODS
   * ======================================================================== */
  Widget.prototype.setLayout = function (layout) {
    this._stopAutoplay();
    this.currentLayout = layout;
    this.carouselIndex = 0;
    this._render();
  };

  Widget.prototype.destroy = function () {
    this._stopAutoplay();
    this._closeModal();
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
    }
  };

  /* ========================================================================
   * GLOBAL API — window.GoogleReviewsWidget
   * ======================================================================== */
  var instances = [];

  window.GoogleReviewsWidget = {
    init: function (config) {
      var widget = new Widget(config);
      instances.push(widget);
      return widget;
    },
    destroyAll: function () {
      instances.forEach(function (w) {
        w.destroy();
      });
      instances = [];
    },
    version: '2.0.0',
    _DEMO_DATA: DEMO_DATA,
  };
})();
