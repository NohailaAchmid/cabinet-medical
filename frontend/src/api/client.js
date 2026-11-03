import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/app')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/connexion'
      }
    }
    return Promise.reject(error)
  }
)

export function validationMessage(error) {
  if (!error) return 'Une erreur est survenue.'
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(' ')
  }
  return error.response?.data?.message || error.message || 'Une erreur est survenue.'
}

export async function downloadPdf(url, filename = 'document.pdf') {
  const token = localStorage.getItem('token')
  const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error('Erreur lors du téléchargement du PDF.')
  }
  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(blobUrl)
}

export default api
