import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { clamp, nearestTwo, toKey, deriveSampling } from '../../utils/enrichment.js'
import { countChatPayloadTokens } from '../../utils/tokenCounter.js'
import { buildNanoUserMessage } from './buildNanoPrompt.js'
import { getPlanCap } from '../../config/plan.js'
import { config } from '../../config/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load enrichment templates JSON once on module load if available
let templates = null
try {
  const rootDir = path.resolve(__dirname, '../../../..')
  const jsonPath = path.join(rootDir, 'enrichment_templates.json')
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8')
    templates = JSON.parse(raw)
  }
} catch (err) {
  // Keep templates as null to trigger fallback
  templates = null
}

export function buildCompletionPayload(params) {
  const {
    enrichment, // 0..100
    originalPrompt, // object with fields {role, task, context, requirements, style, output_format}
    outputFormat = 'detailed_xml',
    modelFromConfig,
    planCapOverride,
    targetModel,
    modelGuidelines
  } = params

  const planCap = typeof planCapOverride === 'number' ? planCapOverride : getPlanCap(config?.planTier)
  const bucketKey = toKey(nearestTwo(enrichment))
  const tpl = (templates && templates[bucketKey]) ? structuredClone(templates[bucketKey]) : null

  // Build instructional user message for nano wrapper
  const containmentPercent = nearestTwo(enrichment)
  const userMessage = buildNanoUserMessage({
    originalPrompt,
    targetModel: targetModel || (modelFromConfig || tpl?.model || 'gpt-4o-nano'),
    containmentPercent,
    outputFormat,
    modelGuidelines: modelGuidelines || null
  })

  // System from template or fallback
  const systemContent = tpl?.messages?.find(m => m.role === 'system')?.content
    || 'CRITICAL: (derived) containment and enrichment rules in effect.'

  // Normalize params: only one of temperature/top_p
  const sampling = tpl ? {
    temperature: typeof tpl.temperature === 'number' ? tpl.temperature : undefined,
    top_p: typeof tpl.top_p === 'number' ? tpl.top_p : undefined,
    presence_penalty: typeof tpl.presence_penalty === 'number' ? tpl.presence_penalty : 0,
    frequency_penalty: typeof tpl.frequency_penalty === 'number' ? tpl.frequency_penalty : 0
  } : deriveSampling(enrichment, planCap)

  if (typeof sampling.temperature === 'number' && typeof sampling.top_p === 'number') {
    // Prefer temperature; drop top_p
    delete sampling.top_p
  }

  // Assemble base payload
  const finalModel = modelFromConfig || tpl?.model || 'gpt-4o-nano'
  const payload = {
    model: finalModel,
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userMessage }
    ],
    presence_penalty: clamp(Number(sampling.presence_penalty || 0), -2, 2),
    frequency_penalty: clamp(Number(sampling.frequency_penalty || 0), -2, 2)
  }
  if (typeof sampling.temperature === 'number') payload.temperature = clamp(sampling.temperature, 0, 2)
  else if (typeof sampling.top_p === 'number') payload.top_p = clamp(sampling.top_p, 0, 1)

  // Token budgeting: ensure input + max_tokens <= 5000 (min 256)
  const inputEstimate = countChatPayloadTokens(payload.messages)
  const headroom = Math.max(256, 5000 - inputEstimate)
  payload.max_tokens = clamp(headroom, 256, planCap)

  return { payload, templateKey: tpl ? bucketKey : null }
}


