import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Public Pages
import Home from './pages/Home'
import Book from './pages/Book'
import Login from './pages/Login'

// Doctor Private Pages
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientFile from './pages/PatientFile'
import Appointments from './pages/Appointments'
import Prescriptions from './pages/Prescriptions'
import Certificates from './pages/Certificates'
import Radiology from './pages/Radiology'
import Medications from './pages/Medications'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Chargement de l’application…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/rendez-vous" element={<Book />} />
      <Route path="/connexion" element={<Login />} />

      {/* Doctor Workspace */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientFile />} />
        <Route path="rendez-vous" element={<Appointments />} />
        <Route path="ordonnances" element={<Prescriptions />} />
        <Route path="attestations" element={<Certificates />} />
        <Route path="radiologie" element={<Radiology />} />
        <Route path="medicaments" element={<Medications />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
