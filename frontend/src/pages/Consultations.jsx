import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api'

export default function Consultations() {
  const { request } = useApi()
  const [consultations, setConsultations] = useState([])
  const [total, setTotal] = useState(0)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)

  const fetchConsultations = (page = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 20 })
    if (date) params.set('date', date)
    request(`/consultations?${params}`)
      .then((data) => {
        setConsultations(data.consultations)
        setTotal(data.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchConsultations(1)
  }, [date])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Consultations</h1>
        <Link
          to="/consultations/new"
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          New consultation
        </Link>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.9rem' }}>
          Filter by date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              marginLeft: '0.5rem',
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </label>
        <button
          onClick={() => setDate('')}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}
        >
          Clear filter
        </button>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : consultations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No consultations found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Student</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Chief complaint</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Treatment</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {c.visit_date} {c.visit_time || ''}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Link to={`/students/${c.student_id}`}>
                      {c.first_name} {c.last_name} ({c.student_number})
                    </Link>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{c.chief_complaint}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{c.treatment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {total > 0 && (
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {total} consultation{total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
