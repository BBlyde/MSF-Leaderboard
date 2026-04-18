import { getJsonBody } from '../lib/getJsonBody.js'

const DEFAULT_BACKEND_BASE_URL = 'https://back.mcsr-game.com'

function backendPredictionUrl() {
  const base = process.env.BACKEND_API_BASE_URL || DEFAULT_BACKEND_BASE_URL
  const normalizedBase = base.replace(/\/$/, '')
  const apiBase = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`
  return `${apiBase}/prediction/mrm`
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {boolean} withJson
 */
function upstreamHeaders(req, withJson = false) {
  const headers = { Accept: 'application/json' }
  const cookie = req.headers.cookie
  if (cookie) headers.Cookie = cookie
  if (withJson) headers['Content-Type'] = 'application/json; charset=utf-8'
  return headers
}

async function relayUpstreamResponse(upstream, res) {
  const contentType = upstream.headers.get('content-type') || ''
  const status = upstream.status
  if (contentType.includes('application/json')) {
    const payload = await upstream.json().catch(() => null)
    res.status(status).json(payload ?? {})
    return
  }
  const body = await upstream.text().catch(() => '')
  if (contentType) res.setHeader('Content-Type', contentType)
  res.status(status).send(body)
}

export default async function handler(req, res) {
  const upstreamUrl = backendPredictionUrl()

  if (req.method === 'GET') {
    try {
      const upstream = await fetch(upstreamUrl, {
        method: 'GET',
        headers: upstreamHeaders(req),
      })
      await relayUpstreamResponse(upstream, res)
    } catch (e) {
      console.error('[predictions/mrm] upstream GET error', e)
      res.status(502).json({ error: 'upstream_unreachable' })
    }
    return
  }

  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed')
    return
  }

  let body
  try {
    body = await getJsonBody(req)
  } catch {
    res.status(400).json({ error: 'invalid_json' })
    return
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: upstreamHeaders(req, true),
      body: JSON.stringify(body),
    })
    await relayUpstreamResponse(upstream, res)
  } catch (e) {
    console.error('[predictions/mrm] upstream POST error', e)
    res.status(502).json({ error: 'upstream_unreachable' })
  }
}
