import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Heart,
  FileText,
  Activity,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from '../components/Icons'

export default function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/cabinet')
      .then((res) => setData(res.data))
      .catch(() => setData({ cabinet: null, availabilities: [] }))
      .finally(() => setLoading(false))
  }, [])

  const cabinet = data?.cabinet
  const doctorName = cabinet?.doctor_name || 'Le Médecin Praticien'
  const specialty = cabinet?.specialty || 'Médecine Générale'
  const clinicName = cabinet?.name || 'Cabinet Médical Santé & Soins'

  return (
    <div className="public-shell">
      {/* Top Navbar */}
      <nav className="public-nav">
        <div className="nav-brand">
          <div className="nav-brand-logo">
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ lineHeight: 1.15 }}>{clinicName}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {specialty}
            </div>
          </div>
        </div>

        <div className="nav-links">
          <a href="#services">Soins & Services</a>
          <a href="#apropos">Le Cabinet</a>
          <a href="#horaires">Horaires & Accès</a>
          <Link to="/rendez-vous" className="btn btn-primary btn-sm">
            <Calendar size={15} /> Prendre Rendez-vous
          </Link>
          <Link to="/connexion" className="btn btn-outline btn-sm">
            Espace Professionnel
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="public-hero">
        <div>
          <div className="hero-tag">
            <span className="pulse-container">
              <span className="pulse-dot" />
              <span>Consultations sur RDV • Dossiers Numérisés</span>
            </span>
          </div>

          <h1 className="hero-title">
            Une médecine attentive, une gestion <span className="text-gradient">fluide & moderne</span>.
          </h1>

          <p className="hero-description">
            {cabinet?.about ||
              "Bienvenue au sein de notre cabinet médical. Bénéficiez d'une prise en charge rigoureuse, d'un suivi personnalisé et de la création immédiate de vos ordonnances, attestations et examens sous format numérique."}
          </p>

          <div className="hero-actions">
            <Link to="/rendez-vous" className="btn btn-primary btn-lg">
              <Calendar size={18} /> Prendre Rendez-vous en Ligne
            </Link>
            <a href="#horaires" className="btn btn-secondary btn-lg">
              <MapPin size={18} /> Localisation & Horaires
            </a>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 44,
              paddingTop: 28,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)' }}>100%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Documents Numériques</div>
            </div>
            <div style={{ borderRight: '1px solid var(--border)' }} />
            <div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)' }}>24h/7j</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Demandes en ligne</div>
            </div>
            <div style={{ borderRight: '1px solid var(--border)' }} />
            <div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--indigo)' }}>Sécurisé</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Secret Médical Garanti</div>
            </div>
          </div>
        </div>

        {/* Hero Doctor Card */}
        <div className="hero-card-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--primary-gradient-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(37, 99, 235, 0.2)',
              }}
            >
              <Stethoscope size={32} />
            </div>
            <div>
              <span className="badge badge-success" style={{ marginBottom: 6 }}>
                Cabinet en activité
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {doctorName}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>{specialty}</p>
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: 14,
              padding: 18,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Clock size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Horaires de consultation :</strong>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {cabinet?.opening_hours ||
                "Lundi – Vendredi : 09h00–13h00 / 15h00–19h00\nSamedi : 09h00–13h00"}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <MapPin size={17} color="var(--primary)" />
              <span>{cabinet?.address || '12 Boulevard Zerktouni'}, {cabinet?.city || 'Casablanca'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <Phone size={17} color="var(--primary)" />
              <span>{cabinet?.phone || '0522 00 11 22'}</span>
            </div>
          </div>

          <Link
            to="/rendez-vous"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 24 }}
          >
            Réserver une consultation <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" style={{ padding: '70px 6vw', background: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="badge badge-info" style={{ marginBottom: 12 }}>
              Offre de Soins
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Une prise en charge médicale globale
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, maxWidth: 620, margin: '8px auto 0', fontSize: '1.05rem' }}>
              Des consultations approfondies, des documents officiels instantanés et un accompagnement de santé continu.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 26 }}>
            {[
              {
                icon: Heart,
                color: 'kpi-emerald',
                title: 'Consultations Générales',
                desc: 'Diagnostic clinique, suivi régulier, traitement des pathologies aiguës et suivi des maladies chroniques (HTA, diabète).',
              },
              {
                icon: FileText,
                color: 'kpi-blue',
                title: 'Ordonnances Numérisées',
                desc: 'Prescriptions claires et sécurisées avec posologie précise, durée, imprimables immédiatement et téléchargeables en PDF.',
              },
              {
                icon: ShieldCheck,
                color: 'kpi-purple',
                title: 'Certificats & Attestations',
                desc: 'Arrêts de travail avec calcul du repos, certificats d’aptitude sportive et attestations de présence ou de consultation.',
              },
              {
                icon: Activity,
                color: 'kpi-amber',
                title: 'Examens Radiologiques',
                desc: 'Demandes détaillées d’imagerie médicale (Radiographie, Échographie, Scanner TDM, IRM) avec indication clinique officielle.',
              },
            ].map((srv, idx) => {
              const IconComp = srv.icon
              return (
                <div key={idx} className="card" style={{ padding: 30, display: 'flex', flexDirection: 'column' }}>
                  <div className={`kpi-icon-box ${srv.color}`} style={{ marginBottom: 22 }}>
                    <IconComp size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10, color: '#0f172a' }}>
                    {srv.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, flex: 1 }}>
                    {srv.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Doctor & Clinic Details */}
      <section id="horaires" style={{ padding: '70px 6vw', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 30 }}>
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={22} color="var(--primary)" /> Coordonnées & Accès
            </h3>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <strong style={{ color: '#0f172a' }}>Adresse du cabinet :</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>
                  {cabinet?.address || '12 Boulevard Zerktouni'}
                  <br />
                  {cabinet?.postal_code} {cabinet?.city || 'Casablanca'}
                  <br />
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {cabinet?.location_text || 'Accès facile, parking et transports à proximité'}
                  </span>
                </p>
              </div>
              <div>
                <strong style={{ color: '#0f172a' }}>Contact direct :</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>
                  Téléphone : <strong>{cabinet?.phone || '0522 00 11 22'}</strong>
                  <br />
                  E-mail : {cabinet?.email || 'contact@cabinet.local'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={22} color="var(--primary)" /> Créneaux d'ouverture
            </h3>
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  background: 'var(--bg-main)',
                  padding: 18,
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  lineHeight: 1.8,
                  fontSize: '0.9rem',
                }}
              >
                {cabinet?.opening_hours ? (
                  <div style={{ whiteSpace: 'pre-line' }}>{cabinet.opening_hours}</div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lundi – Vendredi :</span>
                      <strong>09:00 - 13:00 / 15:00 - 19:00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span>Samedi :</span>
                      <strong>09:00 - 13:00</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text-light)' }}>
                      <span>Dimanche :</span>
                      <span>Fermé</span>
                    </div>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} color="var(--success)" />
                Les consultations se font sur rendez-vous pour réduire votre temps d'attente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          background: '#ffffff',
          borderTop: '1px solid var(--border)',
          padding: '32px 6vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="nav-brand-logo" style={{ width: 30, height: 30, borderRadius: 8 }}>
            <Stethoscope size={16} />
          </div>
          <span>
            © {new Date().getFullYear()} {clinicName} • Application Médicale Conforme
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontWeight: 600 }}>
          <Link to="/rendez-vous">Prendre RDV</Link>
          <Link to="/connexion">Accès Médecin</Link>
        </div>
      </footer>
    </div>
  )
}
