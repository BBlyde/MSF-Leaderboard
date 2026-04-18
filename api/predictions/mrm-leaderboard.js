const DEFAULT_BACKEND_BASE_URL = 'https://back.mcsr-game.com'

function backendLeaderboardUrl() {
  const base = process.env.BACKEND_API_BASE_URL || DEFAULT_BACKEND_BASE_URL
  const normalizedBase = base.replace(/\/$/, '')
  const apiBase = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`
  return `${apiBase}/prediction/mrm/leaderboard`
}

/**
 * @param {unknown} row
 */
function isValidRow(row) {
  if (!row || typeof row !== 'object') return false
  const { discordId, points } = row
  if (typeof discordId !== 'string' || discordId.trim() === '') return false
  if (typeof points !== 'number' || !Number.isFinite(points)) return false
  return true
}

/**
 * @param {unknown} payload
 * @returns {unknown[]}
 */
function normalizeLeaderboard(payload) {
  if (Array.isArray(payload)) return payload.filter(isValidRow)
  if (!payload || typeof payload !== 'object') return []
  const arr = payload.leaderboard
  if (!Array.isArray(arr)) return []
  return arr.filter(isValidRow)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end('Method Not Allowed')
    return
  }

  const upstreamUrl = backendLeaderboardUrl()
  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!upstream.ok) {
      const body = await upstream.text().catch(() => '')
      console.error('[predictions/mrm-leaderboard] upstream failed', upstream.status, body)
      res.status(502).json({ error: 'upstream_failed' })
      return
    }
    const payload = await upstream.json().catch(() => null)
    const leaderboard = normalizeLeaderboard(payload)
    res.status(200).json({ leaderboard })
    return
  } catch (e) {
    console.error('[predictions/mrm-leaderboard] upstream error', e)
    res.status(502).json({ error: 'upstream_unreachable' })
    return
  }
}
