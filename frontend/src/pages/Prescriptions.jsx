import { useEffect, useState } from 'react'
import api, { downloadPdf, validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import DocumentPreviewModal from '../components/DocumentPreviewModal'
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  Eye,
  Search,
  Pill,
  Check,
} from '../components/Icons'

const emptyItem = {
  medication_id: '',
  medication_name: '',
  dosage: '',
  posology: '1 comprimé 3 fois par jour après les repas',
  duration: '7 jours',
  quantity: '1 boîte',
}

export default function Prescriptions() {
  const { addToast } = useToast()
  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [medications, setMedications] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Creation modal
  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    patient_id: '',
    prescribed_at: new Date().toISOString().slice(0, 10),
    notes: 'Boire abondamment d’eau. Revenir en consultation si persistance de la fièvre après 48 heures.',
    items: [{ ...emptyItem }],
  })

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState(null)

  function loadPrescriptions() {
    setLoading(true)
    api.get('/prescriptions')
      .then((res) => setPrescriptions(res.data))
      .catch(() => addToast('Erreur lors du chargement des ordonnances', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPrescriptions()
    api.get('/patients').then((res) => setPatients(res.data.data || res.data || [])).catch(() => {})
    api.get('/medications').then((res) => setMedications(res.data)).catch(() => {})
  }, [])

  function handleOpenCreate() {
    setFormError('')
    setForm({
      patient_id: patients[0]?.id || '',
      prescribed_at: new Date().toISOString().slice(0, 10),
      notes: 'Boire abondamment d’eau. Revenir en consultation si persistance des symptômes.',
      items: [{ ...emptyItem }],
    })
    setOpenModal(true)
  }

  function handleItemChange(index, field, value) {
    const next = [...form.items]
    next[index] = { ...next[index], [field]: value }

    if (field === 'medication_id') {
      const found = medications.find((m) => String(m.id) === String(value))
      if (found) {
        next[index].medication_name = found.name
        next[index].dosage = found.dosage || next[index].dosage
        if (found.default_posology) {
          next[index].posology = found.default_posology
        }
      }
    }
    setForm({ ...form, items: next })
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { ...emptyItem }] })
  }

  function removeItem(index) {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')

    if (!form.patient_id) {
      setFormError('Veuillez sélectionner un patient.')
      return
    }

    if (form.items.some((i) => !i.medication_name.trim())) {
      setFormError('Veuillez spécifier le nom pour chaque médicament prescrit.')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/prescriptions', form)
      addToast('Ordonnance créée avec succès !', 'success')
      setOpenModal(false)
      loadPrescriptions()
      
      // Auto open preview modal
      const patient = patients.find((p) => String(p.id) === String(form.patient_id))
      setPreviewDoc({ ...res.data, patient })
    } catch (err) {
      setFormError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Confirmez-vous la suppression de cette ordonnance ?')) return
    try {
      await api.delete(`/prescriptions/${id}`)
      addToast('Ordonnance supprimée.', 'info')
      loadPrescriptions()
    } catch {
      addToast('Erreur lors de la suppression.', 'error')
    }
  }

  const filtered = prescriptions.filter((p) => {
    if (!search) return true
    const term = search.toLowerCase()
    const pName = `${p.patient?.last_name || ''} ${p.patient?.first_name || ''}`.toLowerCase()
    const meds = (p.items || []).map((i) => i.medication_name).join(' ').toLowerCase()
    return pName.includes(term) || meds.includes(term) || (p.prescribed_at && p.prescribed_at.includes(term))
  })

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: 6 }}>
            Prescriptions Numériques
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Gestion des Ordonnances
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Création d'ordonnances sécurisées avec posologie, durée, impression et export PDF officiel.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Nouvelle Ordonnance
        </button>
      </div>

      {/* Search filter */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 460 }}>
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
            placeholder="Rechercher par patient, médicament prescrit ou date..."
            className="form-control"
            style={{ paddingLeft: 40 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Médicaments prescrits</th>
                <th>Conseils & Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.prescribed_at?.slice(0, 10)}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {p.patient?.last_name?.toUpperCase()} {p.patient?.first_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.patient?.phone || 'Sans tel'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {(p.items || []).map((it, i) => (
                        <div key={i} style={{ fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600, color: '#0369a1' }}>• {it.medication_name}</span>{' '}
                          {it.dosage && <span>({it.dosage})</span>}
                          {it.posology && <span style={{ color: 'var(--text-muted)' }}>: {it.posology}</span>}
                          {it.duration && <strong style={{ color: '#059669', marginLeft: 4 }}>[{it.duration}]</strong>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 200 }}>
                    {p.notes || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Aperçu & Impression directe"
                        onClick={() => setPreviewDoc(p)}
                      >
                        <Eye size={14} /> Aperçu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Télécharger le fichier PDF officiel"
                        onClick={() => downloadPdf(`/prescriptions/${p.id}/pdf`, `ordonnance-${p.patient?.last_name}-${p.id}.pdf`)}
                      >
                        <Download size={14} /> PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Supprimer"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Aucune ordonnance trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Prescription */}
      {openModal && (
        <Modal
          title="Rédiger une Ordonnance Médicale"
          onClose={() => setOpenModal(false)}
          maxWidth="840px"
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
                form="prescriptionForm"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Création en cours…' : 'Générer l’ordonnance'}
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

          <form id="prescriptionForm" onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
              <Field label="Sélectionner le patient" required>
                <select
                  className="form-control form-select"
                  required
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                >
                  <option value="">-- Choisir un patient --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.last_name?.toUpperCase()} {pat.first_name} ({pat.birth_date || 'Né(e) ?'})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date de prescription" required>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={form.prescribed_at}
                  onChange={(e) => setForm({ ...form, prescribed_at: e.target.value })}
                />
              </Field>
            </div>

            {/* Prescribed Medications */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                  Médicaments prescrits ({form.items.length})
                </strong>
                <button
                  type="button"
                  onClick={addItem}
                  className="btn btn-outline btn-sm"
                  style={{ gap: 6 }}
                >
                  <Plus size={14} /> Ajouter un médicament
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className="badge badge-info" style={{ fontWeight: 700 }}>
                        Médicament #{idx + 1}
                      </span>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', padding: 4 }}
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 size={16} /> Supprimer
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 12 }}>
                      <Field label="Base de médicaments (Sélection rapide)">
                        <select
                          className="form-control form-select"
                          value={item.medication_id}
                          onChange={(e) => handleItemChange(idx, 'medication_id', e.target.value)}
                        >
                          <option value="">-- Choisir ou saisir ci-contre --</option>
                          {medications.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.dosage || m.form})
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Nom du médicament" required>
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="Ex: Paracétamol, Amoxicilline..."
                          value={item.medication_name}
                          onChange={(e) => handleItemChange(idx, 'medication_name', e.target.value)}
                        />
                      </Field>

                      <Field label="Dosage">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: 1000 mg, 500 mg"
                          value={item.dosage}
                          onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                      <Field label="Posologie détaillée">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: 1 comprimé 3 fois par jour après les repas"
                          value={item.posology}
                          onChange={(e) => handleItemChange(idx, 'posology', e.target.value)}
                        />
                      </Field>

                      <Field label="Durée">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: 7 jours, 1 mois"
                          value={item.duration}
                          onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                        />
                      </Field>

                      <Field label="Quantité">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: 1 boîte, 2 flacons"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <Field label="Recommandations & Consignes particulières pour le patient">
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="Conseils hygiéno-diététiques, surveillance, contre-indications..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </div>
          </form>
        </Modal>
      )}

      {/* Document live preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          type="prescription"
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
