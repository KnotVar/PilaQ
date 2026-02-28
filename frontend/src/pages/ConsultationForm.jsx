import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../api'

export default function ConsultationForm() {
  const [searchParams] = useSearchParams()
  const preselectedStudent = searchParams.get('student')
  const navigate = useNavigate()
  const { request } = useApi()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    student_id: preselectedStudent || '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: new Date().toTimeString().slice(0, 5),
    chief_complaint: '',
    vital_signs: {
      temperature: '',
      blood_pressure: '',
      pulse: '',
    },
    assessment: '',
    treatment: '',
    medication_given: '',
    referral: '',
    notes: '',
  })

  useEffect(() => {
    request('/students?limit=500')
      .then((data) => setStudents(data.students || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (preselectedStudent) setForm((f) => ({ ...f, student_id: preselectedStudent }))
  }, [preselectedStudent])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('vital_')) {
      const key = name.replace('vital_', '')
      setForm((f) => ({
        ...f,
        vital_signs: { ...f.vital_signs, [key]: value },
      }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        vital_signs: Object.values(form.vital_signs).some((v) => v) ? form.vital_signs : null,
      }
      await request('/consultations', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      navigate('/consultations')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>New consultation</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: '700px',
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      >
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
          <label htmlFor="student_id" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Student *
          </label>
          <select
            id="student_id"
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          >
            <option value="">Select student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.student_id} — {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Visit date *</label>
            <input
              type="date"
              name="visit_date"
              value={form.visit_date}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>Time</label>
            <input
              type="time"
              name="visit_time"
              value={form.visit_time}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="chief_complaint" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Chief complaint *
          </label>
          <input
            id="chief_complaint"
            name="chief_complaint"
            value={form.chief_complaint}
            onChange={handleChange}
            required
            placeholder="e.g. Headache, fever, stomach pain"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vital signs</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Temp (°C)</label>
              <input
                type="text"
                name="vital_temperature"
                value={form.vital_signs.temperature}
                onChange={handleChange}
                placeholder="36.5"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.6rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  width: '80px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>BP</label>
              <input
                type="text"
                name="vital_blood_pressure"
                value={form.vital_signs.blood_pressure}
                onChange={handleChange}
                placeholder="120/80"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.6rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  width: '100px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pulse</label>
              <input
                type="text"
                name="vital_pulse"
                value={form.vital_signs.pulse}
                onChange={handleChange}
                placeholder="72"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.6rem',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  width: '70px',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="assessment" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Assessment
          </label>
          <textarea
            id="assessment"
            name="assessment"
            value={form.assessment}
            onChange={handleChange}
            rows={2}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="treatment" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Treatment
          </label>
          <textarea
            id="treatment"
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Rest, paracetamol 500mg"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="medication_given" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Medication given
          </label>
          <input
            id="medication_given"
            name="medication_given"
            value={form.medication_given}
            onChange={handleChange}
            placeholder="e.g. Paracetamol 500mg x2"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="referral" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Referral
          </label>
          <input
            id="referral"
            name="referral"
            value={form.referral}
            onChange={handleChange}
            placeholder="e.g. Refer to hospital if fever persists"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500 }}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
            }}
          >
            {saving ? 'Saving...' : 'Save consultation'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
