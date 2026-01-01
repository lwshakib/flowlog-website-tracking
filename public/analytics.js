(function() {
  const websiteId = document.currentScript.getAttribute('data-website-id');
  const registeredDomain = document.currentScript.getAttribute('data-domain');
  if (!websiteId) return;

  let currentVisitId = null;
  const serverUrl = new URL(document.currentScript.src).origin;
  const trackUrl = serverUrl + '/api/track';

  async function track(type) {
    const data = {
      type,
      websiteId,
      visitId: currentVisitId,
      referrer: document.referrer,
      path: window.location.pathname,
      hostname: window.location.hostname,
      registeredDomain: registeredDomain
    };

    if (type === 'end' && navigator.sendBeacon) {
      navigator.sendBeacon(trackUrl, JSON.stringify(data));
      return;
    }

    try {
      const res = await fetch(trackUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      });
      const result = await res.json();
      if (type === 'start' && result.id) {
        currentVisitId = result.id;
      }
    } catch (e) {
      console.error('FlowLog tracking error:', e);
    }
  }

  // Lifecycle helper
  async function handleNavigation() {
    if (currentVisitId) {
      await track('end');
    }
    await track('start');
  }

  // Initial track
  track('start');

  // SPA navigation tracking
  let lastPath = window.location.pathname;
  
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      handleNavigation();
    }
  });

  observer.observe(document.querySelector('body'), { childList: true, subtree: true });

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      handleNavigation();
    }
  });

  // Track exit
  window.addEventListener('beforeunload', () => track('end'));

})();
