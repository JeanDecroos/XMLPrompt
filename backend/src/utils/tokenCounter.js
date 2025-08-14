// Simple token counting utility compatible with OpenAI-like counting heuristics.
// This is an approximation. For strict accounting, integrate tiktoken later.

/**
 * Count approximate tokens in a text by splitting on whitespace and punctuation heuristics.
 * @param {string} text
 */
export function countApproxTokens(text) {
  if (!text || typeof text !== 'string') return 0
  // Basic heuristic: words + punctuation density factor
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const punct = (text.match(/[\.,!?;:()\[\]{}<>"'`~@#$%^&*_+=\\/|-]/g) || []).length
  return Math.max(0, Math.floor(words + punct * 0.2))
}

/**
 * Count tokens for an OpenAI chat payload (messages array) approximately.
 * @param {{role:string, content:string}[]} messages
 */
export function countChatPayloadTokens(messages) {
  if (!Array.isArray(messages)) return 0
  let total = 0
  for (const msg of messages) {
    const base = countApproxTokens(String(msg?.content ?? ''))
    // Add small per-message overhead heuristic
    total += base + 3
  }
  // Base overhead
  return total + 3
}


