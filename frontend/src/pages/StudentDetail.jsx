import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../api'

export default function StudentDetail() {
  const { id } = useParams()
  const { request } = useApi()
  const [student, setStudent] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      request(`/students/${id}`),
      request(`/consultations?student_id=${id}`),
    ])
      .then(([s, c]) => {
        setStudent(s)
        setConsultations(c.consultations || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !student) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          {student.first_name} {student.last_name}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/students/${id}/edit`}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            Edit
          </Link>
          <Link
            to={`/consultations/new?student=${id}`}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--surface)',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            New consultation
          </Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <Section title="Basic info">
          <Row label="Student ID" value={student.student_id} />
          <Row label="Course" value={student.course} />
          <Row label="Year level" value={student.year_level} />
          <Row label="Contact" value={student.contact} />
        </Section>
        <Section title="Health info">
          <Row label="Blood type" value={student.blood_type} />
          <Row label="Allergies" value={student.allergies} />
          <Row label="Medical conditions" value={student.medical_conditions} />
        </Section>
      </div>

      <Section title="Emergency contact">
        <Row label="Name" value={student.emergency_contact} />
        <Row label="Phone" value={student.emergency_phone} />
      </Section>

      {student.notes && (
        <Section title="Notes" style={{ marginTop: '1.5rem' }}>
          <p style={{ margin: 0 }}>{student.notes}</p>
        </Section>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Consultation history</h2>
        {consultations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No consultations yet</p>
        ) : (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Date</th>
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
                    <td style={{ padding: '0.75rem 1rem' }}>{c.chief_complaint}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{c.treatment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        padding: '1.25rem',
      }}
    >
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-muted)' }}>{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
      <strong>{label}:</strong> {value}
    </p>
  )
}
