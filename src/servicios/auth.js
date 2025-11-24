import { reactive, computed } from 'vue'
import api, { tokenService, handleResponse, handleError } from './api'
import { playlistService } from './playlists'

const SESSION_KEY = 'spotify-session'

const state = reactive({
  usuarioActual: null,
})

// Cargar usuario del token si existe
function loadUserFromToken() {
  const token = tokenService.getToken()
  if (token) {
    try {
      // Decodificar el token JWT (sin verificar, solo para obtener datos)
      const payload = JSON.parse(atob(token.split('.')[1]))
      state.usuarioActual = {
        id: payload.subject,
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: payload.email,
        rol: payload.role?.toLowerCase() || 'usuario',
      }
    } catch (error) {
      // Si hay error al decodificar, limpiar token
      tokenService.clearToken()
    }
  }
}

// Cargar usuario al iniciar
loadUserFromToken()

export const authState = {
  usuarioActual: computed(() => state.usuarioActual),
}

export const authService = {
  async login({ email, password }) {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const data = handleResponse(response)
      
      // Guardar token
      if (response.data.token) {
        tokenService.setToken(response.data.token)
      }
      
      // Actualizar usuario actual
      const user = response.data.payload || data
      state.usuarioActual = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido || '',
        email: user.email,
        rol: user.role?.toLowerCase() || 'usuario',
      }
      
      return state.usuarioActual
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  logout() {
    state.usuarioActual = null
    tokenService.clearToken()
  },

  async registrar({ nombre, email, password }) {
    try {
      // El backend requiere nombre, apellido, email, fecha_nacimiento, password
      // Si no se proporciona apellido, usar el nombre como apellido
      // Si no se proporciona fecha_nacimiento, usar una fecha por defecto (18 años atrás)
      const nombreCompleto = nombre.trim().split(' ')
      const primerNombre = nombreCompleto[0] || nombre
      const apellido = nombreCompleto.slice(1).join(' ') || primerNombre
      
      // Calcular fecha de nacimiento (18 años atrás por defecto)
      const fechaNacimiento = new Date()
      fechaNacimiento.setFullYear(fechaNacimiento.getFullYear() - 18)
      const fechaNacimientoStr = fechaNacimiento.toISOString().split('T')[0]
      
      const response = await api.post('/api/user/create', {
        nombre: primerNombre,
        apellido: apellido,
        email: email,
        fecha_nacimiento: fechaNacimientoStr,
        password: password,
      })
      
      const data = handleResponse(response)
      const nuevoUsuario = response.data.payload || data
      
      // Crear playlist por defecto
      try {
        // Primero necesitamos hacer login para obtener el token
        await this.login({ email, password })
        
        // Luego crear la playlist favoritos
        await playlistService.crear({
          nombre: 'Favoritos',
          descripcion: 'Tu lista personal de favoritos.',
          ownerId: nuevoUsuario.id,
          esDefault: true,
        })
      } catch (error) {
        console.warn('No se pudo crear la playlist por defecto:', error)
      }
      
      return {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido || '',
        email: nuevoUsuario.email,
        rol: nuevoUsuario.role?.toLowerCase() || 'usuario',
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async actualizarPerfil(id, datosParciales) {
    try {
      const response = await api.patch(`/api/user/${id}`, datosParciales)
      const data = handleResponse(response)
      const usuarioActualizado = response.data.newDataUser || data
      
      // Actualizar usuario actual si es el mismo
      if (state.usuarioActual?.id === id) {
        state.usuarioActual = {
          ...state.usuarioActual,
          ...usuarioActualizado,
          rol: usuarioActualizado.role?.toLowerCase() || state.usuarioActual.rol,
        }
      }
      
      return {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        apellido: usuarioActualizado.apellido || '',
        email: usuarioActualizado.email,
        rol: usuarioActualizado.role?.toLowerCase() || 'usuario',
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async eliminarUsuario(id) {
    try {
      await api.delete(`/api/user/${id}`)
      
      // Si es el usuario actual, cerrar sesión
      if (state.usuarioActual?.id === id) {
        this.logout()
      }
      
      // Eliminar playlists del usuario
      try {
        const playlists = await playlistService.obtenerPorUsuario(id)
        for (const playlist of playlists) {
          await playlistService.eliminar(playlist.id, { ownerId: id, esAdmin: false })
        }
      } catch (error) {
        console.warn('No se pudieron eliminar las playlists del usuario:', error)
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  isAuthenticated() {
    return Boolean(state.usuarioActual && tokenService.getToken())
  },

  isAdmin() {
    const usuario = state.usuarioActual
    return usuario?.rol === 'admin' || usuario?.rol === 'ADMIN'
  },

  async getUsuarios() {
    try {
      const response = await api.get('/api/user/users')
      const data = handleResponse(response)
      return response.data.payload || data
    } catch (error) {
      handleError(error)
      throw error
    }
  },
}
