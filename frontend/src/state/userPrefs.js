// Minimal localStorage-backed user preferences
const KEYS = {
  exportFormat: 'promptr:exportFormat',
  codeLanguage: 'promptr:codeLanguage',
}

export const userPrefs = {
  getExportFormat() {
    try { return localStorage.getItem(KEYS.exportFormat) || 'txt' } catch { return 'txt' }
  },
  setExportFormat(format) {
    try { localStorage.setItem(KEYS.exportFormat, String(format)) } catch {}
  },
  getCodeLanguage() {
    try { return localStorage.getItem(KEYS.codeLanguage) || '' } catch { return '' }
  },
  setCodeLanguage(lang) {
    try { localStorage.setItem(KEYS.codeLanguage, String(lang)) } catch {}
  },
}


