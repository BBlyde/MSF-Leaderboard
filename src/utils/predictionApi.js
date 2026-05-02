const predictionApiBaseUrl = '/api'

export function predictionApiUrl(pathname) {
  const normalizedPath = String(pathname || '').replace(/^\/+/, '')
  return `${predictionApiBaseUrl}/${normalizedPath}`
}

