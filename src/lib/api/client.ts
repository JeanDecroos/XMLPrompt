import axios, { AxiosError } from 'axios'
import { ENV } from '../../env'

export const api = axios.create({
  baseURL: ENV.API_BASE_URL || 'http://localhost:3002',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data,
      message: error.message || 'Request failed',
    })
  }
)

export default api


