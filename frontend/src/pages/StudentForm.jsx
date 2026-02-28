import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../api'

export default function StudentForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { request } = useApi()
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    course: '',
    year_level: '',
    contact: '',
    emergency_contact: '',
    emergency_phone: '',
    blood_type: '',
    allergies: '',
    medical_conditions: '',
    notes: '',
  })

  useEffect(() => {
    if (isEdit) {
      request(`/students/${id}`)
        .then(setForm)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await request(`/students/${id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
      } else {
        await request('/students', {
          method: 'POST',
          body: JSON.stringify(form),
        })
      }
      navigate('/students')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem' }}>
        {isEdit ? 'Edit student' : 'Add student'}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: '600px',
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      >
        {error && (
          <div style={{ padding: '0.75rem', background: '#fef2f2', color: 'var(--danger)', borderRadius: '6px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Student ID *" name="student_id" value={form.student_id} onChange={handleChange} required disabled={isEdit} />
          <Field label="Blood type" name="blood_type" value={form.blood_type} onChange={handleChange} />
          <Field label="First name *" name="first_name" value={form.first_name} onChange={handleChange} required />
          <Field label="Last name *" name="last_name" value={form.last_name} onChange={handleChange} required />
          <Field label="Course" name="course" value={form.course} onChange={handleChange} />
          <Field label="Year level" name="year_level" value={form.year_level} onChange={handleChange} />
          <Field label="Contact" name="contact" value={form.contact} onChange={handleChange} type="tel" />
          <Field label="Emergency contact" name="emergency_contact" value={form.emergency_contact} onChange={handleChange} />
          <Field label="Emergency phone" name="emergency_phone" value={form.emergency_phone} onChange={handleChange} type="tel" />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Field label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} textarea placeholder="e.g. Penicillin, peanuts" />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Field label="Medical conditions" name="medical_conditions" value={form.medical_conditions} onChange={handleChange} textarea placeholder="e.g. Asthma, diabetes" />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Field label="Notes" name="notes" value={form.notes} onChange={handleChange} textarea />
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
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
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Add student'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/students')}
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

function Field({ label, name, value, onChange, required, disabled, type = 'text', textarea, placeholder }) {
  const Input = textarea ? 'textarea' : 'input'
  return (
    <div>
      <label htmlFor={name} style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>
        {label}
      </label>
      <Input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        type={type}
        placeholder={placeholder}
        rows={textarea ? 3 : undefined}
        style={{
          width: '100%',
          padding: '0.6rem 0.75rem',
          border: '1px solid var(--border)',
          borderRadius: '6px',
        }}
      />
    </div>
  )
}
