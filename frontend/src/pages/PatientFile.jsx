import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api, { downloadPdf, validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import DocumentPreviewModal from '../components/DocumentPreviewModal'
import {
  Users,
  Activity,
  Calendar,
  FileText,
  ClipboardList,
  RadioIcon,
  Plus,
  Printer,
  Download,
  Eye,
  Trash2,
  Clock,
  Heart,
  ChevronRight,
  AlertCircle,
} from '../components/Icons'

export default function PatientFile() {
  const { id } = useParams()
  const { addToast } = useToast()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('consultations')

  // Modals
  const [openConsultModal, setOpenConsultModal] = useState(false)
  const [consultForm, setConsultForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    reason: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    blood_pressure: '',
    weight: '',
    temperature: '',
    notes: '',
  })
  const [consultSaving, setConsultSaving] = useState(false)
  const [consultError, setConsultError] = useState('')

  // Preview modal
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewType, setPreviewType] = useState('prescription')

  function loadPatient() {
    setLoading(true)
    api.get(`/patients/${id}`)
      .then((res) => setPatient(res.data))
      .catch(() => addToast('Erreur lors du chargement du dossier patient', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPatient()
  }, [id])

  async function handleSaveConsultation(e) {
    e.preventDefault()
    setConsultError('')
    setConsultSaving(true)
    try {
      await api.post(`/patients/${id}/consultations`, consultForm)
      addToast('Nouvelle consultation enregistrée dans le dossier', 'success')
      setOpenConsultModal(false)
      setConsultForm({
        date: new Date().toISOString().slice(0, 10),
        reason: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        blood_pressure: '',
        weight: '',
        temperature: '',
        notes: '',
      })
      loadPatient()
    } catch (err) {
      setConsultError(validationMessage(err))
    } finally {
      setConsultSaving(false)
    }
  }

  async function handleDeleteConsultation(consultId) {
    if (!window.confirm('Confirmez-vous la suppression de cette consultation ?')) return
    try {
      await api.delete(`/consultations/${consultId}`)
      addToast('Consultation supprimée', 'info')
      loadPatient()
    } catch {
      addToast('Erreur lors de la suppression', 'error')
    }
  }

  if (loading || !patient) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Chargement du dossier médical…
      </div>
    )
  }

  const consultations = patient.consultations || []
  const prescriptions = patient.prescriptions || []
  const certificates = patient.certificates || []
  const radiologyRequests = patient.radiology_requests || []

  return (
    <div>
      {/* Back button and breadcrumb */}
      <div style={{ marginBottom: 16 }}>
        <Link to="/app/patients" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 600 }}>
          ← Retour à la liste des patients
        </Link>
      </div>

      {/* Patient Header Card */}
      <div className="card" style={{ marginBottom: 24, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: patient.gender === 'F' ? 'linear-gradient(135deg, #fce7f3, #fbcfe8)' : 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                color: patient.gender === 'F' ? '#db2777' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.4rem',
              }}
            >
              {patient.first_name[0]}
              {patient.last_name[0]}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                  {patient.last_name?.toUpperCase()} {patient.first_name}
                </h1>
                {patient.blood_type && (
                  <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                    Groupe {patient.blood_type}
                  </span>
                )}
                <span className="badge badge-secondary">
                  {patient.gender === 'F' ? 'Femme' : 'Homme'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 18, color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6, flexWrap: 'wrap' }}>
                {patient.birth_date && <span>🎂 Né(e) le {patient.birth_date}</span>}
                {patient.phone && <span>📞 {patient.phone}</span>}
                {patient.email && <span>✉ {patient.email}</span>}
                <span>📍 {patient.city || 'Casablanca'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setOpenConsultModal(true)}
            >
              <Plus size={16} /> Nouvelle Consultation
            </button>
          </div>
        </div>

        {/* Allergies & Medical History alerts */}
        {(patient.allergies || patient.medical_history) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            {patient.allergies && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: '#991b1b' }}>
                <strong>⚠ Allergies signalées :</strong> {patient.allergies}
              </div>
            )}
            {patient.medical_history && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: '#334155' }}>
                <strong>Antécédents :</strong> {patient.medical_history}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {[
          { id: 'consultations', label: `Consultations (${consultations.length})`, icon: Activity },
          { id: 'prescriptions', label: `Ordonnances (${prescriptions.length})`, icon: FileText },
          { id: 'certificates', label: `Certificats (${certificates.length})`, icon: ClipboardList },
          { id: 'radiology', label: `Examens Radio (${radiologyRequests.length})`, icon: RadioIcon },
        ].map((tab) => {
          const IconC = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                border: 'none',
                background: 'transparent',
                fontSize: '0.92rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <IconC size={18} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Consultations */}
      {activeTab === 'consultations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {consultations.map((c) => (
            <div key={c.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="badge badge-info" style={{ fontWeight: 700 }}>
                      📅 {c.date}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {c.reason || 'Consultation de routine'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteConsultation(c.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
                  title="Supprimer la consultation"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Constant vitals */}
              {(c.blood_pressure || c.weight || c.temperature) && (
                <div style={{ display: 'flex', gap: 20, background: '#f8fafc', padding: '12px 18px', borderRadius: 10, marginBottom: 16, fontSize: '0.88rem', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  {c.blood_pressure && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={16} color="#2563eb" />
                      <span style={{ color: 'var(--text-muted)' }}>Tension : </span>
                      <strong style={{ color: '#2563eb' }}>{c.blood_pressure} mmHg</strong>
                    </div>
                  )}
                  {c.weight && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={16} color="#059669" />
                      <span style={{ color: 'var(--text-muted)' }}>Poids : </span>
                      <strong style={{ color: '#059669' }}>{c.weight} kg</strong>
                    </div>
                  )}
                  {c.temperature && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#d97706', fontWeight: 800 }}>🌡</span>
                      <span style={{ color: 'var(--text-muted)' }}>Température : </span>
                      <strong style={{ color: '#d97706' }}>{c.temperature} °C</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Clinical notes & Diagnosis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.9rem', lineHeight: 1.6 }}>
                <div>
                  {c.symptoms && (
                    <div style={{ marginBottom: 10 }}>
                      <strong style={{ color: '#334155' }}>Symptômes & Examen clinique :</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{c.symptoms}</p>
                    </div>
                  )}
                  {c.diagnosis && (
                    <div>
                      <strong style={{ color: '#0f172a' }}>Diagnostic posé :</strong>
                      <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>{c.diagnosis}</p>
                    </div>
                  )}
                </div>

                <div>
                  {c.treatment && (
                    <div style={{ marginBottom: 10 }}>
                      <strong style={{ color: '#334155' }}>Traitement prescrit :</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{c.treatment}</p>
                    </div>
                  )}
                  {c.notes && (
                    <div>
                      <strong style={{ color: '#64748b' }}>Remarques complémentaires :</strong>
                      <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>{c.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {consultations.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Aucune consultation enregistrée pour ce patient.
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setOpenConsultModal(true)}
                >
                  <Plus size={14} /> Ajouter une consultation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Ordonnances */}
      {activeTab === 'prescriptions' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Médicaments prescrits</th>
                  <th>Remarques</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.prescribed_at?.slice(0, 10)}</strong>
                    </td>
                    <td>
                      {(p.items || []).map((it) => (
                        <div key={it.id} style={{ fontSize: '0.88rem' }}>
                          • <strong>{it.medication_name}</strong> {it.dosage && `(${it.dosage})`}
                          {it.posology && <span style={{ color: 'var(--text-muted)' }}> — {it.posology}</span>}
                        </div>
                      ))}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {p.notes || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setPreviewDoc({ ...p, patient })
                            setPreviewType('prescription')
                          }}
                        >
                          <Eye size={14} /> Aperçu
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => downloadPdf(`/prescriptions/${p.id}/pdf`, `ordonnance-${patient.last_name}-${p.id}.pdf`)}
                        >
                          <Download size={14} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {prescriptions.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Aucune ordonnance délivrée pour ce patient.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Certificats */}
      {activeTab === 'certificates' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type de document</th>
                  <th>Détails & Repos</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td><strong>{cert.issued_at?.slice(0, 10)}</strong></td>
                    <td>
                      <span className="badge badge-purple">{cert.title || 'Certificat Médical'}</span>
                    </td>
                    <td>
                      <div>{cert.content}</div>
                      {cert.days_off > 0 && (
                        <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.82rem', marginTop: 4 }}>
                          Repos accordé : {cert.days_off} jour(s)
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setPreviewDoc({ ...cert, patient })
                            setPreviewType('certificate')
                          }}
                        >
                          <Eye size={14} /> Aperçu
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => downloadPdf(`/certificates/${cert.id}/pdf`, `certificat-${patient.last_name}-${cert.id}.pdf`)}
                        >
                          <Download size={14} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Aucun certificat ou attestation délivré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Radiology */}
      {activeTab === 'radiology' && (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type d'examen</th>
                  <th>Région anatomique</th>
                  <th>Indication clinique</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {radiologyRequests.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.created_at?.slice(0, 10)}</strong></td>
                    <td>
                      <span className="badge badge-info">{req.exam_type}</span>
                    </td>
                    <td>{req.region || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{req.clinical_indication}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setPreviewDoc({ ...req, patient })
                            setPreviewType('radiology')
                          }}
                        >
                          <Eye size={14} /> Aperçu
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => downloadPdf(`/radiology-requests/${req.id}/pdf`, `demande-radio-${patient.last_name}-${req.id}.pdf`)}
                        >
                          <Download size={14} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {radiologyRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Aucune demande d'examen radiologique enregistrée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Consultation */}
      {openConsultModal && (
        <Modal
          title="Nouvelle Consultation Médicale"
          onClose={() => setOpenConsultModal(false)}
          maxWidth="720px"
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setOpenConsultModal(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                form="consultForm"
                disabled={consultSaving}
                className="btn btn-primary"
              >
                {consultSaving ? 'Enregistrement…' : 'Enregistrer la consultation'}
              </button>
            </>
          }
        >
          {consultError && (
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
              {consultError}
            </div>
          )}

          <form id="consultForm" onSubmit={handleSaveConsultation}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <Field label="Date de consultation" required>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={consultForm.date}
                  onChange={(e) => setConsultForm({ ...consultForm, date: e.target.value })}
                />
              </Field>

              <Field label="Motif de consultation" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Ex: Céphalées, fièvre depuis 48h, bilan HTA..."
                  value={consultForm.reason}
                  onChange={(e) => setConsultForm({ ...consultForm, reason: e.target.value })}
                />
              </Field>
            </div>

            {/* Vitals */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 10, color: '#0f172a' }}>
                Constantes vitales :
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Field label="Tension artérielle">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 120/80"
                    value={consultForm.blood_pressure}
                    onChange={(e) => setConsultForm({ ...consultForm, blood_pressure: e.target.value })}
                  />
                </Field>

                <Field label="Poids (kg)">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 72"
                    value={consultForm.weight}
                    onChange={(e) => setConsultForm({ ...consultForm, weight: e.target.value })}
                  />
                </Field>

                <Field label="Température (°C)">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 37.2"
                    value={consultForm.temperature}
                    onChange={(e) => setConsultForm({ ...consultForm, temperature: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <Field label="Examen clinique & Symptômes">
              <textarea
                rows={3}
                className="form-control"
                placeholder="Auscultation pulmonaire, examen orl, palpation abdominale..."
                value={consultForm.symptoms}
                onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
              />
            </Field>

            <Field label="Diagnostic médical retenu" required>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Ex: Rhinopharyngite aiguë, HTA stade 1..."
                value={consultForm.diagnosis}
                onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
              />
            </Field>

            <Field label="Traitement prescrit / Conduite à tenir">
              <textarea
                rows={2}
                className="form-control"
                placeholder="Ex: Antibiothérapie 7j, repos, hydratation..."
                value={consultForm.treatment}
                onChange={(e) => setConsultForm({ ...consultForm, treatment: e.target.value })}
              />
            </Field>

            <Field label="Notes & Consignes de suivi">
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Revoir si persistance après 5 jours..."
                value={consultForm.notes}
                onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
              />
            </Field>
          </form>
        </Modal>
      )}

      {/* Document live preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          type={previewType}
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}
