import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api'

export default function Dashboard() {
  const { request } = useApi()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStats = () => {
    setError(null)
    setLoading(true)
    request('/dashboard/stats')
      .then(setStats)
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading && !stats) return <div>Loading dashboard...</div>
  if (error && !stats) {
    return (
      <div>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={loadStats}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Try again
        </button>
      </div>
    )
  }
  if (!stats) return <div>Failed to load dashboard</div>

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Card
          title="Today's consultations"
          value={stats.today}
          link="/consultations"
          linkText="View all"
        />
        <Card
          title="This week"
          value={stats.thisWeek}
          link="/consultations"
          linkText="View all"
        />
        <Card
          title="Total students"
          value={stats.totalStudents}
          link="/students"
          linkText="Manage"
        />
      </div>

      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>
          Top complaints (last 30 days)
        </h2>
        {stats.topComplaints?.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {stats.topComplaints.map((c, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>{c.chief_complaint}</strong> — {c.count} visit{c.count !== 1 ? 's' : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No data yet</p>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link
          to="/students/new"
          style={{
            padding: '0.6rem 1.2rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Add student
        </Link>
        <Link
          to="/consultations/new"
          style={{
            padding: '0.6rem 1.2rem',
            background: 'var(--surface)',
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
            borderRadius: '6px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          New consultation
        </Link>
      </div>
    </div>
  )
}

function Card({ title, value, link, linkText }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        padding: '1.25rem',
      }}
    >
      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {title}
      </p>
      <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{value}</p>
      {link && (
        <Link to={link} style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'inline-block' }}>
          {linkText} →
        </Link>
      )}
    </div>
  )
}
