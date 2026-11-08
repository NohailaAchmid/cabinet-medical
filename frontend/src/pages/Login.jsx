import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { validationMessage } from '../api/client'
import './Login.css'

const logoImage = '/images/logo-dr-massilia.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="massilia-login">

      {/* HEADER (même style que l'accueil) */}
      <header className="login-header">
        <Link to="/" className="login-logo">
          <img src={logoImage} alt="Logo Dr Massilia Bouhmidi" className="login-logo-icon" />
          <div className="login-logo-text">
            <strong>Dr Massilia Bouhmidi</strong>
            <span>Pédiatre</span>
          </div>
        </Link>

       
      </header>

      <main className="login-main">

        <div className="login-circle" />
       
        <Heart className="login-heart login-heart-coral" size={46} strokeWidth={1.7} />
        <Heart className="login-heart login-heart-light" size={34} strokeWidth={1.6} />

        <section className="login-card">

          

          <h1>
            Espace <span>Médecin</span>
          </h1>

          <p className="login-subtitle">
            Connexion sécurisée au dossier médical et à l'agenda
          </p>

          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label className="login-label" htmlFor="login-email">
               E-mail
            </label>
            <div className="login-field">
              <Mail size={20} />
              <input
                id="login-email"
                type="email"
                required
                placeholder="medecin@cabinet.local"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label className="login-label" htmlFor="login-password">
              Mot de passe
            </label>
            <div className="login-field">
              <Lock size={20} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Authentification…' : 'Accéder au cabinet'}
            </button>

          </form>

          {/* Identifiants de démonstration */}
          

          <div className="login-secure">
            <ShieldCheck size={16} />
            <span>Sécurisation des dossiers et respect de la confidentialité</span>
          </div>

        </section>
      </main>

      <svg
        className="login-wave"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 62 C 220 18, 430 104, 700 58 C 960 14, 1200 96, 1440 44 L1440 120 L0 120 Z"
          fill="#dcebff"
          opacity=".7"
        />
        <path
          d="M0 84 C 260 40, 470 112, 740 76 C 1000 40, 1220 108, 1440 70 L1440 120 L0 120 Z"
          fill="#eaf3ff"
        />
      </svg>

    </div>
  )
}