import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validationMessage } from '../api/client'
import { Stethoscope, Lock, Mail, ShieldCheck, AlertCircle, CheckCircle2 } from '../components/Icons'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(validationMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setEmail('medecin@cabinet.local')
    setPassword('password')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(1200px 600px at 50% 0%, rgba(37, 99, 235, 0.1), transparent 70%), #f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <nav className="public-nav">
        <Link to="/" className="nav-brand">
          <div className="nav-brand-logo">
            <Stethoscope size={24} />
          </div>
          <span>Cabinet Médical</span>
        </Link>
        <Link to="/" className="btn btn-ghost btn-sm">
          ← Retour au site public
        </Link>
      </nav>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 450,
            padding: '42px 38px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'var(--primary-gradient)',
            }}
          />

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
                marginBottom: 18,
              }}
            >
              <Stethoscope size={30} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Espace Praticien
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
              Connexion sécurisée au dossier médical et à l'agenda
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                background: '#fee2e2',
                color: '#b91c1c',
                borderRadius: 10,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.88rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Identifiant / E-mail médical</label>
              <input
                type="email"
                required
                placeholder="medecin@cabinet.local"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: 10 }}
            >
              {loading ? 'Authentification…' : 'Accéder au cabinet'}
            </button>
          </form>

          {/* Demo shortcut */}
          <div
            style={{
              marginTop: 26,
              padding: '14px 18px',
              background: '#f0fdfa',
              borderRadius: 14,
              border: '1px solid #ccfbf1',
              fontSize: '0.84rem',
              color: '#0f766e',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>Identifiants de démonstration :</strong>
              <button
                type="button"
                onClick={fillDemo}
                style={{
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                }}
              >
                Remplir en 1 clic
              </button>
            </div>
            <div>
              E-mail : <code>medecin@cabinet.local</code>
              <br />
              Mot de passe : <code>password</code>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.8rem',
              color: 'var(--text-light)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Sécurisation des dossiers et respect de la confidentialité</span>
          </div>
        </div>
      </div>
    </div>
  )
}
