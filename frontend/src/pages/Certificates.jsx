import { useEffect, useState } from 'react'
import api, { downloadPdf, validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import DocumentPreviewModal from '../components/DocumentPreviewModal'
import {
  ClipboardList,
  Plus,
  Trash2,
  Printer,
  Download,
  Eye,
  Search,
  Check,
} from '../components/Icons'

const certificateTemplates = {
  aptitude: {
    title: "CERTIFICAT MÉDICAL D'APTITUDE",
    content: "L'examen clinique de ce jour ne révèle aucune contre-indication apparente à la pratique des activités physiques et sportives.",
    days_off: 0,
  },
  repos: {
    title: "CERTIFICAT MÉDICAL DE REPOS (ARRÊT DE TRAVAIL)",
    content: "L'état de santé du patient nécessite un arrêt de travail et un repos strict à domicile avec sortie autorisée.",
    days_off: 3,
  },
  presence: {
    title: "ATTESTATION DE PRÉSENCE AU CABINET",
    content: "Le/la patient(e) s'est présenté(e) ce jour à notre cabinet médical pour des soins et examens nécessitant sa présence.",
    days_off: 0,
  },
  consultation: {
    title: "ATTESTATION DE CONSULTATION MÉDICALE",
    content: "Je certifie avoir examiné ce jour le/la patient(e) susnommé(e) dans le cadre d'une consultation médicale.",
    days_off: 0,
  },
}

export default function Certificates() {
  const { addToast } = useToast()
  const [certificates, setCertificates] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Creation modal
  const [openModal, setOpenModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const todayStr = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    patient_id: '',
    type: 'repos',
    title: certificateTemplates.repos.title,
    content: certificateTemplates.repos.content,
    days_off: 3,
    start_date: todayStr,
    end_date: todayStr,
    issued_at: todayStr,
  })

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState(null)

  function loadCertificates() {
    setLoading(true)
    api.get('/certificates')
      .then((res) => setCertificates(res.data))
      .catch(() => addToast('Erreur lors du chargement des attestations', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCertificates()
    api.get('/patients').then((res) => setPatients(res.data.data || res.data || [])).catch(() => {})
  }, [])

  function handleTypeChange(selectedType) {
    const tmpl = certificateTemplates[selectedType] || certificateTemplates.repos
    setForm({
      ...form,
      type: selectedType,
      title: tmpl.title,
      content: tmpl.content,
      days_off: tmpl.days_off,
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    if (!form.patient_id) {
      setFormError('Veuillez sélectionner un patient.')
      return
    }

    setSaving(true)
    try {
      const res = await api.post('/certificates', form)
      addToast('Document médical généré avec succès !', 'success')
      setOpenModal(false)
      loadCertificates()

      const patient = patients.find((p) => String(p.id) === String(form.patient_id))
      setPreviewDoc({ ...res.data, patient })
    } catch (err) {
      setFormError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Confirmez-vous la suppression de ce document ?')) return
    try {
      await api.delete(`/certificates/${id}`)
      addToast('Document supprimé.', 'info')
      loadCertificates()
    } catch {
      addToast('Erreur lors de la suppression.', 'error')
    }
  }

  const filtered = certificates.filter((c) => {
    if (!search) return true
    const term = search.toLowerCase()
    const pName = `${c.patient?.last_name || ''} ${c.patient?.first_name || ''}`.toLowerCase()
    return pName.includes(term) || (c.title && c.title.toLowerCase().includes(term))
  })

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: 6 }}>
            Documents Administratifs
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Attestations & Certificats Médicaux
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Certificats d'aptitude, arrêts de travail avec repos, attestations de présence et de consultation.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormError('')
            setForm({
              patient_id: patients[0]?.id || '',
              type: 'repos',
              title: certificateTemplates.repos.title,
              content: certificateTemplates.repos.content,
              days_off: 3,
              start_date: todayStr,
              end_date: todayStr,
              issued_at: todayStr,
            })
            setOpenModal(true)
          }}
        >
          <Plus size={18} /> Générer un Certificat
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
            placeholder="Rechercher par patient ou intitulé..."
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
                <th>Type de document</th>
                <th>Observations / Repos</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <strong>{cert.issued_at?.slice(0, 10)}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {cert.patient?.last_name?.toUpperCase()} {cert.patient?.first_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {cert.patient?.phone || 'Sans tel'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ fontWeight: 600 }}>
                      {cert.title || 'Certificat médical'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.88rem', color: '#334155', maxWidth: 360 }}>
                      {cert.content}
                    </div>
                    {cert.days_off > 0 && (
                      <div style={{ color: '#059669', fontWeight: 700, fontSize: '0.8rem', marginTop: 4 }}>
                        Durée du repos : {cert.days_off} jour(s)
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Aperçu & Impression directe"
                        onClick={() => setPreviewDoc(cert)}
                      >
                        <Eye size={14} /> Aperçu
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Télécharger PDF"
                        onClick={() => downloadPdf(`/certificates/${cert.id}/pdf`, `certificat-${cert.patient?.last_name}-${cert.id}.pdf`)}
                      >
                        <Download size={14} /> PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Supprimer"
                        onClick={() => handleDelete(cert.id)}
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
                    Aucune attestation ou certificat délivré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Certificate */}
      {openModal && (
        <Modal
          title="Générer un Certificat ou Attestation Médicale"
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
                form="certForm"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Génération…' : 'Créer & Imprimer le document'}
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

          <form id="certForm" onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
              <Field label="Patient concerné" required>
                <select
                  className="form-control form-select"
                  required
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                >
                  <option value="">-- Sélectionner le patient --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.last_name?.toUpperCase()} {pat.first_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date de délivrance" required>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={form.issued_at}
                  onChange={(e) => setForm({ ...form, issued_at: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Modèle de document médical">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { key: 'repos', label: 'Repos / Arrêt de travail' },
                  { key: 'aptitude', label: "Certificat d'Aptitude sportive" },
                  { key: 'presence', label: 'Attestation de Présence' },
                  { key: 'consultation', label: 'Attestation de Consultation' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTypeChange(item.key)}
                    className={`btn btn-sm ${form.type === item.key ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textAlign: 'center', justifyContent: 'center' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Titre officiel du document" required>
              <input
                type="text"
                required
                className="form-control"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>

            {form.type === 'repos' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
                <Field label="Nombre de jours de repos">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="form-control"
                    value={form.days_off}
                    onChange={(e) => setForm({ ...form, days_off: parseInt(e.target.value) || 0 })}
                  />
                </Field>

                <Field label="À compter du">
                  <input
                    type="date"
                    className="form-control"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </Field>

                <Field label="Jusqu'au (inclus)">
                  <input
                    type="date"
                    className="form-control"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </Field>
              </div>
            )}

            <Field label="Constatations médicales / Texte du certificat" required>
              <textarea
                rows={4}
                required
                className="form-control"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Field>
          </form>
        </Modal>
      )}

      {/* Document live preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          type="certificate"
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
