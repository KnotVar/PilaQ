import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api'

export default function Students() {
  const { request } = useApi()
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchStudents = (page = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 20 })
    if (search) params.set('search', search)
    request(`/students?${params}`)
      .then((data) => {
        setStudents(data.students)
        setTotal(data.total)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(1), 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Students</h1>
        <Link
          to="/students/new"
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Add student
        </Link>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="search"
          placeholder="Search by ID, first or last name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.6rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}
        />
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
        ) : students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Student ID</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Course</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Year</th>
                <th style={{ padding: '0.75rem 1rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.student_id}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.first_name} {s.last_name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.course || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{s.year_level || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Link to={`/students/${s.id}`} style={{ marginRight: '0.75rem' }}>View</Link>
                    <Link to={`/students/${s.id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {total > 0 && (
        <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {total} student{total !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  )
}
