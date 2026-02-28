import { useCallback } from 'react'
import { useAuth } from './context/AuthContext'

// Use your real Render URL here, ending with /api
const API_BASE =
  import.meta.env.PROD
    ? 'https://pilaq.onrender.com/api'
    : '/api'

export function useApi() {
  const { getToken } = useAuth()

  const request = useCallback(async (path, options = {}) => {
    const token = getToken()
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || res.statusText)
    }
    return res.json()
  }, [getToken])

  return { request }
}
