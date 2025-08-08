import axios from 'axios'

export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  // attach auth token if available
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize error shape
    return Promise.reject({
      status: err?.response?.status,
      data: err?.response?.data,
      message: err?.message || 'Request failed',
    })
  }
)

export default api


