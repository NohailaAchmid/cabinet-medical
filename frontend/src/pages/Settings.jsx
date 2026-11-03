import { useEffect, useState } from 'react'
import api, { validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import { Field } from '../components/Modal'
import {
  SettingsIcon,
  Download,
  UploadCloud,
  Check,
  Stethoscope,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from '../components/Icons'

const weekdays = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
]

export default function Settings() {
  const { addToast } = useToast()
  const [cabinet, setCabinet] = useState(null)
  const [availabilities, setAvailabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    doctor_name: '',
    specialty: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    location_text: '',
    about: '',
    opening_hours: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  function loadData() {
    setLoading(true)
    Promise.all([api.get('/cabinet'), api.get('/availabilities')])
      .then(([cabRes, avRes]) => {
        setCabinet(cabRes.data)
        setForm({
          name: cabRes.data.name || '',
          doctor_name: cabRes.data.doctor_name || '',
          specialty: cabRes.data.specialty || '',
          phone: cabRes.data.phone || '',
          email: cabRes.data.email || '',
          address: cabRes.data.address || '',
          city: cabRes.data.city || '',
          postal_code: cabRes.data.postal_code || '',
          location_text: cabRes.data.location_text || '',
          about: cabRes.data.about || '',
          opening_hours: cabRes.data.opening_hours || '',
        })
        setLogoPreview(cabRes.data.logo_url)
        setAvailabilities(avRes.data)
      })
      .catch(() => addToast('Erreur lors du chargement des paramètres', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSaveCabinet(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        data.append(k, v || '')
      })
      if (logoFile) {
        data.append('logo', logoFile)
      }

      await api.post('/cabinet', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      addToast('Informations du cabinet mises à jour avec succès !', 'success')
      loadData()
    } catch (err) {
      setError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleBackup() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:8000/api/backup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error('Erreur de sauvegarde')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sauvegarde-cabinet-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      addToast('Sauvegarde JSON générée et téléchargée !', 'success')
    } catch {
      addToast('Erreur lors du téléchargement de la sauvegarde', 'error')
    }
  }

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Chargement des configurations…</div>
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: 6 }}>
            Paramètres & Identité
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Configuration du Cabinet Médical
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Personnalisez vos documents officiels, coordonnées, logo et effectuez vos sauvegardes de données.
          </p>
        </div>

        <button type="button" className="btn btn-outline" onClick={handleBackup}>
          <Download size={16} /> Exporter la Sauvegarde JSON
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 10,
            marginBottom: 20,
            fontSize: '0.88rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* Main form */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 20 }}>
            Informations Générales & En-tête
          </h3>

          <form onSubmit={handleSaveCabinet}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nom du Cabinet Médical" required>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cabinet Médical Santé & Soins"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>

              <Field label="Nom et Titre du Médecin" required>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Médecin Traitant"
                  className="form-control"
                  value={form.doctor_name}
                  onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Spécialité Médicale" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                />
              </Field>

              <Field label="Téléphone professionnel" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              <Field label="Adresse e-mail">
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>

              <Field label="Quartier / Repère de localisation">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Maârif, Centre-ville"
                  value={form.location_text}
                  onChange={(e) => setForm({ ...form, location_text: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
              <Field label="Adresse physique" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Field>

              <Field label="Ville" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>

              <Field label="Code postal">
                <input
                  type="text"
                  className="form-control"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Texte de présentation / À propos">
              <textarea
                rows={3}
                className="form-control"
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
              />
            </Field>

            <Field label="Horaires d'ouverture affichés">
              <textarea
                rows={3}
                className="form-control"
                placeholder="Lundi – Vendredi : 09h00–13h00 / 15h00–19h00..."
                value={form.opening_hours}
                onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
              />
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Logo and Backup column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Logo Card */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 14 }}>
              Logo du Cabinet
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Ce logo apparaîtra en haut de vos ordonnances et certificats médicaux imprimés.
            </p>

            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 16,
                border: '2px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                overflow: 'hidden',
                margin: '0 auto 20px',
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: 10 }}>
                  <UploadCloud size={32} />
                  <div style={{ fontSize: '0.75rem', marginTop: 6 }}>Aucun logo</div>
                </div>
              )}
            </div>

            <label className="btn btn-outline" style={{ width: '100%', cursor: 'pointer' }}>
              <UploadCloud size={16} /> Choisir un logo (PNG / JPG)
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoChange}
              />
            </label>
          </div>

          {/* Backup & Security Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                Sauvegarde & Données
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
              Exportez à tout moment l'intégralité de vos dossiers patients, consultations, ordonnances et rendez-vous au format JSON normalisé.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={handleBackup}
            >
              <Download size={16} /> Télécharger la sauvegarde JSON
            </button>
          </div>

          {/* Weekly consultation slots */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Clock size={18} color="var(--primary)" />
              <h3 className="card-title" style={{ fontSize: '1.05rem', margin: 0 }}>
                Disponibilités hebdomadaires
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
              {availabilities.map((av) => (
                <div
                  key={av.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                  }}
                >
                  <strong>{weekdays[av.weekday]}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {av.start_time?.slice(0, 5)} - {av.end_time?.slice(0, 5)}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    {av.slot_minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
