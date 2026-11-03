import { X } from './Icons'

export default function Modal({ title, children, onClose, footer, maxWidth = '650px' }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="card-title" style={{ margin: 0, fontSize: '1.2rem' }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, error, children, required = false }) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {children}
      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  )
}
