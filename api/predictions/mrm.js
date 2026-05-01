import { backendAbsoluteUrlFromBrowserRequest } from '../lib/backendApiProxy.js'
import { getJsonBody } from '../lib/getJsonBody.js'

function backendPredictionUrl() {
  return backendAbsoluteUrlFromBrowserRequest('/api/prediction/mrm')
}

function backendFinishedUrl() {
  return backendAbsoluteUrlFromBrowserRequest('/api/prediction/mrm/score/recompute')
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

/**
 * @param {unknown} raw
 */
function normalizeFinished(raw) {
  const data = raw && typeof raw === 'object' ? raw : {}
  return {
    group1: data.group1 === true || data.group1Finished === true,
    group2: data.group2 === true || data.group2Finished === true,
    semi1: data.semi1 === true || data.semi1Finished === true,
    semi2: data.semi2 === true || data.semi2Finished === true,
    thirdPlace: data.thirdPlace === true || data.thirdPlaceFinished === true,
    final: data.final === true || data.finalFinished === true,
  }
}

/**
 * @param {unknown} raw
 */
function normalizeOfficial(raw) {
  const data = raw && typeof raw === 'object' ? raw : null
  if (!data) return null
  const out = {}
  if (Array.isArray(data.group1)) out.group1 = data.group1
  if (Array.isArray(data.group2)) out.group2 = data.group2
  if (Array.isArray(data.order1)) out.order1 = data.order1
  if (Array.isArray(data.order2)) out.order2 = data.order2
  if (data.semi1Winner != null) out.semi1Winner = data.semi1Winner
  if (data.semi2Winner != null) out.semi2Winner = data.semi2Winner
  if (data.thirdPlaceWinner != null) out.thirdPlaceWinner = data.thirdPlaceWinner
  if (data.finalWinner != null) out.finalWinner = data.finalWinner
  return out
}

async function maybeFetchJson(url, headers) {
  try {
    const res = await fetch(url, { method: 'GET', headers })
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  const upstreamUrl = backendPredictionUrl()

  if (req.method === 'GET') {
    try {
      const upstream = await fetch(upstreamUrl, {
        method: 'GET',
        headers: upstreamHeaders(req),
      })
      const contentType = upstream.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        await relayUpstreamResponse(upstream, res)
        return
      }

      const basePayload = (await upstream.json().catch(() => null)) ?? {}
      const payload = basePayload && typeof basePayload === 'object' ? { ...basePayload } : {}

      const headers = upstreamHeaders(req)
      const finishedRaw = await maybeFetchJson(backendFinishedUrl(), headers)

      const finished = normalizeFinished(finishedRaw)
      const existingFinished =
        payload.finished && typeof payload.finished === 'object' ? normalizeFinished(payload.finished) : {}
      payload.finished = { ...existingFinished, ...finished }

      const existingOfficial =
        payload.official && typeof payload.official === 'object' ? normalizeOfficial(payload.official) : null
      payload.official = {
        ...(existingOfficial ?? {}),
      }

      res.status(upstream.status).json(payload)
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
