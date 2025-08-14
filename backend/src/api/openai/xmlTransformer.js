// XML Transformer for layered envelope

const ALLOWED_OUTPUT_FORMATS = new Set(['detailed_xml', 'json', 'yaml', 'markdown', 'plain'])

function escapeXml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeRole(value) {
  if (!value) return ''
  const v = String(value).trim()
  return v.length > 80 ? v.slice(0, 80) : v
}

function normalizeTask(value) {
  if (!value) return ''
  let v = String(value).trim()
  // Remove greetings
  v = v.replace(/^(hi|hello|hey)[,!\s]*/i, '')
  // Ensure 1–3 sentences by trimming excessive content
  const sentences = v.split(/(?<=[.!?])\s+/).slice(0, 3)
  v = sentences.join(' ').trim()
  // Imperative tone heuristic: start with a verb (best-effort)
  v = v.replace(/^\b(Please|Kindly|Could you|Would you)\b[:,]?\s*/i, '')
  return v
}

function normalizeContext(value) {
  if (!value) return ''
  let v = String(value).trim()
  // Remove duplicated whitespace and trivial fluff phrases
  v = v.replace(/\s+/g, ' ')
  v = v.replace(/(just|basically|kind of|sort of)\s+/gi, '')
  return v
}

function normalizeRequirements(value) {
  if (!value) return ''
  let v = String(value).trim()
  // Bullet-style constraints: split on lines or semicolons
  const items = v
    .split(/\n+|;\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/^[-*]\s*/, ''))
  return items.join('\n')
}

function normalizeStyle(value) {
  if (!value) return ''
  const parts = String(value)
    .toLowerCase()
    .split(/[,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
  return parts.slice(0, 2).join(', ')
}

function normalizeOutputFormat(value) {
  const v = String(value || '').toLowerCase().trim()
  if (ALLOWED_OUTPUT_FORMATS.has(v)) return v
  // map common aliases
  if (v === 'xml' || v === 'structured' || v === 'detailed' || v === 'detailed-xml') return 'detailed_xml'
  if (v === 'md' || v === 'markdown') return 'markdown'
  if (v === 'yml' || v === 'yaml') return 'yaml'
  if (v === 'json') return 'json'
  if (v === 'text' || v === 'plain') return 'plain'
  return 'detailed_xml'
}

export function transformToLayeredXML(originalPrompt, containmentPercent, outputFormat, options = {}) {
  const preserveOriginal = options.preserveOriginal !== false // default true
  // Extract fields from originalPrompt using simple heuristics; allow object input too
  let role = ''
  let task = ''
  let context = ''
  let requirements = ''
  let style = ''
  let outFmt = outputFormat

  if (originalPrompt && typeof originalPrompt === 'object') {
    role = originalPrompt.role || ''
    task = originalPrompt.task || ''
    context = originalPrompt.context || ''
    requirements = originalPrompt.requirements || ''
    style = originalPrompt.style || ''
    outFmt = originalPrompt.output_format || outputFormat
  } else if (typeof originalPrompt === 'string') {
    const text = originalPrompt
    const pick = (label) => {
      const re = new RegExp(`${label}:\\s*([\n\r]+|)`, 'i')
      return null
    }
    // Fallback: leave empty; callers should prefer object form
  }

  const normalized = preserveOriginal
    ? {
        role: escapeXml(String(role || '').trim()),
        task: escapeXml(String(task || '').trim()),
        context: escapeXml(String(context || '').trim()),
        requirements: escapeXml(String(requirements || '').trim()),
        style: escapeXml(String(style || '').trim()),
        output_format: normalizeOutputFormat(outFmt)
      }
    : {
        role: escapeXml(normalizeRole(role)),
        task: escapeXml(normalizeTask(task)),
        context: escapeXml(normalizeContext(context)),
        requirements: escapeXml(normalizeRequirements(requirements)),
        style: escapeXml(normalizeStyle(style)),
        output_format: normalizeOutputFormat(outFmt)
      }

  const pct = Math.max(0, Math.min(100, Math.round(Number(containmentPercent) || 0)))

  // Build EXACT XML block
  return [
    '<outer_layer>',
    `  <containment_level>${pct}% hallucination containment</containment_level>`,
    `  <response_format>${normalized.output_format}</response_format>`,
    '  <inner_prompt>',
    `    <task>${normalized.task}</task>`,
    `    <role>${normalized.role}</role>`,
    `    <context>${normalized.context}</context>`,
    `    <requirements>${normalized.requirements}</requirements>`,
    `    <style>${normalized.style}</style>`,
    `    <output_format>${normalized.output_format}</output_format>`,
    '  </inner_prompt>',
    '</outer_layer>'
  ].join('\n')
}

export default transformToLayeredXML


