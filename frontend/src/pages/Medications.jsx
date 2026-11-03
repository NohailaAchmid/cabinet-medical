import { useEffect, useState } from 'react'
import api, { validationMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import Modal, { Field } from '../components/Modal'
import {
  Pill,
  Plus,
  Trash2,
  Search,
  Filter,
} from '../components/Icons'

const initialForm = {
  name: '',
  form: 'Comprimé',
  dosage: '1000 mg',
  default_posology: '1 comprimé 3 fois par jour après les repas',
  manufacturer: 'Générique',
  notes: '',
}

const drugForms = [
  'Comprimé',
  'Gélule',
  'Sirop',
  'Solution buvable',
  'Sachet',
  'Injectable (IV/IM)',
  'Inhalateur / Spray',
  'Crème / Pommade',
  'Collyre',
  'Suppositoire',
]

export default function Medications() {
  const { addToast } = useToast()
  const [medications, setMedications] = useState([])
  const [search, setSearch] = useState('')
  const [formFilter, setFormFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal
  const [openModal, setOpenModal] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function loadMedications() {
    setLoading(true)
    api.get('/medications')
      .then((res) => setMedications(res.data))
      .catch(() => addToast('Erreur lors du chargement des médicaments', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMedications()
  }, [])

  function handleOpenCreate() {
    setEditingMed(null)
    setForm(initialForm)
    setFormError('')
    setOpenModal(true)
  }

  function handleOpenEdit(med) {
    setEditingMed(med)
    setForm({
      name: med.name || '',
      form: med.form || 'Comprimé',
      dosage: med.dosage || '',
      default_posology: med.default_posology || '',
      manufacturer: med.manufacturer || 'Générique',
      notes: med.notes || '',
    })
    setFormError('')
    setOpenModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editingMed) {
        await api.put(`/medications/${editingMed.id}`, form)
        addToast('Médicament modifié avec succès', 'success')
      } else {
        await api.post('/medications', form)
        addToast('Médicament ajouté au catalogue', 'success')
      }
      setOpenModal(false)
      loadMedications()
    } catch (err) {
      setFormError(validationMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Voulez-vous supprimer ce médicament de la base ?')) return
    try {
      await api.delete(`/medications/${id}`)
      addToast('Médicament retiré du catalogue.', 'info')
      loadMedications()
    } catch {
      addToast('Erreur lors de la suppression.', 'error')
    }
  }

  const filtered = medications.filter((m) => {
    if (formFilter && m.form !== formFilter) return false
    if (!search) return true
    const term = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(term) ||
      (m.dosage && m.dosage.toLowerCase().includes(term)) ||
      (m.form && m.form.toLowerCase().includes(term))
    )
  })

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="badge badge-info" style={{ marginBottom: 6 }}>
            Formulaire Thérapeutique
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Base des Médicaments
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestion de la liste des médicaments, formes galéniques, dosages et posologies recommandées.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Ajouter un Médicament
        </button>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
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
              placeholder="Rechercher par nom de molécule, marque, dosage..."
              className="form-control"
              style={{ paddingLeft: 40 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Forme galénique :
            </span>
            <select
              className="form-control form-select"
              style={{ width: 170 }}
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
            >
              <option value="">Toutes les formes</option>
              {drugForms.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Forme</th>
                <th>Dosage</th>
                <th>Posologie par défaut</th>
                <th>Laboratoire</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((med) => (
                <tr key={med.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: '#e0f2fe',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Pill size={18} />
                      </div>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                        {med.name}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{med.form}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#0369a1' }}>{med.dosage || '—'}</strong>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 280 }}>
                    {med.default_posology || '1 prise selon ordonnance'}
                  </td>
                  <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    {med.manufacturer || 'Générique'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(med)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDelete(med.id)}
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
                    Aucun médicament trouvé dans le catalogue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit */}
      {openModal && (
        <Modal
          title={editingMed ? 'Modifier le médicament' : 'Ajouter un médicament au catalogue'}
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
                form="medForm"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer le médicament'}
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

          <form id="medForm" onSubmit={handleSave}>
            <Field label="Nom commercial ou DCI" required>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Ex: Paracétamol, Amoxicilline, Doliprane..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Forme galénique">
                <select
                  className="form-control form-select"
                  value={form.form}
                  onChange={(e) => setForm({ ...form, form: e.target.value })}
                >
                  {drugForms.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Dosage">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: 1000 mg, 500 mg, 20 mg..."
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Posologie usuelle par défaut">
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 1 comprimé 3 fois par jour après les repas"
                value={form.default_posology}
                onChange={(e) => setForm({ ...form, default_posology: e.target.value })}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Laboratoire / Fabricant">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Sanofi, Sothema, Générique..."
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                />
              </Field>

              <Field label="Remarques / Contre-indications">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Prise à jeun..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
