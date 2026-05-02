import { proxyBrowserApiToBackendAdapter } from './lib/backendApiProxy.js'

/**
 * Proxy Vercel pour tout `/api/*` sans handler dédié (ex. `/api/prediction/mrm/leaderboard`).
 * Les routes définies comme fichiers dans `api/` sont servies en priorité par Vercel.
 */
export default async function handler(req, res) {
  /** Vercel injecte `:path*` du rewrite dans la query (`path`), pas `p`. */
  const raw = req.query.path ?? req.query.p
  if (raw == null || raw === '') {
    res.status(404).json({ error: 'not_found' })
    return
  }

  const tail = Array.isArray(raw) ? raw.join('/') : String(raw)
  const pathname = '/api/' + tail.replace(/^\/+/, '')

  const url = new URL(req.url || '/', 'http://localhost')
  const sp = new URLSearchParams(url.searchParams)
  sp.delete('path')
  sp.delete('p')
  const qs = sp.toString()
  const pathWithQuery = qs ? `${pathname}?${qs}` : pathname

  await proxyBrowserApiToBackendAdapter(req, pathWithQuery, res)
}
