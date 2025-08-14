import { deriveSampling, nearestTwo, clamp, toKey } from '../src/utils/enrichment.js'

describe('enrichment utilities', () => {
  test('nearestTwo rounds to nearest even and clamps', () => {
    expect(nearestTwo(0)).toBe(0)
    expect(nearestTwo(1)).toBe(2)
    expect(nearestTwo(2)).toBe(2)
    expect(nearestTwo(9)).toBe(10)
    expect(nearestTwo(10)).toBe(10)
    expect(nearestTwo(11)).toBe(12)
    expect(nearestTwo(98)).toBe(98)
    expect(nearestTwo(99)).toBe(100)
    expect(nearestTwo(100)).toBe(100)
    expect(toKey(nearestTwo(11))).toBe('12%')
  })

  test('deriveSampling respects plan caps', () => {
    const capFree = 800
    const capPro = 2000
    const low = deriveSampling(0, capFree)
    expect(low.max_tokens).toBeGreaterThanOrEqual(64)
    expect(low.max_tokens).toBeLessThanOrEqual(capFree)

    const mid = deriveSampling(50, capFree)
    expect(mid.max_tokens).toBeLessThanOrEqual(capFree)

    const high = deriveSampling(100, capPro)
    expect(high.max_tokens).toBeLessThanOrEqual(capPro)
    expect(high.max_tokens).toBe(capPro)
  })
})


