import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Activity,
  Calendar,
  Users,
  FileText,
  ClipboardList,
  RadioIcon,
  Pill,
  SettingsIcon,
  LogOut,
  Stethoscope,
  ExternalLink,
  Clock,
} from './Icons'
import api from '../api/client'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cabinet, setCabinet] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    api.get('/cabinet').then((res) => setCabinet(res.data)).catch(() => {})

    const checkPending = () => {
      api.get('/appointment-requests')
        .then((res) => {
          const pending = res.data.filter((r) => r.status === 'pending').length
          setPendingCount(pending)
        })
        .catch(() => {})
    }
    checkPending()
    const interval = setInterval(checkPending, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Stethoscope size={24} />
          </div>
          <div>
            <div className="sidebar-title">{cabinet?.name || 'Cabinet Médical'}</div>
            <div className="sidebar-subtitle">Gestion & Consultations</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Clinique & Soins</div>

          <NavLink
            to="/app"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Activity size={18} />
              <span>Tableau de bord</span>
            </div>
          </NavLink>

          <NavLink
            to="/app/rendez-vous"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Calendar size={18} />
              <span>Rendez-vous</span>
            </div>
            {pendingCount > 0 && (
              <span className="badge badge-warning" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                {pendingCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/app/patients"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Users size={18} />
              <span>Patients & Dossiers</span>
            </div>
          </NavLink>

          <div className="nav-section-title">Documents Médicaux</div>

          <NavLink
            to="/app/ordonnances"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <FileText size={18} />
              <span>Ordonnances</span>
            </div>
          </NavLink>

          <NavLink
            to="/app/attestations"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <ClipboardList size={18} />
              <span>Certificats & Attestations</span>
            </div>
          </NavLink>

          <NavLink
            to="/app/radiologie"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <RadioIcon size={18} />
              <span>Examens Radio</span>
            </div>
          </NavLink>

          <NavLink
            to="/app/medicaments"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <Pill size={18} />
              <span>Base Médicaments</span>
            </div>
          </NavLink>

          <div className="nav-section-title">Administration</div>

          <NavLink
            to="/app/parametres"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-item-left">
              <SettingsIcon size={18} />
              <span>Configuration Cabinet</span>
            </div>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="doctor-pill">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="doctor-avatar">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user?.name || 'Dr. Le Médecin'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {user?.specialty || 'Médecin Généraliste'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px', color: 'var(--danger)' }}
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="badge badge-info" style={{ gap: 8, padding: '6px 14px' }}>
              <span className="pulse-dot" />
              <span style={{ fontWeight: 600 }}>Cabinet ouvert</span>
              <span style={{ color: 'var(--text-light)' }}>•</span>
              <Clock size={14} />
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              to="/"
              target="_blank"
              className="btn btn-outline btn-sm"
              style={{ gap: 8 }}
            >
              <ExternalLink size={14} />
              <span>Voir le Site Public</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate('/app/parametres')}
              className="btn btn-ghost btn-sm"
              title="Paramètres"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
