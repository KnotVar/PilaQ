import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            APCAS School Clinic
          </h1>
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
              })}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/students"
              style={({ isActive }) => ({
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
              })}
            >
              Students
            </NavLink>
            <NavLink
              to="/consultations"
              style={({ isActive }) => ({
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
              })}
            >
              Consultations
            </NavLink>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {user?.full_name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.8rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-muted)',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  )
}
