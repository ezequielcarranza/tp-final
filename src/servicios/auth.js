import { reactive, computed } from 'vue'
import { loadState, saveState, clearState } from './storage'
import { playlistService } from './playlists'

const USERS_KEY = 'spotify-users'
const SESSION_KEY = 'spotify-session'

const defaultUsers = [
  {
    id: 'user-admin',
    nombre: 'Administrador',
    email: 'admin@spotify.dev',
    password: 'admin123',
    rol: 'admin',
  },
  {
    id: 'user-001',
    nombre: 'Ezequiel',
    email: 'ezequiel@spotify.dev',
    password: 'user123',
    rol: 'usuario',
  },
]

const state = reactive({
  usuarios: loadState(USERS_KEY, defaultUsers),
  sesionActivaId: loadState(SESSION_KEY, null),
})

function persistUsuarios() {
  saveState(USERS_KEY, state.usuarios)
}

function persistSesion() {
  if (state.sesionActivaId) {
    saveState(SESSION_KEY, state.sesionActivaId)
  } else {
    clearState(SESSION_KEY)
  }
}

function buscarUsuarioPorEmail(email) {
  return state.usuarios.find((usuario) => usuario.email === email)
}

function generarId() {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return `user-${random}`
}

export const authState = {
  usuarios: computed(() => state.usuarios),
  usuarioActual: computed(() =>
    state.usuarios.find((usuario) => usuario.id === state.sesionActivaId) ?? null,
  ),
}

export const authService = {
  login({ email, password }) {
    const usuario = buscarUsuarioPorEmail(email)
    if (!usuario) {
      throw new Error('No existe un usuario con ese email.')
    }
    if (usuario.password !== password) {
      throw new Error('La contraseña no es correcta.')
    }
    state.sesionActivaId = usuario.id
    persistSesion()
    return usuario
  },

  logout() {
    state.sesionActivaId = null
    persistSesion()
  },

  registrar({ nombre, email, password }) {
    const existente = buscarUsuarioPorEmail(email)
    if (existente) {
      throw new Error('Ya existe un usuario registrado con ese email.')
    }
    const nuevoUsuario = {
      id: generarId(),
      nombre,
      email,
      password,
      rol: 'usuario',
    }
    state.usuarios.push(nuevoUsuario)
    persistUsuarios()
    return nuevoUsuario
  },

  actualizarPerfil(id, datosParciales) {
    const usuario = state.usuarios.find((item) => item.id === id)
    if (!usuario) {
      throw new Error('El usuario no existe.')
    }
    Object.assign(usuario, datosParciales)
    persistUsuarios()
    return usuario
  },

  eliminarUsuario(id) {
    const usuario = state.usuarios.find((item) => item.id === id)
    if (!usuario) {
      throw new Error('El usuario no existe.')
    }
    if (usuario.rol === 'admin') {
      throw new Error('No es posible eliminar la cuenta del administrador.')
    }
    const indice = state.usuarios.findIndex((item) => item.id === id)
    if (indice === -1) {
      throw new Error('El usuario no existe.')
    }
    state.usuarios.splice(indice, 1)
    persistUsuarios()
    playlistService.eliminarPorUsuario(id)
    if (state.sesionActivaId === id) {
      state.sesionActivaId = null
      persistSesion()
    }
  },

  isAuthenticated() {
    return Boolean(state.sesionActivaId)
  },

  isAdmin() {
    const usuario = authState.usuarioActual.value
    return usuario?.rol === 'admin'
  },

  getUsuarios() {
    return state.usuarios
  },
}

