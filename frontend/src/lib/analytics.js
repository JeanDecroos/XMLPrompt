// Minimal analytics helpers. In production, wire these to your analytics provider.
export const trackPageView = (payload = {}) => {
  try {
    const event = { event: 'page_view', timestamp: Date.now(), ...payload }
    if (window && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(event)
    }
    if (import.meta?.env?.DEV) console.debug('[analytics] page_view', event)
  } catch {}
}

export const trackEvent = (name, payload = {}) => {
  try {
    const event = { event: name, timestamp: Date.now(), ...payload }
    if (window && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(event)
    }
    if (import.meta?.env?.DEV) console.debug('[analytics] event', event)
  } catch {}
}


