import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Heart,
  CalendarDays,
  GraduationCap,
  Stethoscope,
  Hospital,
  Star,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Baby,
  ArrowRight,
  ChevronDown,
  Send,
  Clock,
  Home as HomeIcon
} from 'lucide-react'

import {
  FaInstagram,
  FaTiktok,
  FaWhatsapp
} from 'react-icons/fa6'

import './Home.css'

/*
  IMAGES (dossier public/images)
  - dr-massilia.jpg  -> photo de la docteure avec le bébé (hero)
  - baby.jpg         -> bébé avec l'ourson (section rendez-vous)
  - logo-dr-massilia.png -> logo (icône stéthoscope-cœur)
*/
const doctorImage = '/images/dr-massilia.jpg'
const babyImage = '/images/baby.jpg'
const logoImage = '/images/logo-dr-massilia.png'

/* HORAIRES : modifie ici les jours et les heures */
const HOURS = [
  { day: 'Lundi', time: '09:00 – 13:00  |  14:00 – 17:00' },
  { day: 'Mardi', time: '09:00 – 13:00  |  14:00 – 17:00' },
  { day: 'Mercredi', time: '09:00 – 13:00  |  14:00 – 17:00' },
  { day: 'Jeudi', time: '09:00 – 13:00  |  14:00 – 17:00' },
  { day: 'Vendredi', time: '09:00 – 13:00  |  14:00 – 17:00' },
  { day: 'Samedi', time: '09:00 – 13:00' },
  { day: 'Dimanche', time: 'Fermé', closed: true }
]

/* ===== FORMULAIRE DE RENDEZ-VOUS (accueil) ===== */

/* Motifs proposés : remplace par ceux de ta page /rendez-vous */
const MOTIFS = [
  'Consultation pédiatrique',
  'Suivi de croissance',
  'Vaccination',
  'Nouveau-né / Néonatologie',
  'Autre motif'
]

/* Créneaux proposés : remplace par ceux de ta page /rendez-vous */
const SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '15:00', '15:30'
]

const EMPTY_FORM = {
  parent: '',
  phone: '',
  email: '',
  child: '',
  birth: '',
  motif: '',
  date: '',
  slot: ''
}

const todayISO = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)

/*
  ENVOI DE LA DEMANDE
  À brancher sur le même enregistrement que la page /rendez-vous.
  Données reçues : { fullName, phone, email, reason, date, time, notes }
*/
async function sendAppointment(data) {
  // TODO : remplacer par l'appel réel (fetch / service de la page /rendez-vous)
  console.log('Demande de rendez-vous :', data)
  throw new Error('NOT_CONFIGURED')
}

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Rue+des+Forces+Arm%C3%A9es+Royales+Rue+12+Nador+Maroc'

export default function Home() {
  // Lundi = 0 ... Dimanche = 6
  const todayIndex = (new Date().getDay() + 6) % 7

  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [feedback, setFeedback] = useState('')

  const updateField = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (status !== 'sending') setStatus('idle')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !form.parent.trim() ||
      !form.phone.trim() ||
      !form.child.trim() ||
      !form.motif ||
      !form.date ||
      !form.slot
    ) {
      setStatus('error')
      setFeedback('Merci de remplir tous les champs marqués d\'une *.')
      return
    }

    if (form.phone.replace(/\D/g, '').length < 8) {
      setStatus('error')
      setFeedback('Merci de saisir un numéro de téléphone valide.')
      return
    }

    setStatus('sending')
    setFeedback('')

    const notes =
      `Enfant : ${form.child.trim()}` +
      (form.birth ? ` — né(e) le ${form.birth}` : '')

    try {
      await sendAppointment({
        fullName: form.parent.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        reason: form.motif,
        date: form.date,
        time: form.slot,
        notes
      })

      setStatus('success')
      setFeedback('Votre demande a bien été envoyée. Le cabinet vous confirme l\'horaire rapidement.')
      setForm(EMPTY_FORM)
    } catch (err) {
      setStatus('error')
      setFeedback(
        err.message === 'NOT_CONFIGURED'
          ? 'L\'envoi des demandes n\'est pas encore configuré.'
          : 'Une erreur est survenue. Merci de réessayer ou de contacter le cabinet.'
      )
    }
  }

  return (
    <main className="massilia-home">

      {/* ================= HEADER ================= */}
      <header className="massilia-header">

        <Link to="/#accueil" className="massilia-logo">
          <img
            src={logoImage}
            alt="Logo Dr Massilia Bouhmidi"
            className="logo-icon"
          />
          <div className="logo-text">
            <strong>Dr Massilia Bouhmidi</strong>
            <span>Pédiatre</span>
          </div>
        </Link>

        <nav className="massilia-nav">
          <a className="nav-active" href="#accueil">
            <HomeIcon size={19} />
            Accueil
          </a>

          <a href="#docteur">
            Le Docteur
            <ChevronDown size={16} />
          </a>

          <a href="#rendez-vous">
            <CalendarDays size={19} />
            Prendre Rendez-vous
          </a>

          <a href="#horaires">
            <Clock size={19} />
            Horaires
          </a>

          <a href="#contact">
            <Mail size={19} />
            Contact
          </a>
        </nav>

        <Link to="/login" className="massilia-portal">
  <UserRound size={18} />
  Espace Médecin
</Link>
      </header>

      {/* ================= HERO ================= */}
      <section className="massilia-hero" id="accueil">

        <div className="hero-decoration hero-circle-one" />

        <div className="hero-content">

          <div className="hero-title">

            <div className="hero-title-top">
              <span>Cabinet de</span>

              <svg
                className="title-swoosh"
                viewBox="0 0 160 50"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 44 C 40 14, 95 8, 156 22"
                  stroke="#ff806d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              <Heart className="title-heart" size={60} strokeWidth={1.8} />
            </div>

            <h1>Pédiatrie &amp; Néonatologie</h1>

            <h2>– Dr Massilia Bouhmidi –</h2>

            <svg
              className="name-swoosh"
              viewBox="0 0 240 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 13 C 60 3, 150 3, 236 9"
                stroke="#ff806d"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          

         <a href="#rendez-vous"className="hero-button">
            <CalendarDays size={22} />
           Prendre rendez-vous
           
          </a>

        </div>

        {/* Petits cœurs décoratifs */}
        <Heart className="deco-heart deco-heart-left" size={38} strokeWidth={1.6} />
        <Heart className="deco-heart deco-heart-coral" size={40} strokeWidth={1.7} />

        {/* Photo docteure + bébé */}
        <div className="hero-photo">
          <div className="hero-photo-blob">
            <img
              src={doctorImage}
              alt="Dr Massilia Bouhmidi, pédiatre, avec un nouveau-né"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <Heart className="photo-heart photo-heart-one" size={46} strokeWidth={1.8} />
          <Heart className="photo-heart photo-heart-two" size={32} strokeWidth={1.8} />
        </div>

        {/* Vague + ourson */}
        <svg
          className="hero-wave"
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

              </section>

      {/* ================= PARCOURS ACADÉMIQUE ================= */}
      <section className="massilia-education" id="docteur">

        <div className="section-heading">
          <GraduationCap size={56} strokeWidth={1.9} />
          <h2>Parcours académique</h2>
        </div>

        <p className="section-subtitle">
          Une formation médicale complète, de Oujda aux hôpitaux de Paris.
        </p>

        <div className="education-grid">

          <article className="education-card">
            <div className="education-icon blue-icon">
              <Stethoscope size={40} strokeWidth={2.2} />
            </div>

            <h3>Doctorat en médecine</h3>

            <p>
              Faculté de Médecine
              <br />
              d'Oujda
            </p>
          </article>

          <article className="education-card">
            <div className="education-icon blue-icon">
              <Hospital size={40} strokeWidth={2.2} />
            </div>

            <h3>Résidence</h3>

            <p>
              Ancienne résidente du CHU
              <br />
              d'Oujda et des hôpitaux de Paris
              <br />
              (AP-HP)
            </p>
          </article>

          <article className="education-card">
            <div className="education-icon coral-icon">
              <Star size={40} strokeWidth={2.2} />
            </div>

            <h3>Spécialisation</h3>

            <p>
              Pédiatrie, avec une expertise
              <br />
              en néonatologie
            </p>
          </article>

        </div>
      </section>

      {/* ================= RENDEZ-VOUS ================= */}
      <section className="massilia-booking" id="rendez-vous">

        <div className="booking-image">
          <img
            src={babyImage}
            alt="Nouveau-né avec son ours en peluche"
          />

          <Heart className="booking-heart booking-heart-one" strokeWidth={1.8} />
          <Heart className="booking-heart booking-heart-two" strokeWidth={1.8} />
          <Heart className="booking-heart booking-heart-three" strokeWidth={1.8} />
        </div>

        <div className="booking-content">

          <div className="booking-title">

            <div className="booking-calendar-icon">
              <CalendarDays size={46} strokeWidth={1.8} />
            </div>

            <div>
              <h2>Prendre rendez-vous en ligne</h2>

              <p>
                Remplissez le formulaire : le cabinet vous confirme
                l'horaire rapidement.
              </p>
            </div>

          </div>

          <form className="booking-form" onSubmit={handleSubmit} noValidate>

            <div className="booking-preview">

              <label className="booking-field">
                <UserRound className="fill-icon" />
                <input
                  type="text"
                  name="parent"
                  value={form.parent}
                  onChange={updateField}
                  placeholder="Nom du parent *"
                  autoComplete="name"
                />
              </label>

              <label className="booking-field">
                <Phone className="fill-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="Téléphone *"
                  autoComplete="tel"
                />
              </label>

              <label className="booking-field">
                <Mail />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="Adresse e-mail (facultatif)"
                  autoComplete="email"
                />
              </label>

              <label className="booking-field">
                <Baby />
                <input
                  type="text"
                  name="child"
                  value={form.child}
                  onChange={updateField}
                  placeholder="Nom de l'enfant *"
                />
              </label>

              <label className="booking-field">
                <CalendarDays />
                <span className="field-label">Date de naissance</span>
                <input
                  type="date"
                  name="birth"
                  value={form.birth}
                  onChange={updateField}
                  max={todayISO()}
                  aria-label="Date de naissance de l'enfant"
                />
              </label>

              <label className="booking-field">
                <Heart className="fill-icon" />
                <select
                  name="motif"
                  value={form.motif}
                  onChange={updateField}
                  className={form.motif ? '' : 'is-empty'}
                  aria-label="Motif de la consultation"
                >
                  <option value="">Motif de la consultation *</option>
                  {MOTIFS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="field-chevron" />
              </label>

              <label className="booking-field">
                <CalendarDays className="fill-icon" />
                <span className="field-label">Date souhaitée *</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={updateField}
                  min={todayISO()}
                  aria-label="Date souhaitée"
                />
              </label>

              <label className="booking-field">
                <Clock />
                <select
                  name="slot"
                  value={form.slot}
                  onChange={updateField}
                  className={form.slot ? '' : 'is-empty'}
                  aria-label="Créneau horaire disponible"
                >
                  <option value="">Créneau horaire disponible *</option>
                  {SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="field-chevron" />
              </label>

            </div>

            {feedback && (
              <p className={`booking-message ${status === 'success' ? 'is-success' : 'is-error'}`}>
                {feedback}
              </p>
            )}

            <button
              type="submit"
              className="booking-submit"
              disabled={status === 'sending'}
            >
              <Send size={22} />
              {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>

          </form>

        </div>
      </section>

      {/* ================= HORAIRES ================= */}
      <section className="massilia-hours" id="horaires">

        <div className="section-heading">
          <Clock size={50} strokeWidth={1.9} />
          <h2>Horaires du cabinet</h2>
        </div>

        <p className="section-subtitle">
          Consultations sur rendez-vous, pour votre confort et celui de votre enfant.
        </p>

        <div className="hours-wrap">

          <div className="hours-card">
            {HOURS.map((item, index) => (
              <div
                key={item.day}
                className={
                  'hours-row' +
                  (index === todayIndex ? ' is-today' : '') +
                  (item.closed ? ' is-closed' : '')
                }
              >
                <span className="hours-day">
                  {item.day}
                  {index === todayIndex && <em>Aujourd'hui</em>}
                </span>
                <span className="hours-time">{item.time}</span>
              </div>
            ))}

            
          </div>


        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="massilia-footer" id="contact">

        <svg
          className="footer-wave"
          viewBox="0 0 1440 70"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 0 H1440 V30 C1200 70, 1000 6, 760 38 C520 70, 300 8, 0 44 Z"
            fill="#9cc4f3"
            opacity=".75"
          />
          <path
            d="M0 0 H1440 V18 C1220 52, 1010 0, 770 24 C520 50, 290 0, 0 28 Z"
            fill="#f5f8ff"
          />
        </svg>

        <div className="footer-main">

          {/* LOCALISATION */}
          <div className="footer-column footer-location">

            <div className="footer-location-top">
              <MapPin size={34} className="footer-pin" />

              <div>
                <h3>Le cabinet</h3>

                <p>
                  Cabinet du Dr Massilia Bouhmidi
                  <br />
                  Rue des Forces Armées Royales,
                  <br />
                  Rue 12, immeuble 1, 1er étage
                  <br />
                  Nador, Maroc
                </p>
              </div>
            </div>

            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="footer-map-card"
            >
              <div className="map-bg">
                <div className="map-label">
                  <MapPin size={26} fill="#e53935" color="#e53935" />
                  <span>
                    Cabinet Dr Massilia
                    <br />
                    Bouhmidi
                  </span>
                </div>
              </div>

              <div className="map-button">
                <MapPin size={15} color="#2f8f5b" />
                Voir sur Google Maps
                <ArrowRight size={15} />
              </div>
            </a>

          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div className="footer-column footer-social">

            <h3>Suivez-nous</h3>

            <div className="social-links">

              <a
                href="https://www.instagram.com/dr.massiliabouhmidi.pediatre/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="social-circle instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.tiktok.com/@massiliabouhmidi?_t=ZS-90Z0iHcQov2&_r=1"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="social-circle tiktok"
              >
                <FaTiktok />
              </a>

              <a
                href="https://wa.me/212662332070"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="social-circle whatsapp"
              >
                <FaWhatsapp />
              </a>

            </div>

          </div>

          {/* CONTACT */}
          <div className="footer-column footer-contact">

            <h3>
              <Phone size={26} />
              Contact
            </h3>

            <a href="https://wa.me/212662332070">
              <Phone size={19} />
              +212 662 332 070
            </a>

            <a href="mailto:drmassiliabouhmidi@gmail.com">
              <Mail size={19} />
              drmassiliabouhmidi@gmail.com
            </a>

            <div className="footer-message">
              <span>
                Parce que chaque enfant
                <br />
                mérite le meilleur
              </span>
              <Heart size={34} strokeWidth={1.8} />
              <svg
                className="message-swoosh"
                viewBox="0 0 200 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9 C 50 2, 120 2, 196 7"
                  stroke="#ff806d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} Dr Massilia Bouhmidi – Pédiatre.
            Tous droits réservés.
          </p>

          <div>
            <span>Santé</span>
            <span>•</span>
            <span>Bienveillance</span>
            <span>•</span>
            <span>Accompagnement</span>
          </div>

        </div>

      </footer>

    </main>
  )
}