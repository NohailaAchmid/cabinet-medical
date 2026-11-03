import { useEffect, useState } from 'react'
import api, { downloadPdf, validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import DocumentPreviewModal from '../components/DocumentPreviewModal'
import {
  RadioIcon,
  Plus,
  Trash2,
  Printer,
  Download,
  Eye,
  Search,
  AlertCircle,
} from '../components/Icons'

const examTypes = [
  'Radiographie standard',
  'Échographie abdomino-pelvienne',
  'Échographie thyroïdienne',
  'Écho-Doppler veineux / artériel',
  'Scanner (TDM) avec injection',
  'Scanner (TDM) sans injection',
  'IRM (Imagerie par Résonance Magnétique)',
  'Mammographie bilatérale',
  'Ostéodensitométrie',
]

const regions = [
  'Thorax / Poumons',
  'Abdomen & Pelvis',
  'Rachis cervical',
  'Rachis lombaire & Sacrum',
  'Genou (Face et profil)',
  'Épaule',
  'Crâne & Cerveau',
  'Membres inférieurs',
  'Cou & Thyroïde',
  'Bassin & Hanches',
]

export default function Radiology() {
  const { addToast } = useToast()
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Creation modal
  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    patient_id: '',
    exam_type: 'Radiographie standard',
    region: 'Thorax / Poumons',
    clinical_indication: 'Suspicion d’infection pulmonaire, toux fébrile persistante.',
    urgent: false,
  })

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState(null)

  function loadRequests() {
    setLoading(true)
    api.get('/radiology-requests')
      .then((res) => setRequests(res.data))
      .catch(() => addToast('Erreur lors du chargement des demandes radio', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
    api.get('/patients').then((res) => setPatients(res.data.data || res.data || [])).catch(() => {})
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    if (!form.patient_id) {
      setFormError('Veuillez sélectionner un patient.')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/radiology-requests', form)
      addToast('Demande d’examen radiologique créée avec succès !', 'success')
      setOpenModal(false)
      loadRequests()

      const patient = patients.find((p) => String(p.id) === String(form.patient_id))
      setPreviewDoc({ ...res.data, patient })
    } catch (err) {
      setFormError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Confirmez-vous la suppression de cette demande d’examen ?')) return
    try {
      await api.delete(`/radiology-requests/${id}`)
      addToast('Demande supprimée.', 'info')
      loadRequests()
    } catch {
      addToast('Erreur lors de la suppression.', 'error')
    }
  }

  const filtered = requests.filter((r) => {
    if (!search) return true
    const term = search.toLowerCase()
    const pName = `${r.patient?.last_name || ''} ${r.patient?.first_name || ''}`.toLowerCase()
    return pName.includes(term) || r.exam_type.toLowerCase().includes(term) || (r.region && r.region.toLowerCase().includes(term))
  })

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: 6 }}>
            Imagerie Médicale
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Demandes d’Examens Radiologiques
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Création de bons d'imagerie (Radio, Écho, Scanner, IRM) avec indication clinique et export PDF.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormError('')
            setForm({
              patient_id: patients[0]?.id || '',
              exam_type: 'Radiographie standard',
              region: 'Thorax / Poumons',
              clinical_indication: 'Bilan clinique et radiologique.',
              urgent: false,
            })
            setOpenModal(true)
          }}
        >
          <Plus size={18} /> Nouvelle Demande d'Examen
        </button>
      </div>

      {/* Search */}
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
            placeholder="Rechercher par patient, examen ou région..."
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
                <th>Type d'examen</th>
                <th>Région explorée</th>
                <th>Renseignements cliniques</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.created_at?.slice(0, 10)}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {r.patient?.last_name?.toUpperCase()} {r.patient?.first_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.patient?.phone || 'Sans tel'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-info">{r.exam_type}</span>
                      {r.urgent && <span className="badge badge-danger">Urgent</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{r.region || '—'}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 280 }}>
                    {r.clinical_indication}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Aperçu & Impression directe"
                        onClick={() => setPreviewDoc(r)}
                      >
                        <Eye size={14} /> Aperçu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Télécharger PDF"
                        onClick={() => downloadPdf(`/radiology-requests/${r.id}/pdf`, `radio-${r.patient?.last_name}-${r.id}.pdf`)}
                      >
                        <Download size={14} /> PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Supprimer"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Aucune demande d'examen radiologique enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Radiology Request */}
      {openModal && (
        <Modal
          title="Prescrire un Examen Radiologique"
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
                form="radioForm"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Création…' : 'Générer la demande'}
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

          <form id="radioForm" onSubmit={handleSave}>
            <Field label="Patient concerné" required>
              <select
                className="form-control form-select"
                required
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
              >
                <option value="">-- Choisir un patient --</option>
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.last_name?.toUpperCase()} {pat.first_name}
                  </option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              <Field label="Type d'examen" required>
                <select
                  className="form-control form-select"
                  value={form.exam_type}
                  onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
                >
                  {examTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Région anatomique explorée">
                <input
                  type="text"
                  list="regionsList"
                  className="form-control"
                  placeholder="Ex: Thorax, Abdomen..."
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
                <datalist id="regionsList">
                  {regions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </Field>
            </div>

            <Field label="Indication clinique & Renseignements médicaux" required>
              <textarea
                rows={3}
                required
                className="form-control"
                placeholder="Ex: Lombalgies chroniques rebelles, toux persistante fébrile, suspicion de fracture..."
                value={form.clinical_indication}
                onChange={(e) => setForm({ ...form, clinical_indication: e.target.value })}
              />
            </Field>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18, accentColor: 'var(--danger)' }}
                  checked={form.urgent}
                  onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                />
                <span style={{ fontWeight: 600, color: form.urgent ? 'var(--danger)' : '#334155', fontSize: '0.9rem' }}>
                  Marquer cet examen comme « URGENT »
                </span>
              </label>
            </div>
          </form>
        </Modal>
      )}

      {/* Document live preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          type="radiology"
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
