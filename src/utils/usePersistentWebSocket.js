import { useEffect, useRef } from 'react'

export const TOURNAMENT_WS_URL = 'wss://back.mcsr-game.com/ws/tournament'

const PING_MS = 25_000
const RETRY_MIN_MS = 1_000
const RETRY_MAX_MS = 30_000

/**
 * Keeps a WebSocket open: reconnects on drop, on tab focus, and on browser online;
 * sends a lightweight ping so proxies do not idle-close the socket.
 */
export function usePersistentWebSocket(url, onMessage) {
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    let disposed = false
    let socket = null
    let pingId = null
    let retryId = null
    let retryDelay = RETRY_MIN_MS

    const clearTimers = () => {
      if (pingId != null) {
        clearInterval(pingId)
        pingId = null
      }
      if (retryId != null) {
        clearTimeout(retryId)
        retryId = null
      }
    }

    const stopSocket = () => {
      if (!socket) return
      socket.onopen = null
      socket.onmessage = null
      socket.onerror = null
      socket.onclose = null
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
      socket = null
    }

    const scheduleReconnect = () => {
      if (disposed || retryId != null) return
      retryId = setTimeout(() => {
        retryId = null
        connect()
      }, retryDelay)
      retryDelay = Math.min(retryDelay * 2, RETRY_MAX_MS)
    }

    const connect = () => {
      if (disposed) return
      clearTimers()
      stopSocket()
      const ws = new WebSocket(url)
      socket = ws

      ws.onopen = () => {
        retryDelay = RETRY_MIN_MS
        pingId = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('{"type":"ping"}')
          }
        }, PING_MS)
      }

      ws.onmessage = (event) => {
        let data = null
        try {
          data = JSON.parse(event.data)
        } catch {
          return
        }
        if (data?.type === 'ping' || data?.type === 'pong') return
        onMessageRef.current?.(data)
      }

      ws.onclose = () => {
        clearTimers()
        if (socket === ws) socket = null
        scheduleReconnect()
      }
    }

    const resumeIfNeeded = () => {
      if (disposed) return
      const state = socket?.readyState
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return
      retryDelay = RETRY_MIN_MS
      connect()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') resumeIfNeeded()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', resumeIfNeeded)
    connect()

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', resumeIfNeeded)
      clearTimers()
      stopSocket()
    }
  }, [url])
}
