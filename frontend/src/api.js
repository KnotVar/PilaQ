import { useCallback } from 'react'
import { useAuth } from './context/AuthContext'

export function useApi() {
  const { getToken } = useAuth()

  const request = useCallback(async (path, options = {}) => {
    const token = getToken()
    const res = await fetch(`/api${path}`, {
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
