const DEFAULT_BACKEND_BASE_URL = 'https://back.mcsr-game.com'

/**
 * Origine + chemin. La plupart des routes gardent /api/... sur l’upstream.
 * MSFAdminTournois est sur /tournament : /api/tournament/* → /tournament/*.
 */
export function backendAbsoluteUrlFromBrowserRequest(pathWithQuery) {
  const raw = (process.env.BACKEND_API_BASE_URL || DEFAULT_BACKEND_BASE_URL).replace(/\/$/, '')
  const origin = raw.endsWith('/api') ? raw.slice(0, -4) : raw
  let path = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`
  if (
    path === '/api/tournament' ||
    path.startsWith('/api/tournament/') ||
    path.startsWith('/api/tournament?')
  ) {
    path = `/tournament${path.slice('/api/tournament'.length)}`
  }
  return `${origin}${path}`
}

/**
 * @param {import('http').IncomingMessage} req
 */
export function readRawRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {Buffer} bodyBuf
 */
function forwardRequestHeaders(req, bodyBuf) {
  /** @type {Record<string, string>} */
  const h = {}
  const pass = [
    'accept',
    'accept-language',
    'content-type',
    'authorization',
    'cookie',
    'x-requested-with',
  ]
  for (const k of pass) {
    const v = req.headers[k]
    if (v) h[k] = Array.isArray(v) ? v.join(', ') : v
  }
  if (bodyBuf?.length && !h['content-type']) {
    h['content-type'] = 'application/octet-stream'
  }
  return h
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {string} pathWithQuery pathname + search
 * @returns {Promise<Response | null>}
 */
export async function fetchBackendMirror(req, pathWithQuery) {
  const targetUrl = backendAbsoluteUrlFromBrowserRequest(pathWithQuery)
  const method = (req.method || 'GET').toUpperCase()
  let bodyBuf = Buffer.alloc(0)
  if (method !== 'GET' && method !== 'HEAD') {
    bodyBuf = await readRawRequestBody(req)
  }
  const headers = forwardRequestHeaders(req, bodyBuf)
  const hasBody = bodyBuf.length > 0
  try {
    return await fetch(targetUrl, {
      method,
      headers,
      body: hasBody ? bodyBuf : undefined,
    })
  } catch (e) {
    console.error('[backendApiProxy] fetch failed', targetUrl, e)
    return null
  }
}

/**
 * @param {Response} upstream
 * @param {{ status: (n: number) => { json: (o: unknown) => void, setHeader: (a: string, b: string) => unknown, send: (s: string) => void } }} vres
 */
export async function relayFetchToAdapter(upstream, vres) {
  const ct = upstream.headers.get('content-type') || ''
  const status = upstream.status
  if (ct.includes('application/json')) {
    const payload = await upstream.json().catch(() => null)
    vres.status(status).json(payload ?? {})
    return
  }
  const body = await upstream.text().catch(() => '')
  const out = vres.status(status)
  if (ct) out.setHeader('Content-Type', ct)
  else out.setHeader('Content-Type', 'text/plain; charset=utf-8')
  out.send(body)
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {string} pathWithQuery
 * @param {object} vres adaptateur style Vercel (status / json / setHeader / send)
 */
export async function proxyBrowserApiToBackendAdapter(req, pathWithQuery, vres) {
  const upstream = await fetchBackendMirror(req, pathWithQuery)
  if (!upstream) {
    vres.status(502).json({ error: 'upstream_unreachable' })
    return
  }
  await relayFetchToAdapter(upstream, vres)
}
