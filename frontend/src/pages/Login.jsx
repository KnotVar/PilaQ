import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          width: '100%',
          maxWidth: '360px',
        }}
      >
        <h1
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.5rem',
            color: 'var(--text)',
          }}
        >
          APCAS School Clinic
        </h1>
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)' }}>
          Sign in to continue
        </p>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '0.75rem',
                background: '#fef2f2',
                color: 'var(--danger)',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '0.35rem',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.35rem',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p
          style={{
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          Default: username <code>nurse</code>, password <code>clinic123</code>
        </p>
      </div>
    </div>
  )
}
