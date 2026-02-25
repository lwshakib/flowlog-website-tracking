/**
 * @file public/analytics.js
 * @description The client-side tracking script for FlowLog.
 * This script is injected into tracked websites to capture visitor data,
 * handle SPA navigation, and manage session lifecycle.
 */

(function() {
  // Extract configuration from the script tag attributes
  const websiteId = document.currentScript.getAttribute('data-website-id');
  const registeredDomain = document.currentScript.getAttribute('data-domain');
  
  // Exit if no website ID is provided
  if (!websiteId) return;

  /** @type {string|null} Stores the unique ID of the current visit session */
  let currentVisitId = null;

  // Determine the API endpoint URL based on the script's source
  const serverUrl = new URL(document.currentScript.src).origin;
  const trackUrl = serverUrl + '/api/track';

  /**
   * Sending tracking data to the server
   * @param {'start' | 'end'} type - The type of tracking event.
   */
  async function track(type) {
    const params = new URLSearchParams(window.location.search);
    
    // Construct the payload with visitor and environmental data
    const data = {
      type,
      websiteId,
      visitId: currentVisitId,
      referrer: document.referrer,
      path: window.location.pathname,
      hostname: window.location.hostname,
      registeredDomain: registeredDomain,
      // Metadata from URL parameters
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign')
    };

    // Use sendBeacon for 'end' events to ensure data delivery even if page is closing
    if (type === 'end' && navigator.sendBeacon) {
      navigator.sendBeacon(trackUrl, JSON.stringify(data));
      return;
    }

    try {
      // Use fetch with keepalive for 'start' and general tracking
      const res = await fetch(trackUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true // Important for background requests
      });
      const result = await res.json();
      
      // Store the session ID returned by the server on initial track
      if (type === 'start' && result.id) {
        currentVisitId = result.id;
      }
    } catch (e) {
      console.error('FlowLog tracking error:', e);
    }
  }

  /**
   * Helper to handle SPA navigation logic
   * Transitions from the current visit session to a new one
   */
  async function handleNavigation() {
    if (currentVisitId) {
      await track('end');
    }
    await track('start');
  }

  // Initial track on script load
  track('start');

  // SPA navigation tracking logic
  let lastPath = window.location.pathname;
  
  /**
   * MutationObserver to detect path changes in Single Page Applications (SPAs)
   * This handles navigation changes where the page doesn't fully reload
   */
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      handleNavigation();
    }
  });

  // Observe the body for changes (common in SPAs like Next.js/React)
  observer.observe(document.querySelector('body'), { childList: true, subtree: true });

  /**
   * Listen for browser navigation (back/forward buttons)
   */
  window.addEventListener('popstate', () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      handleNavigation();
    }
  });

  /**
   * Track session end when the user closes the tab or navigates away
   */
  window.addEventListener('beforeunload', () => track('end'));

})();

