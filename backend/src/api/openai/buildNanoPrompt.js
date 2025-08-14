// Build the user message for the nano wrapper
// Produces EXACT XML as required, embedding normalized fields

import { transformToLayeredXML } from './xmlTransformer.js'

export function buildNanoUserMessage({ originalPrompt, targetModel, containmentPercent, outputFormat, modelGuidelines }) {
  // Compose an instruction preface + XML per requirements
  const instruction = [
    'You are a prompt compiler that transforms ORIGINAL_PROMPT into a layered XML envelope for enrichment.',
    'You must normalize, structure, and adapt it for TARGET_MODEL.',
    'Output must be well-formed XML with no commentary or extra text.',
    '',
    `TARGET_MODEL: ${targetModel}`,
    `OUTPUT_FORMAT: ${outputFormat}`,
    `CONTAINMENT_PERCENT: ${containmentPercent}%`,
    modelGuidelines ? `MODEL_GUIDELINES: ${modelGuidelines}` : null,
    '',
    'Rules:',
    '- Extract: role, task, context, requirements, style, output_format.',
    '- Normalize formatting only; DO NOT remove or paraphrase user-provided content; no invented facts.',
    '- Adapt to TARGET_MODEL syntax/tone per MODEL_GUIDELINES.',
    '- Escape XML special characters.',
    '- Only include facts from ORIGINAL_PROMPT; if missing, leave tag empty.',
    '- Output ONLY the XML block, with EXACT tags as specified.'
  ].filter(Boolean).join('\n')

  const xml = transformToLayeredXML(originalPrompt, containmentPercent, outputFormat, { preserveOriginal: true })

  // User content includes the ORIGINAL_PROMPT context for the model + the XML skeleton to fill
  return [
    instruction,
    '',
    'ORIGINAL_PROMPT:',
    JSON.stringify(originalPrompt),
    '',
    'XML_ENVELOPE:',
    xml
  ].join('\n')
}

export default buildNanoUserMessage


