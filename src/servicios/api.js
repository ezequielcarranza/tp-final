import axios from 'axios'
import { loadState, saveState, clearState } from './storage'

const TOKEN_KEY = 'spotify-token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = loadState(TOKEN_KEY, null)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      clearState(TOKEN_KEY)
      // Solo redirigir si no estamos ya en login/registro y hay una ruta definida
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const isPublicRoute = currentPath === '/login' || currentPath === '/registro'
        if (!isPublicRoute) {
          // Solo redirigir si hay un token (significa que expiró o es inválido)
          const token = loadState(TOKEN_KEY, null)
          if (token) {
            window.location.href = '/login'
          }
        }
      }
    }
    return Promise.reject(error)
  },
)

// Funciones para manejar el token
export const tokenService = {
  getToken() {
    return loadState(TOKEN_KEY, null)
  },
  setToken(token) {
    saveState(TOKEN_KEY, token)
  },
  clearToken() {
    clearState(TOKEN_KEY)
  },
}

// Funciones auxiliares para manejar respuestas del backend
export const handleResponse = (response) => {
  const data = response.data
  // El backend devuelve { status, OK, payload, message, token }
  if (data.OK) {
    return data.payload || data
  }
  throw new Error(data.message || 'Error en la petición')
}

export const handleError = (error) => {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message)
  }
  if (error.message) {
    throw new Error(error.message)
  }
  throw new Error('Error desconocido en la petición')
}

export default api

