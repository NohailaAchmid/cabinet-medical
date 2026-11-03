
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { validationMessage } from '../api/client'
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  MapPin,
  Phone,
} from '../components/Icons'

export default function Book() {
  const [cabinet, setCabinet] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const todayStr = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_date: todayStr,
    preferred_time: '',
    reason: 'Consultation générale',
    notes: '',
  })

  // Charger les informations du cabinet
  useEffect(() => {
    api.get('/public/cabinet')
      .then((res) => {
        setCabinet(res.data.cabinet)
      })
      .catch(() => {})
  }, [])

  // Charger les créneaux disponibles selon la date sélectionnée
  useEffect(() => {
    if (!form.preferred_date) return

    let cancelled = false

    setLoadingSlots(true)
    setSlots([])

    api.get(`/public/slots?date=${form.preferred_date}`)
      .then((res) => {
        if (cancelled) return

        // Vérifier et récupérer uniquement les créneaux disponibles
        const availableSlots = Array.isArray(res.data)
          ? res.data.filter(
              (slot) =>
                slot &&
                typeof slot.time === 'string' &&
                slot.available === true
            )
          : []

        setSlots(availableSlots)

        // Conserver l'heure sélectionnée si elle est toujours disponible
        setForm((f) => ({
          ...f,
          preferred_time: availableSlots.some(
            (slot) => slot.time === f.preferred_time
          )
            ? f.preferred_time
            : availableSlots[0]?.time || '',
        }))
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([])
          setForm((f) => ({
            ...f,
            preferred_time: '',
          }))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSlots(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [form.preferred_date])

  // Envoyer la demande de rendez-vous
  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setSubmitting(true)

    try {
      await api.post('/public/appointment-requests', form)

      setSubmitted(true)
    } catch (err) {
      setError(validationMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Réinitialiser le formulaire
  function resetForm() {
    setSubmitted(false)

    setForm({
      name: '',
      email: '',
      phone: '',
      preferred_date: todayStr,
      preferred_time: '',
      reason: 'Consultation générale',
      notes: '',
    })
  }

  return (
    <div className="public-shell">

      {/* Top Navigation */}
      <nav className="public-nav">

        <Link to="/" className="nav-brand">

          <div className="nav-brand-logo">
            <Stethoscope size={24} />
          </div>

          <div>
            <div style={{ lineHeight: 1.1 }}>
              {cabinet?.name || 'Cabinet Médical Atlas'}
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Prise de rendez-vous
            </div>
          </div>

        </Link>

        <div className="nav-links">

          <Link to="/">
            Retour à l'accueil
          </Link>

          <Link to="/connexion" className="btn btn-outline btn-sm">
            Espace Médecin
          </Link>

        </div>
      </nav>

      <div
        style={{
          maxWidth: 860,
          margin: '40px auto 80px',
          padding: '0 20px',
          width: '100%',
        }}
      >

        {submitted ? (

          /* Confirmation de réservation */
          <div
            className="card"
            style={{
              padding: 48,
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease',
            }}
          >

            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <span
              className="badge badge-success"
              style={{
                marginBottom: 12,
                fontSize: '0.85rem',
              }}
            >
              Demande enregistrée avec succès
            </span>

            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: 12,
              }}
            >
              Merci, {form.name} !
            </h2>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                maxWidth: 540,
                margin: '0 auto 28px',
                lineHeight: 1.6,
              }}
            >
              Votre demande de rendez-vous pour le{' '}
              <strong>{form.preferred_date}</strong> à{' '}
              <strong>
                {form.preferred_time || 'l’heure convenue'}
              </strong>{' '}
              a été transmise au cabinet. Le secrétariat médical vous
              confirmera le créneau par SMS ou e-mail.
            </p>

            <div
              style={{
                background: 'var(--bg-main)',
                borderRadius: 14,
                padding: 20,
                maxWidth: 480,
                margin: '0 auto 32px',
                textAlign: 'left',
                border: '1px solid var(--border)',
              }}
            >

              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 8,
                  color: '#0f172a',
                }}
              >
                Rappel du rendez-vous :
              </div>

              <div
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.8,
                }}
              >
                • <strong>Patient :</strong> {form.name}<br />

                • <strong>Contact :</strong> {form.phone} ({form.email})<br />

                • <strong>Motif :</strong> {form.reason}<br />

                • <strong>Lieu :</strong>{' '}
                {cabinet?.address || '12 Boulevard Zerktouni'},{' '}
                {cabinet?.city || 'Casablanca'}
              </div>

            </div>

            <div
              style={{
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
              }}
            >

              <Link to="/" className="btn btn-primary">
                Retour à l'accueil
              </Link>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Prendre un autre rendez-vous
              </button>

            </div>

          </div>

        ) : (

          /* Formulaire de réservation */
          <div
            className="card"
            style={{
              padding: '36px 40px',
            }}
          >

            <div style={{ marginBottom: 28 }}>

              <span
                className="badge badge-info"
                style={{ marginBottom: 10 }}
              >
                Réservation patient
              </span>

              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                Prendre rendez-vous avec le médecin
              </h1>

              <p
                style={{
                  color: 'var(--text-muted)',
                  marginTop: 6,
                  fontSize: '0.95rem',
                }}
              >
                Remplissez vos coordonnées et sélectionnez la date souhaitée.
                Notre cabinet traite les demandes sous 24h.
              </p>

            </div>

            {/* Message d'erreur */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: 10,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Nom et téléphone */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 20,
                }}
              >

                <div className="form-group">

                  <label className="form-label">
                    Nom et Prénom *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Ex: Sara Benali"
                    className="form-control"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label className="form-label">
                    Numéro de Téléphone *
                  </label>

                  <input
                    type="tel"
                    required
                    placeholder="Ex: 06 12 34 56 78"
                    className="form-control"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* Email et motif */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 20,
                }}
              >

                <div className="form-group">

                  <label className="form-label">
                    Adresse E-mail
                  </label>

                  <input
                    type="email"
                    placeholder="Ex: sara.benali@email.ma"
                    className="form-control"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label className="form-label">
                    Motif de consultation *
                  </label>

                  <select
                    className="form-control form-select"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reason: e.target.value,
                      })
                    }
                  >

                    <option value="Consultation générale">
                      Consultation de médecine générale
                    </option>

                    <option value="Renouvellement d’ordonnance">
                      Renouvellement d’ordonnance
                    </option>

                    <option value="Certificat médical / Aptitude">
                      Certificat médical / Aptitude sportive
                    </option>

                    <option value="Suivi maladie chronique">
                      Suivi maladie chronique (HTA, Diabète)
                    </option>

                    <option value="Bilan de santé préventif">
                      Bilan de santé préventif
                    </option>

                    <option value="Autre motif">
                      Autre motif de santé
                    </option>

                  </select>

                </div>

              </div>

              {/* Date et créneaux horaires */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 20,
                }}
              >

                <div className="form-group">

                  <label className="form-label">
                    Date souhaitée *
                  </label>

                  <input
                    type="date"
                    required
                    min={todayStr}
                    className="form-control"
                    value={form.preferred_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        preferred_date: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="form-group">

                  <label className="form-label">

                    Créneau horaire disponible *

                    {loadingSlots && (
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--primary)',
                        }}
                      >
                        {' '}(chargement...)
                      </span>
                    )}

                  </label>

                  {slots.length > 0 ? (

                    <select
                      className="form-control form-select"
                      required
                      value={form.preferred_time}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferred_time: e.target.value,
                        })
                      }
                      disabled={loadingSlots}
                    >

                      {slots.map((slot) => (

                        <option
                          key={slot.time}
                          value={slot.time}
                        >
                          {slot.time}
                        </option>

                      ))}

                    </select>

                  ) : (

                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        fontSize: '0.88rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {loadingSlots
                        ? 'Vérification des disponibilités…'
                        : 'Aucun créneau libre pour ce jour. Choisissez une autre date.'}
                    </div>

                  )}

                </div>

              </div>

              {/* Notes et symptômes */}
              <div className="form-group">

                <label className="form-label">
                  Précisions ou symptômes (facultatif)
                </label>

                <textarea
                  rows={3}
                  placeholder="Décrivez brièvement la raison de votre visite si nécessaire..."
                  className="form-control"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes: e.target.value,
                    })
                  }
                />

              </div>

              {/* Boutons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 28,
                  paddingTop: 20,
                  borderTop: '1px solid var(--border)',
                }}
              >

                <Link to="/" className="btn btn-ghost">
                  Annuler
                </Link>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingSlots ||
                    slots.length === 0 ||
                    !form.preferred_time
                  }
                  className="btn btn-primary btn-lg"
                >
                  {submitting
                    ? 'Transmission en cours…'
                    : 'Envoyer la demande de rendez-vous'}
                </button>

              </div>

            </form>

          </div>

        )}

      </div>

    </div>
  )
}
