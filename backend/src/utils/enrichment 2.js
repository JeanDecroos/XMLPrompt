// Utility functions for enrichment-driven sampling and keying

/**
 * Clamp a number between min and max
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

/**
 * Round a 0..100 number to the nearest even integer, clamped to [0,100]
 * @param {number} n
 */
export function nearestTwo(n) {
  return clamp(Math.round(n / 2) * 2, 0, 100)
}

/**
 * Convert a number 0..100 to a percent key like "00%", "02%", ..., "100%"
 * @param {number} n
 * @returns {string}
 */
export function toKey(n) {
  return `${String(n).padStart(2, '0')}%`
}

/**
 * Derive sampling parameters based on enrichment and plan cap, following fallback formulas
 * @param {number} enrichment 0..100
 * @param {number} planCap maximum tokens allowed (e.g., 800 or 2000)
 */
export function deriveSampling(enrichment, planCap) {
  const e = clamp(enrichment, 0, 100) / 100
  const round2 = (x) => Math.round(x * 100) / 100

  // Compute values per spec
  let temperature = round2(1.1 * e)
  let top_p = round2(0.1 + 0.9 * e)
  let presence_penalty = round2(-0.6 + 1.6 * e)
  let frequency_penalty = round2(0.4 * (1 - e))
  let max_tokens = Math.floor(clamp(64 + (planCap - 64) * e, 64, planCap))

  // Clamp to OpenAI ranges where applicable
  temperature = clamp(temperature, 0, 2)
  top_p = clamp(top_p, 0, 1)
  presence_penalty = clamp(presence_penalty, -2, 2)
  frequency_penalty = clamp(frequency_penalty, -2, 2)

  return { temperature, top_p, presence_penalty, frequency_penalty, max_tokens }
}


