import { useEffect, useState } from 'react'
import api, { validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import {
  Calendar,
  Clock,
  Plus,
  Check,
  X,
  Search,
  Filter,
  User,
  Trash2,
  AlertCircle,
} from '../components/Icons'

export default function Appointments() {
  const { addToast } = useToast()
  const [appointments, setAppointments] = useState([])
  const [requests, setRequests] = useState([])
  const [patients, setPatients] = useState([])
  const [activeTab, setActiveTab] = useState('agenda')
  const [loading, setLoading] = useState(true)

  // Filters
  const [dateFilter, setDateFilter] = useState('all') // 'today', 'tomorrow', 'all'
  const [statusFilter, setStatusFilter] = useState('all')

  // Create appointment modal
  const [openModal, setOpenModal] = useState(false)
  const todayStr = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    patient_id: '',
    patient_name: '',
    patient_phone: '',
    date: todayStr,
    time: '09:30',
    reason: 'Consultation de suivi',
    status: 'confirmed',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function loadData() {
    setLoading(true)
    Promise.all([
      api.get('/appointments'),
      api.get('/appointment-requests'),
      api.get('/patients'),
    ])
      .then(([apptsRes, reqsRes, patsRes]) => {
        setAppointments(apptsRes.data)
        setRequests(reqsRes.data)
        setPatients(patsRes.data.data || patsRes.data || [])
      })
      .catch(() => addToast('Erreur lors du chargement des rendez-vous', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleConfirmRequest(id) {
    try {
      await api.post(`/appointment-requests/${id}/confirm`)
      addToast('Demande confirmée et rendez-vous planifié !', 'success')
      loadData()
    } catch {
      addToast('Erreur lors de la confirmation.', 'error')
    }
  }

  async function handleRefuseRequest(id) {
    try {
      await api.post(`/appointment-requests/${id}/refuse`)
      addToast('Demande refusée.', 'info')
      loadData()
    } catch {
      addToast('Erreur lors du refus.', 'error')
    }
  }

  async function handleUpdateStatus(apptId, newStatus) {
    try {
      await api.put(`/appointments/${apptId}`, { status: newStatus })
      addToast(`Statut mis à jour : ${newStatus}`, 'success')
      loadData()
    } catch {
      addToast('Erreur lors de la mise à jour du statut', 'error')
    }
  }

  async function handleDeleteAppointment(apptId) {
    if (!window.confirm('Voulez-vous supprimer ce rendez-vous ?')) return
    try {
      await api.delete(`/appointments/${apptId}`)
      addToast('Rendez-vous supprimé.', 'info')
      loadData()
    } catch {
      addToast('Erreur lors de la suppression.', 'error')
    }
  }

  async function handleSaveAppointment(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      await api.post('/appointments', form)
      addToast('Rendez-vous planifié avec succès', 'success')
      setOpenModal(false)
      loadData()
    } catch (err) {
      setFormError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function handlePatientSelect(patientId) {
    if (!patientId) {
      setForm({ ...form, patient_id: '', patient_name: '', patient_phone: '' })
      return
    }
    const p = patients.find((pat) => String(pat.id) === String(patientId))
    if (p) {
      setForm({
        ...form,
        patient_id: p.id,
        patient_name: `${p.last_name?.toUpperCase()} ${p.first_name}`,
        patient_phone: p.phone || '',
      })
    }
  }

  // Filter appointments
  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (dateFilter === 'today') {
      return a.date === todayStr
    }
    return true
  })

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
         
          <h1 style={{ fontSize: '2.99rem', fontWeight: 800, color: '#f78282' , fontFamily:'Caveat, Segoe Script, cursive'}}>
            Rendez-vous & Agenda
          </h1>
         
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormError('')
            setForm({
              patient_id: '',
              patient_name: '',
              patient_phone: '',
              date: todayStr,
              time: '10:00',
              reason: 'Consultation de routine',
              status: 'confirmed',
              notes: '',
            })
            setOpenModal(true)
          }}
        >
          <Plus size={18} /> Nouveau Rendez-vous
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            border: 'none',
            background: 'transparent',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'agenda' ? 700 : 500,
            color: activeTab === 'agenda' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'agenda' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
          }}
        >
          <Calendar size={18} />
          <span>Agenda des Consultations ({appointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            border: 'none',
            background: 'transparent',
            fontSize: '0.95rem',
            fontWeight: activeTab === 'requests' ? 700 : 500,
            color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'requests' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
          }}
        >
          <Clock size={18} />
          <span>Demandes en ligne reçues</span>
          {pendingRequests.length > 0 && (
            <span className="badge badge-warning" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {pendingRequests.length} à traiter
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Agenda */}
      {activeTab === 'agenda' && (
        <div>
          {/* Filter tools */}
          <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Période :</span>
                <button
                  type="button"
                  className={`btn btn-sm ${dateFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateFilter('all')}
                >
                  Tous les jours
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${dateFilter === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDateFilter('today')}
                >
                  Aujourd'hui ({todayStr})
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Statut :</span>
                <select
                  className="form-control form-select"
                  style={{ width: 140, padding: '6px 12px', fontSize: '0.85rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="pending">En attente</option>
                  <option value="completed">Terminés</option>
                  <option value="cancelled">Annulés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Heure</th>
                    <th>Patient</th>
                    <th>Motif</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{appt.time}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}> {appt.date}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{appt.patient?.name || appt.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                           {appt.patient?.phone || appt.phone || 'Non renseigné'}
                        </div>
                      </td>
                      <td>{appt.reason || 'Consultation générale'}</td>
                      <td>
                        {appt.status === 'confirmed' && <span className="badge badge-success">Confirmé</span>}
                        {appt.status === 'pending' && <span className="badge badge-warning">En attente</span>}
                        {appt.status === 'completed' && <span className="badge badge-info">Terminé</span>}
                        {appt.status === 'cancelled' && <span className="badge badge-danger">Annulé</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          {appt.status !== 'completed' && (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              title="Marquer comme terminé"
                              onClick={() => handleUpdateStatus(appt.id, 'completed')}
                            >
                              <Check size={14} /> Terminé
                            </button>
                          )}
                          {appt.status !== 'cancelled' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)' }}
                              title="Annuler le rendez-vous"
                              onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                            >
                              <X size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Supprimer"
                            onClick={() => handleDeleteAppointment(appt.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredAppointments.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Aucun rendez-vous ne correspond à vos filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Online Requests */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map((req) => (
            <div
              key={req.id}
              className="card"
              style={{
                borderLeft: req.status === 'pending' ? '4px solid var(--warning)' : '4px solid var(--border)',
                background: req.status === 'pending' ? '#fffdf7' : '#ffffff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${req.status === 'pending' ? 'badge-warning' : req.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                      {req.status === 'pending' ? 'En attente de confirmation' : req.status === 'confirmed' ? 'Confirmé' : 'Refusé'}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                      {req.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: 18, color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 8, flexWrap: 'wrap' }}>
                    <span> Créneau souhaité : <strong>{req.preferred_date}</strong> à <strong>{req.preferred_time || 'Libre'}</strong></span>
                    <span> {req.phone}</span>
                    {req.email && <span>✉ {req.email}</span>}
                  </div>

                  <div style={{ marginTop: 12, fontSize: '0.92rem' }}>
                    <strong>Motif : </strong>
                    <span>{req.reason || 'Consultation médicale'}</span>
                  </div>

                  {req.notes && (
                    <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Remarque patient : </strong> {req.notes}
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleConfirmRequest(req.id)}
                    >
                      <Check size={16} /> Confirmer & Ajouter à l'agenda
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRefuseRequest(req.id)}
                    >
                      <X size={16} /> Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Aucune demande reçue en ligne pour le moment.
            </div>
          )}
        </div>
      )}

      {/* Modal: New Appointment */}
      {openModal && (
        <Modal
          title="Planifier un rendez-vous"
          onClose={() => setOpenModal(false)}
          maxWidth="640px"
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
                form="appointmentForm"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Enregistrement…' : 'Confirmer le rendez-vous'}
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

          <form id="appointmentForm" onSubmit={handleSaveAppointment}>
            <Field label="Sélectionner un patient existant (optionnel)">
              <select
                className="form-control form-select"
                value={form.patient_id}
                onChange={(e) => handlePatientSelect(e.target.value)}
              >
                <option value=""> Nouveau patient / Non enregistré </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.last_name?.toUpperCase()} {p.first_name} ({p.phone || 'Sans tel'})
                  </option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Nom complet du patient" required>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Ex: Sara Benali"
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                />
              </Field>

              <Field label="Numéro de téléphone de parent">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ex: 06 12 34 56 78"
                  value={form.patient_phone}
                  onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Date" required>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>

              <Field label="Heure du rendez-vous" required>
                <input
                  type="time"
                  required
                  className="form-control"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Motif de la consultation" required>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Ex: Consultation de suivi, Renouvellement, Tension..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </Field>

            <Field label="Notes complémentaires (facultatif)">
              <textarea
                rows={2}
                className="form-control"
                placeholder="Remarques particulières..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
          </form>
        </Modal>
      )}
    </div>
  )
}
