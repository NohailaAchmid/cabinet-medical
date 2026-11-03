import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Activity,
  Plus,
  Check,
  X,
  ChevronRight,
  ClipboardList,
  RadioIcon,
  AlertCircle,
  TrendingUp,
} from '../components/Icons'

export default function Dashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [data, setData] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  function loadData() {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))

    api.get('/appointment-requests')
      .then((res) => {
        setPendingRequests(res.data.filter((r) => r.status === 'pending'))
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleConfirmRequest(reqId) {
    try {
      await api.post(`/appointment-requests/${reqId}/confirm`)
      addToast('Demande confirmée et rendez-vous planifié !', 'success')
      loadData()
    } catch {
      addToast('Erreur lors de la confirmation.', 'error')
    }
  }

  async function handleRefuseRequest(reqId) {
    try {
      await api.post(`/appointment-requests/${reqId}/refuse`)
      addToast('Demande refusée.', 'info')
      loadData()
    } catch {
      addToast('Erreur lors du refus.', 'error')
    }
  }

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Chargement du tableau de bord…
      </div>
    )
  }

  // Weekly activity mockup distribution for trendy dynamic chart
  const weeklyStats = [
    { day: 'Lun', val: 75, count: 6 },
    { day: 'Mar', val: 90, count: 8 },
    { day: 'Mer', val: 60, count: 5 },
    { day: 'Jeu', val: 85, count: 7 },
    { day: 'Ven', val: 95, count: 9 },
    { day: 'Sam', val: 40, count: 3 },
  ]

  return (
    <div>
      {/* Top Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 30,
        }}
      >
        <div>
          <span className="badge badge-info" style={{ marginBottom: 8 }}>
            <span className="pulse-dot" /> Espace Médical • Session Active
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Tableau de bord — {user?.name || 'Docteur'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginTop: 4 }}>
            Vue synthétique de l'activité médicale, du planning et des dossiers de votre cabinet.
          </p>
        </div>

        {/* Quick Actions Shortcuts */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/app/patients" className="btn btn-primary btn-sm">
            <Plus size={16} /> Nouveau Patient
          </Link>
          <Link to="/app/rendez-vous" className="btn btn-outline btn-sm">
            <Calendar size={16} /> Nouveau RDV
          </Link>
          <Link to="/app/ordonnances" className="btn btn-outline btn-sm">
            <FileText size={16} /> Rédiger Ordonnance
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box kpi-blue">
            <Users size={26} />
          </div>
          <div>
            <div className="kpi-value">{data.patients_count}</div>
            <div className="kpi-label">Dossiers Patients Actifs</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-emerald">
            <Calendar size={26} />
          </div>
          <div>
            <div className="kpi-value">{data.appointments_today}</div>
            <div className="kpi-label">Rendez-vous Aujourd'hui</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-amber">
            <Clock size={26} />
          </div>
          <div>
            <div className="kpi-value">
              {pendingRequests.length}
              {pendingRequests.length > 0 && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--warning-text)',
                    marginLeft: 8,
                    fontWeight: 700,
                  }}
                >
                  à traiter
                </span>
              )}
            </div>
            <div className="kpi-label">Demandes en Attente</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box kpi-purple">
            <FileText size={26} />
          </div>
          <div>
            <div className="kpi-value">{data.prescriptions_month}</div>
            <div className="kpi-label">Ordonnances du Mois</div>
          </div>
        </div>
      </div>

      {/* Weekly Activity & Pending Requests Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Activity Chart Card */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div>
              <h3 className="card-title">Flux Hebdomadaire des Consultations</h3>
              <p className="card-subtitle">Répartition moyenne des visites sur la semaine</p>
            </div>
            <span className="badge badge-success">
              <span className="pulse-dot" /> Actif
            </span>
          </div>

          <div className="mini-chart">
            {weeklyStats.map((item, idx) => (
              <div key={idx} className="mini-chart-col">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  {item.count}
                </span>
                <div
                  className="mini-chart-bar"
                  style={{ height: `${item.val}%` }}
                  title={`${item.count} consultations le ${item.day}`}
                />
                <span className="mini-chart-day">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pending Alert */}
        <div
          className="card"
          style={{
            borderLeft: pendingRequests.length > 0 ? '4px solid var(--warning)' : '4px solid var(--border)',
            background: pendingRequests.length > 0 ? 'linear-gradient(90deg, #fffbeb, #ffffff)' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="card-header" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${pendingRequests.length > 0 ? 'badge-warning' : 'badge-secondary'}`}>
                  {pendingRequests.length} en attente
                </span>
                <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                  Demandes Patients en Ligne
                </h3>
              </div>
              <Link to="/app/rendez-vous" className="btn btn-ghost btn-sm">
                Voir tout
              </Link>
            </div>

            {pendingRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingRequests.slice(0, 2).map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{req.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📅 {req.preferred_date} • 🕒 {req.preferred_time || 'Libre'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleConfirmRequest(req.id)}
                      >
                        <Check size={13} /> Valider
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '5px 8px', fontSize: '0.78rem' }}
                        onClick={() => handleRefuseRequest(req.id)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '14px 0' }}>
                Aucune demande en attente. Toutes les réservations en ligne sont traitées.
              </p>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
            <Link
              to="/app/rendez-vous"
              style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Accéder au calendrier complet <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's agenda & Recent Patients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Today's appointments */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Agenda des consultations à venir</h3>
              <p className="card-subtitle">Consultations médicales programmées</p>
            </div>
            <Link to="/app/rendez-vous" className="btn btn-outline btn-sm">
              Gérer l'agenda
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Heure / Date</th>
                  <th>Patient</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.upcoming.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{appt.time}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{appt.date}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{appt.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{appt.phone || appt.email}</div>
                    </td>
                    <td>{appt.reason || 'Consultation générale'}</td>
                    <td>
                      <span className={`badge ${appt.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                        {appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.upcoming.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '34px', color: 'var(--text-muted)' }}>
                      Aucun rendez-vous planifié prochainement.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Patients */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Derniers patients inscrits</h3>
              <p className="card-subtitle">Accès rapide aux dossiers médicaux</p>
            </div>
            <Link to="/app/patients" className="btn btn-outline btn-sm">
              Répertoire
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.latest_patients.map((pat) => (
              <Link
                key={pat.id}
                to={`/app/patients/${pat.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: 'var(--primary-gradient-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    {pat.first_name[0]}
                    {pat.last_name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                      {pat.last_name?.toUpperCase()} {pat.first_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {pat.phone || pat.email || 'Sans contact'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {pat.blood_type && (
                    <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                      {pat.blood_type}
                    </span>
                  )}
                  <ChevronRight size={16} color="var(--text-light)" />
                </div>
              </Link>
            ))}

            {data.latest_patients.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Aucun patient enregistré.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
