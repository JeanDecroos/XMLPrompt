import { OpenAI } from 'openai'
import { config } from '../../config/index.js'
import { buildCompletionPayload } from './buildPayload.js'

const client = new OpenAI({ apiKey: config.ai.openai.apiKey })

export async function sendCompletion(enrichment, layeredPrompt) {
  const payload = buildCompletionPayload(enrichment, layeredPrompt, config.ai.openai.model)
  const res = await client.chat.completions.create(payload)
  return res
}



