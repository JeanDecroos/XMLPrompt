// Small helper to download a string as a file with the proper MIME type
export function downloadString(content, filename, mime = 'text/plain;charset=utf-8') {
  try {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    // Some browsers need the element to be in the DOM
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    // Defer revocation to allow the navigation to start (Safari/Firefox quirk)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } catch (_) {
    // Best-effort; if something goes wrong, do nothing silently
  }
}


