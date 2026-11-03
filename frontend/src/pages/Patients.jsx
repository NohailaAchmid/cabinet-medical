import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  Trash2,
  FileText,
  AlertCircle,
  Eye,
  Filter,
} from '../components/Icons'

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth_date: '',
  gender: 'M',
  blood_type: '',
  address: '',
  city: 'Casablanca',
  medical_history: '',
  allergies: '',
}

export default function Patients() {
  const { addToast } = useToast()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [bloodFilter, setBloodFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function loadPatients() {
    setLoading(true)
    api.get(`/patients?search=${encodeURIComponent(search)}`)
      .then((res) => {
        setPatients(res.data.data || res.data || [])
      })
      .catch(() => addToast('Erreur lors du chargement des patients', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadPatients()
    }, 250)
    return () => clearTimeout(delayDebounce)
  }, [search])

  function handleOpenCreate() {
    setEditingPatient(null)
    setForm(initialForm)
    setFormError('')
    setOpenModal(true)
  }

  function handleOpenEdit(patient) {
    setEditingPatient(patient)
    setForm({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      birth_date: patient.birth_date || '',
      gender: patient.gender || 'M',
      blood_type: patient.blood_type || '',
      address: patient.address || '',
      city: patient.city || 'Casablanca',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
    })
    setFormError('')
    setOpenModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, form)
        addToast('Dossier patient mis à jour avec succès', 'success')
      } else {
        await api.post('/patients', form)
        addToast('Nouveau patient ajouté avec succès', 'success')
      }
      setOpenModal(false)
      loadPatients()
    } catch (err) {
      setFormError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(patient) {
    if (
      !window.confirm(
        `Confirmez-vous la suppression du dossier de ${patient.first_name} ${patient.last_name} ?`
      )
    )
      return

    try {
      await api.delete(`/patients/${patient.id}`)
      addToast('Patient supprimé.', 'info')
      loadPatients()
    } catch {
      addToast('Erreur lors de la suppression.', 'error')
    }
  }

  const filteredPatients = patients.filter((p) => {
    if (!bloodFilter) return true
    return p.blood_type === bloodFilter
  })

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: 6 }}>
            Dossiers Médicaux
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Gestion des Patients
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Répertoire médical, antécédents et consultations archivées.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Nouveau Patient
        </button>
      </div>

      {/* Search and filters bar */}
      <div className="card" style={{ marginBottom: 24, padding: 18 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <div
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, téléphone, e-mail..."
              className="form-control"
              style={{ paddingLeft: 40 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Groupe sanguin :
            </span>
            <select
              className="form-control form-select"
              style={{ width: 140 }}
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Sexe / Âge</th>
                <th>Groupe</th>
                <th>Téléphone & E-mail</th>
                <th>Ville</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <Link
                      to={`/app/patients/${patient.id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: patient.gender === 'F' ? '#fce7f3' : '#e0f2fe',
                          color: patient.gender === 'F' ? '#db2777' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {patient.first_name[0]}
                        {patient.last_name[0]}
                      </div>
                      <div>
                        <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                          {patient.last_name?.toUpperCase()} {patient.first_name}
                        </strong>
                        {patient.allergies && (
                          <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                            ⚠ Allergie : {patient.allergies}
                          </div>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: '0.78rem' }}>
                      {patient.gender === 'F' ? 'Femme' : 'Homme'}
                    </span>
                    {patient.birth_date && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {patient.birth_date}
                      </div>
                    )}
                  </td>
                  <td>
                    {patient.blood_type ? (
                      <span className="badge badge-danger">{patient.blood_type}</span>
                    ) : (
                      <span style={{ color: 'var(--text-light)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{patient.phone || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {patient.email || ''}
                    </div>
                  </td>
                  <td>{patient.city || 'Casablanca'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <Link
                        to={`/app/patients/${patient.id}`}
                        className="btn btn-outline btn-sm"
                        title="Ouvrir le dossier médical"
                      >
                        <Eye size={15} /> Dossier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(patient)}
                        className="btn btn-secondary btn-sm"
                        title="Modifier les coordonnées"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(patient)}
                        className="btn btn-danger btn-sm"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPatients.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Aucun patient trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Patient */}
      {openModal && (
        <Modal
          title={editingPatient ? 'Modifier les informations du patient' : 'Créer un nouveau dossier patient'}
          onClose={() => setOpenModal(false)}
          maxWidth="700px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenModal(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                form="patientForm"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer le dossier'}
              </button>
            </>
          }
        >
          {formError && (
            <div
              style={{
                padding: '10px 14px',
                background: '#fee2e2',
                color: '#b91c1c',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: '0.88rem',
              }}
            >
              {formError}
            </div>
          )}

          <form id="patientForm" onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nom de famille" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Ex: Benali"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </Field>

              <Field label="Prénom" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Ex: Sara"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Field label="Genre">
                <select
                  className="form-control form-select"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="M">Masculin (M)</option>
                  <option value="F">Féminin (F)</option>
                </select>
              </Field>

              <Field label="Date de naissance">
                <input
                  type="date"
                  className="form-control"
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                />
              </Field>

              <Field label="Groupe sanguin">
                <select
                  className="form-control form-select"
                  value={form.blood_type}
                  onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
                >
                  <option value="">Non déterminé</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Numéro de téléphone">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ex: 06 12 34 56 78"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>

              <Field label="Adresse e-mail">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Ex: patient@domaine.ma"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <Field label="Adresse du domicile">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: 45 Rue des Lilas"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Field>

              <Field label="Ville">
                <input
                  type="text"
                  className="form-control"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Allergies connues">
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Pénicilline, Aspirine, Pollens..."
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              />
            </Field>

            <Field label="Antécédents médicaux / chirurgicaux">
              <textarea
                rows={2}
                className="form-control"
                placeholder="Ex: Diabète type 2, Appendicectomie en 2018..."
                value={form.medical_history}
                onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  )
}
