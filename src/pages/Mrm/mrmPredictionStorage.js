/**
 * @param {number} baselineLen
 * @param {number[] | undefined} saved
 * @returns {number[]}
 */
export function reconcileOrder(baselineLen, saved) {
  const defaultOrder = Array.from({ length: baselineLen }, (_, i) => i)
  if (!Array.isArray(saved) || saved.length === 0) return defaultOrder

  if (saved.length === baselineLen) {
    const set = new Set(saved)
    if (set.size === baselineLen) {
      let ok = true
      for (let i = 0; i < baselineLen; i++) {
        if (!set.has(i)) {
          ok = false
          break
        }
      }
      if (ok) return [...saved]
    }
  }

  const seen = new Set()
  const result = []
  for (const i of saved) {
    if (Number.isInteger(i) && i >= 0 && i < baselineLen && !seen.has(i)) {
      result.push(i)
      seen.add(i)
    }
  }
  for (let i = 0; i < baselineLen; i++) {
    if (!seen.has(i)) result.push(i)
  }
  return result.length === baselineLen ? result : defaultOrder
}
