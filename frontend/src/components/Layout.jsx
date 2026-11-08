import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Baby,
  Pill,
  FileText,
  FileCheck,
  ScanLine,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Heart
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../theme.css'
import './Layout.css'

const logoImage = '/images/logo-dr-massilia.png'
const DOCTOR_NAME = 'Dr Massilia Bouhmidi'
const DOCTOR_ROLE = 'Pédiatre & Néonatologue'

const NAV = [
  {
    title: 'Clinique & soins',
    items: [
      { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
      { to: '/app/rendez-vous', label: 'Rendez-vous', icon: CalendarDays },
      { to: '/app/patients', label: 'Enfants & Dossiers', icon: Baby }
    ]
  },
  {
    title: 'Documents médicaux',
    items: [
      { to: '/app/ordonnances', label: 'Ordonnances', icon: FileText },
      { to: '/app/attestations', label: 'Certificats & Attestations', icon: FileCheck },
      { to: '/app/radiologie', label: 'Examens Radio', icon: ScanLine },
      { to: '/app/medicaments', label: 'Base Médicaments', icon: Pill }
    ]
  },
  {
    title: 'Administration',
    items: [
      { to: '/app/parametres', label: 'Configuration Cabinet', icon: Settings }
    ]
  }
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Ferme le menu mobile quand on change de page
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const dateText = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

  async function handleLogout() {
    try {
      if (typeof logout === 'function') await logout()
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="lay-app">

      {menuOpen && (
        <div className="lay-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* ================= MENU LATÉRAL ================= */}
      <aside className={'lay-side' + (menuOpen ? ' is-open' : '')}>

        <div className="lay-brand">
          <Link to="/app" className="lay-brand-link">
            <img src={logoImage} alt="Logo Dr Massilia Bouhmidi" className="lay-logo" />
            <div className="lay-brand-text">
              <strong>{DOCTOR_NAME}</strong>
              <span>Pédiatre</span>
            </div>
          </Link>

          <button
            type="button"
            className="lay-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="lay-nav">
          {NAV.map((section) => (
            <div key={section.title} className="lay-section">
              <p className="lay-section-title">{section.title}</p>

              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      'lay-link' + (isActive ? ' is-active' : '')
                    }
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="lay-side-footer">
          <div className="lay-doctor">
            <div className="lay-avatar">MB</div>

            <div className="lay-doctor-info">
              <strong>{DOCTOR_NAME}</strong>
              <span>{DOCTOR_ROLE}</span>
            </div>

            <button
              type="button"
              className="lay-logout"
              onClick={handleLogout}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>

          <p className="lay-slogan">
            <Heart size={14} strokeWidth={1.8} />
            Chaque enfant mérite le meilleur
          </p>
        </div>
      </aside>

      {/* ================= CONTENU ================= */}
      <div className="lay-main">

        <header className="lay-topbar">
          <div className="lay-topbar-left">
            <button
              type="button"
              className="lay-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>

            <span className="lay-date">
              <CalendarDays size={16} />
              {dateText}
            </span>
          </div>

          <div className="lay-topbar-right">
            

            <Link
              to="/app/parametres"
              className="lay-icon-btn"
              aria-label="Configuration du cabinet"
              title="Configuration"
            >
              <Settings size={19} />
            </Link>
          </div>
        </header>

        <main className="lay-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}