import { useState, useEffect } from 'react'
import Modal from './Modal'
import { Printer, Download, Stethoscope, ShieldCheck } from './Icons'
import api, { downloadPdf } from '../api/client'

export default function DocumentPreviewModal({ type, document, onClose }) {
  const [cabinet, setCabinet] = useState(null)

  useEffect(() => {
    api.get('/cabinet').then((res) => setCabinet(res.data)).catch(() => {})
  }, [])

  if (!document) return null

  const patient = document.patient || {}
  const doctor = cabinet?.doctor_name || 'Dr. Le Médecin'
  const specialty = cabinet?.specialty || 'Médecine Générale'
  const clinic = cabinet?.name || 'Cabinet Médical Santé & Soins'
  const dateFormatted = document.prescribed_at || document.issued_at || new Date().toISOString().slice(0, 10)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (type === 'prescription') {
      downloadPdf(`/prescriptions/${document.id}/pdf`, `ordonnance-${document.id}.pdf`)
    } else if (type === 'certificate') {
      downloadPdf(`/certificates/${document.id}/pdf`, `certificat-${document.id}.pdf`)
    } else if (type === 'radiology') {
      downloadPdf(`/radiology-requests/${document.id}/pdf`, `demande-radio-${document.id}.pdf`)
    }
  }

  return (
    <Modal
      title="Aperçu officiel du document médical"
      onClose={onClose}
      maxWidth="840px"
      footer={
        <>
          <button type="button" className="btn btn-secondary no-print" onClick={onClose}>
            Fermer
          </button>
          <button type="button" className="btn btn-outline no-print" onClick={handlePrint}>
            <Printer size={16} /> Imprimer directement
          </button>
          <button type="button" className="btn btn-primary no-print" onClick={handleDownload}>
            <Download size={16} /> Télécharger le PDF officiel
          </button>
        </>
      }
    >
      <div className="doc-sheet">
        {/* Header */}
        <div className="doc-sheet-header">
          <div className="doc-sheet-doctor">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {cabinet?.logo_url ? (
                <img
                  src={cabinet.logo_url}
                  alt="Logo"
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
              ) : (
                <div className="nav-brand-logo" style={{ width: 42, height: 42 }}>
                  <Stethoscope size={22} />
                </div>
              )}
              <div>
                <h2>{doctor}</h2>
                <div className="specialty">{specialty}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
              Dossier Médical Numérisé • N° Répertoire Praticien
            </div>
          </div>

          <div className="doc-sheet-clinic">
            <strong style={{ color: '#0f172a', fontSize: '1rem', display: 'block', marginBottom: 2 }}>
              {clinic}
            </strong>
            <div>{cabinet?.address || '12 Boulevard Zerktouni'}</div>
            <div>
              {cabinet?.postal_code} {cabinet?.city || 'Casablanca'}
            </div>
            <div>Tél : <strong>{cabinet?.phone || '0522 00 11 22'}</strong></div>
            <div>E-mail : {cabinet?.email || 'contact@cabinet.local'}</div>
          </div>
        </div>

        {/* Patient and Date Meta */}
        <div className="doc-sheet-meta">
          <div>
            <strong>Patient : </strong>
            <span style={{ fontSize: '1.08rem', fontWeight: 700, color: '#0f172a' }}>
              {patient.last_name?.toUpperCase()} {patient.first_name}
            </span>
            {patient.birth_date && (
              <span style={{ color: '#64748b', marginLeft: 10, fontSize: '0.85rem' }}>
                (Né(e) le {patient.birth_date})
              </span>
            )}
            {patient.blood_type && (
              <span className="badge badge-danger" style={{ marginLeft: 10, fontSize: '0.72rem' }}>
                {patient.blood_type}
              </span>
            )}
          </div>
          <div>
            <strong>Date : </strong>
            <span style={{ fontWeight: 600 }}>{dateFormatted}</span>
          </div>
        </div>

        {/* Document Title */}
        <div className="doc-sheet-title">
          {type === 'prescription' && 'ORDONNANCE MÉDICALE'}
          {type === 'certificate' && (document.title || 'CERTIFICAT MÉDICAL')}
          {type === 'radiology' && 'DEMANDE D’EXAMEN RADIOLOGIQUE'}
        </div>

        {/* Document Body */}
        <div className="doc-sheet-body">
          {type === 'prescription' && (
            <div>
              {(document.items || []).map((item, idx) => (
                <div key={idx} className="doc-item-row">
                  <div className="doc-item-name">
                    {idx + 1}. {item.medication_name} {item.dosage && `— ${item.dosage}`}
                    {item.quantity && (
                      <span style={{ fontSize: '0.85rem', color: '#2563eb', marginLeft: 10, fontWeight: 700 }}>
                        [Qté: {item.quantity}]
                      </span>
                    )}
                  </div>
                  <div className="doc-item-posology">
                    Posologie : <strong>{item.posology || 'Selon prescription médicale'}</strong>
                  </div>
                  {item.duration && (
                    <div className="doc-item-sub">
                      Durée du traitement : <strong>{item.duration}</strong>
                    </div>
                  )}
                </div>
              ))}
              {document.notes && (
                <div style={{ marginTop: 28, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <strong>Conseils & Précautions : </strong>
                  <span>{document.notes}</span>
                </div>
              )}
            </div>
          )}

          {type === 'certificate' && (
            <div style={{ lineHeight: 2, fontSize: '1.05rem' }}>
              <p>
                Je soussigné, <strong>{doctor}</strong>, Docteur en médecine, certifie avoir examiné ce
                jour le/la nommé(e){' '}
                <strong>
                  {patient.last_name?.toUpperCase()} {patient.first_name}
                </strong>
                , et atteste que son état de santé :
              </p>
              <div
                style={{
                  margin: '24px 0',
                  padding: '22px',
                  background: '#f8fafc',
                  borderLeft: '4px solid #2563eb',
                  borderRadius: '0 10px 10px 0',
                  fontWeight: 500,
                }}
              >
                {document.content || document.reason || 'Nécessite un repos médical.'}
              </div>
              {document.days_off > 0 && (
                <p>
                  Nécessite un repos d'une durée de <strong>{document.days_off} jour(s)</strong>,
                  du <strong>{document.start_date || dateFormatted}</strong> au{' '}
                  <strong>{document.end_date || 'inclus'}</strong> sauf complication.
                </p>
              )}
              <p style={{ marginTop: 24, fontSize: '0.9rem', color: '#64748b' }}>
                Certificat délivré en mains propres à l'intéressé(e) pour faire valoir ce que de droit.
              </p>
            </div>
          )}

          {type === 'radiology' && (
            <div style={{ lineHeight: 1.8 }}>
              <p>
                Prière de réaliser pour le patient{' '}
                <strong>
                  {patient.last_name?.toUpperCase()} {patient.first_name}
                </strong>{' '}
                l’examen suivant :
              </p>
              <div
                style={{
                  margin: '20px 0',
                  padding: '18px 22px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d4ed8' }}>
                  {document.exam_type || 'Radiographie standard'}
                </div>
                {document.region && (
                  <div style={{ marginTop: 6, fontWeight: 700, color: '#0f172a' }}>
                    Région anatomique explorée : {document.region}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 22 }}>
                <strong>Indication clinique / Renseignements médicaux :</strong>
                <p style={{ marginTop: 8, color: '#334155', fontSize: '0.96rem' }}>
                  {document.clinical_indication || 'Bilan clinique et radiologique.'}
                </p>
              </div>
              {document.urgent && (
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: 18,
                    padding: '6px 16px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    fontWeight: 800,
                    borderRadius: 8,
                    fontSize: '0.85rem',
                  }}
                >
                  ⚠ EXAMEN DEMANDÉ EN URGENCE
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with doctor stamp and signature */}
        <div className="doc-sheet-footer">
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <ShieldCheck size={14} color="#10b981" />
              <strong style={{ color: '#0f172a' }}>Document médical certifié</strong>
            </div>
            Émis le {new Date().toLocaleDateString('fr-FR')} • Système sécurisé
          </div>

          <div>
            <div style={{ textAlign: 'center', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>
              Signature et cachet du médecin
            </div>
            <div className="doc-stamp-box">
              <span style={{ fontWeight: 800, color: '#2563eb' }}>{doctor}</span>
              <span style={{ fontWeight: 600 }}>{specialty}</span>
              <span style={{ fontSize: '0.72rem', marginTop: 4, color: '#64748b' }}>
                {cabinet?.city || 'Casablanca'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
