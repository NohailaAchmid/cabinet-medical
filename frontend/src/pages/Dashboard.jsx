import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Baby,
  CalendarDays,
  Clock,
  FileText,
  Plus,
  Check,
  X,
  ChevronRight,
  Heart,
  Stethoscope
} from 'lucide-react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import './Dashboard.css'

/* Âge lisible à partir d'une date de naissance (si le champ existe) */
function ageLabel(value) {
  if (!value) return ''
  const birth = new Date(value)
  if (isNaN(birth)) return ''
  const now = new Date()
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) return ''
  if (months < 1) return 'Nouveau-né'
  if (months < 24) return `${months} mois`
  return `${Math.floor(months / 12)} ans`
}

/* Données d'exemple pour le graphique (à relier plus tard à de vraies stats) */
const WEEKLY_STATS = [
  { day: 'Lun', val: 75, count: 6 },
  { day: 'Mar', val: 90, count: 8 },
  { day: 'Mer', val: 60, count: 5 },
  { day: 'Jeu', val: 85, count: 7 },
  { day: 'Ven', val: 95, count: 9 },
  { day: 'Sam', val: 40, count: 3 }
]

export default function Dashboard() {
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
      <div className="ped-dash">
        <div className="ped-loading">
          <Heart size={30} strokeWidth={1.8} />
          Chargement du tableau de bord…
        </div>
      </div>
    )
  }

  const upcoming = data.upcoming || []
  const latestPatients = data.latest_patients || []

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const todayText = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)

  return (
    <div className="ped-dash">

      {/* ================= BANDEAU D'ACCUEIL ================= */}
      <section className="ped-banner">
        

       
          

          <h1>
            Bonjour, <span>Dr Massilia Bouhmidi</span>
          </h1>

         
        

        
      </section>

      {/* ================= INDICATEURS ================= */}
      <section className="ped-kpis">

        <article className="ped-kpi">
          <div className="ped-kpi-icon ped-blue">
            <Baby size={30} strokeWidth={2} />
          </div>
          <div>
            <div className="ped-kpi-value">{data.patients_count}</div>
            <div className="ped-kpi-label">Enfants suivis</div>
          </div>
        </article>

        <article className="ped-kpi">
          <div className="ped-kpi-icon ped-coral">
            <CalendarDays size={30} strokeWidth={2} />
          </div>
          <div>
            <div className="ped-kpi-value">{data.appointments_today}</div>
            <div className="ped-kpi-label">Rendez-vous aujourd'hui</div>
          </div>
        </article>

        <article className="ped-kpi">
          <div className="ped-kpi-icon ped-blue">
            <Clock size={30} strokeWidth={2} />
          </div>
          <div>
            <div className="ped-kpi-value">
              {pendingRequests.length}
              {pendingRequests.length > 0 && (
                <em>à traiter</em>
              )}
            </div>
            <div className="ped-kpi-label">Demandes en attente</div>
          </div>
        </article>

        <article className="ped-kpi">
          <div className="ped-kpi-icon ped-coral">
            <FileText size={30} strokeWidth={2} />
          </div>
          <div>
            <div className="ped-kpi-value">{data.prescriptions_month}</div>
            <div className="ped-kpi-label">Ordonnances du mois</div>
          </div>
        </article>

      </section>

      {/* ================= ACTIVITÉ + DEMANDES ================= */}
      <section className="ped-row ped-row-top">

        {/* Graphique */}
        <article className="ped-card">
          <header className="ped-card-head">
            <div>
              <h2>Consultations de la semaine</h2>
              <p>Répartition des visites (données d'exemple)</p>
            </div>
            <span className="ped-chip ped-chip-blue">
              <Stethoscope size={14} />
              Semaine
            </span>
          </header>

          <div className="ped-chart">
            {WEEKLY_STATS.map((item) => (
              <div key={item.day} className="ped-chart-col">
                <span className="ped-chart-count">{item.count}</span>
                <div
                  className="ped-chart-bar"
                  style={{ height: `${item.val}%` }}
                  title={`${item.count} consultations le ${item.day}`}
                />
                <span className="ped-chart-day">{item.day}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Demandes en ligne */}
        <article className="ped-card ped-requests">
          <header className="ped-card-head">
            <div>
              <h2>Demandes des parents</h2>
              <p>Rendez-vous demandés en ligne</p>
            </div>
            <span
              className={
                'ped-chip ' +
                (pendingRequests.length > 0 ? 'ped-chip-coral' : 'ped-chip-grey')
              }
            >
              {pendingRequests.length} en attente
            </span>
          </header>

          {pendingRequests.length > 0 ? (
            <div className="ped-request-list">
              {pendingRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="ped-request">
                  <div className="ped-request-info">
                    <strong>{req.name}</strong>
                    <span>
                      <CalendarDays size={13} />
                      {req.preferred_date}
                      <Clock size={13} />
                      {req.preferred_time || 'Libre'}
                    </span>
                    {req.reason && <small>{req.reason}</small>}
                  </div>

                  <div className="ped-request-actions">
                    <button
                      type="button"
                      className="ped-icon-btn ped-ok"
                      onClick={() => handleConfirmRequest(req.id)}
                      aria-label="Valider la demande"
                      title="Valider"
                    >
                      <Check size={17} />
                    </button>
                    <button
                      type="button"
                      className="ped-icon-btn ped-no"
                      onClick={() => handleRefuseRequest(req.id)}
                      aria-label="Refuser la demande"
                      title="Refuser"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ped-empty">
              <Heart size={28} strokeWidth={1.7} />
              Aucune demande en attente.
              <br />
              Toutes les réservations en ligne sont traitées.
            </div>
          )}

          <Link to="/app/rendez-vous" className="ped-link">
            Accéder au calendrier complet
            <ChevronRight size={16} />
          </Link>
        </article>

      </section>

      {/* ================= AGENDA + ENFANTS ================= */}
      <section className="ped-row ped-row-bottom">

        {/* Agenda */}
        <article className="ped-card">
          <header className="ped-card-head">
            <div>
              <h2>Prochaines consultations</h2>
              <p>Rendez-vous programmés</p>
            </div>
            <Link to="/app/rendez-vous" className="ped-btn ped-btn-outline">
              Gérer l'agenda
            </Link>
          </header>

          <div className="ped-table-wrap">
            <table className="ped-table">
              <thead>
                <tr>
                  <th>Heure / Date</th>
                  <th>Enfant / Parent</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <strong>{appt.time}</strong>
                      <small>{appt.date}</small>
                    </td>
                    <td>
                      <strong>{appt.name}</strong>
                      <small>{appt.phone || appt.email}</small>
                    </td>
                    <td>{appt.reason || 'Consultation pédiatrique'}</td>
                    <td>
                      <span
                        className={
                          'ped-chip ' +
                          (appt.status === 'confirmed'
                            ? 'ped-chip-green'
                            : 'ped-chip-coral')
                        }
                      >
                        {appt.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                ))}

                {upcoming.length === 0 && (
                  <tr>
                    <td colSpan={4} className="ped-table-empty">
                      Aucun rendez-vous planifié prochainement.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* Derniers enfants */}
        <article className="ped-card">
          <header className="ped-card-head">
            <div>
              <h2>Derniers enfants inscrits</h2>
              <p>Accès rapide aux dossiers</p>
            </div>
            <Link to="/app/patients" className="ped-btn ped-btn-outline">
              Répertoire
            </Link>
          </header>

          <div className="ped-patients">
            {latestPatients.map((pat, index) => {
              const age = ageLabel(pat.birth_date || pat.date_of_birth)

              return (
                <Link
                  key={pat.id}
                  to={`/app/patients/${pat.id}`}
                  className="ped-patient"
                >
                  <div
                    className={
                      'ped-avatar ' + (index % 2 === 0 ? 'ped-blue' : 'ped-coral')
                    }
                  >
                    {pat.first_name?.[0]}
                    {pat.last_name?.[0]}
                  </div>

                  <div className="ped-patient-info">
                    <strong>
                      {pat.last_name?.toUpperCase()} {pat.first_name}
                    </strong>
                    <span>{pat.phone || pat.email || 'Sans contact'}</span>
                  </div>

                  {age && <span className="ped-chip ped-chip-blue">{age}</span>}
                  {pat.blood_type && (
                    <span className="ped-chip ped-chip-coral">{pat.blood_type}</span>
                  )}
                  <ChevronRight size={18} className="ped-chevron" />
                </Link>
              )
            })}

            {latestPatients.length === 0 && (
              <div className="ped-empty">
                <Baby size={28} strokeWidth={1.7} />
                Aucun enfant enregistré.
              </div>
            )}
          </div>
        </article>

      </section>

      {/* ================= SLOGAN ================= */}
      <p className="ped-slogan">
        <Heart size={18} strokeWidth={1.8} />
        Parce que chaque enfant mérite le meilleur
      </p>

    </div>
  )
}