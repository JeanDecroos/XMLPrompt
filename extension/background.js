// MV3 service worker (module)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Promptr extension installed')
})

chrome.action.onClicked.addListener(async (tab) => {
  // Opens popup by default via manifest; keep hook for future actions
})

// Example message relay (future: connect popup/content <-> backend)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ ok: true, ts: Date.now() })
    return true
  }
})


