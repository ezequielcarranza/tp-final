import { reactive } from 'vue'
import { loadState, saveState } from './storage'
import { songsService } from './songs'

const PLAYLISTS_KEY = 'spotify-playlists'

const playlistsIniciales = [
  {
    id: 'pl-001',
    nombre: 'Favoritas del Admin',
    descripcion: 'Canciones para demostrar la demo.',
    ownerId: 'user-admin',
    creadaEn: new Date().toISOString(),
    cancionIds: ['song-001', 'song-002'],
    esDefault: false,
  },
]

const state = reactive({
  playlists: loadState(PLAYLISTS_KEY, playlistsIniciales),
})

function persistir() {
  saveState(PLAYLISTS_KEY, state.playlists)
}

function generarId() {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return `pl-${random}`
}

function formatearOpciones(opciones) {
  if (typeof opciones === 'string') {
    return { ownerId: opciones, esAdmin: false }
  }
  return {
    ownerId: opciones?.ownerId ?? null,
    esAdmin: Boolean(opciones?.esAdmin),
  }
}

function asegurarPermiso(playlist, opciones, mensajePersonalizado) {
  const { ownerId, esAdmin } = formatearOpciones(opciones)
  if (esAdmin) return
  if (ownerId && playlist.ownerId === ownerId) return
  throw new Error(
    mensajePersonalizado ??
      'Solo el dueño de la playlist o un administrador puede realizar esta acción.',
  )
}

function reemplazarPlaylists(nuevasPlaylists) {
  state.playlists.splice(0, state.playlists.length, ...nuevasPlaylists)
}

export const playlistService = {
  listar() {
    return state.playlists
  },

  obtenerPorId(id) {
    return state.playlists.find((playlist) => playlist.id === id) ?? null
  },

  obtenerPorUsuario(userId) {
    return state.playlists.filter((playlist) => playlist.ownerId === userId)
  },

  crear({ nombre, descripcion, ownerId, canciones = [], esDefault = false }) {
    if (!ownerId) {
      throw new Error('La playlist debe pertenecer a un usuario.')
    }
    const nuevaPlaylist = {
      id: generarId(),
      nombre,
      descripcion,
      ownerId,
      creadaEn: new Date().toISOString(),
      cancionIds: [],
      esDefault: Boolean(esDefault),
    }
    canciones.forEach((cancionId) => {
      if (songsService.buscarPorId(cancionId)) {
        nuevaPlaylist.cancionIds.push(cancionId)
      }
    })
    state.playlists.push(nuevaPlaylist)
    persistir()
    return nuevaPlaylist
  },

  actualizar(id, { nombre, descripcion }, opciones) {
    const playlist = this.obtenerPorId(id)
    if (!playlist) {
      throw new Error('La playlist no existe.')
    }
    asegurarPermiso(
      playlist,
      opciones,
      'Solo el dueño de la playlist o un administrador puede editarla.',
    )
    playlist.nombre = nombre ?? playlist.nombre
    playlist.descripcion = descripcion ?? playlist.descripcion
    persistir()
    return playlist
  },

  eliminar(id, opciones) {
    const indice = state.playlists.findIndex((playlist) => playlist.id === id)
    if (indice === -1) {
      throw new Error('La playlist no existe.')
    }
    const playlist = state.playlists[indice]
    if (playlist.esDefault && formatearOpciones(opciones).esAdmin) {
      throw new Error('No se puede eliminar la playlist predeterminada del usuario.')
    }
    asegurarPermiso(
      playlist,
      opciones,
      'Solo el dueño de la playlist o un administrador puede eliminarla.',
    )
    state.playlists.splice(indice, 1)
    persistir()
  },

  agregarCancion(playlistId, cancionId, opciones) {
    const playlist = this.obtenerPorId(playlistId)
    if (!playlist) {
      throw new Error('La playlist no existe.')
    }
    asegurarPermiso(
      playlist,
      opciones,
      'Solo el dueño de la playlist o un administrador puede modificarla.',
    )
    if (!songsService.buscarPorId(cancionId)) {
      throw new Error('La canción seleccionada no existe.')
    }
    if (!playlist.cancionIds.includes(cancionId)) {
      playlist.cancionIds.push(cancionId)
      persistir()
    }
  },

  quitarCancion(playlistId, cancionId, opciones) {
    const playlist = this.obtenerPorId(playlistId)
    if (!playlist) {
      throw new Error('La playlist no existe.')
    }
    asegurarPermiso(
      playlist,
      opciones,
      'Solo el dueño de la playlist o un administrador puede modificarla.',
    )
    playlist.cancionIds = playlist.cancionIds.filter((id) => id !== cancionId)
    persistir()
  },

  removerCancionDeTodas(cancionId) {
    let huboCambios = false
    state.playlists.forEach((playlist) => {
      if (playlist.cancionIds.includes(cancionId)) {
        playlist.cancionIds = playlist.cancionIds.filter((id) => id !== cancionId)
        huboCambios = true
      }
    })
    if (huboCambios) {
      persistir()
    }
  },

  eliminarPorUsuario(userId) {
    const restantes = state.playlists.filter((playlist) => playlist.ownerId !== userId)
    if (restantes.length !== state.playlists.length) {
      reemplazarPlaylists(restantes)
      persistir()
    }
  },
}

