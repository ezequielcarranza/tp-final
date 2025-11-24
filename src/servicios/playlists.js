import { reactive } from 'vue'
import api, { handleResponse, handleError } from './api'
import { songsService } from './songs'

const state = reactive({
  playlists: [],
  cargando: false,
})

// Función para normalizar la playlist del backend al formato del frontend
function normalizarPlaylist(playlist, canciones = []) {
  return {
    id: playlist.id,
    nombre: playlist.nombre || '',
    descripcion: playlist.descripcion || null,
    ownerId: playlist.ownerId || null,
    creadaEn: playlist.createdAt || playlist.creadaEn || new Date().toISOString(),
    cancionIds: canciones.map((c) => c.id || c),
    esDefault: playlist.esDefault || false,
  }
}

// Cargar playlists del backend
async function cargarPlaylists() {
  if (state.cargando) return
  
  state.cargando = true
  try {
    const response = await api.get('/api/playlist/playlists')
    const data = handleResponse(response)
    const playlists = response.data.payload || data || []
    
    // Cargar canciones para cada playlist
    const playlistsConCanciones = await Promise.all(
      playlists.map(async (playlist) => {
        try {
          const songsResponse = await api.get(`/api/playlist/playlists/${playlist.id}/songs`)
          const songsData = handleResponse(songsResponse)
          const canciones = songsData.canciones || []
          return normalizarPlaylist(playlist, canciones)
        } catch (error) {
          // Si falla, usar playlist sin canciones
          return normalizarPlaylist(playlist, [])
        }
      }),
    )
    
    state.playlists = playlistsConCanciones
  } catch (error) {
    // Solo mostrar error si no es 401 (no autenticado)
    if (error.response?.status !== 401) {
      console.error('Error al cargar playlists:', error)
      handleError(error)
    }
    // No limpiar playlists si es 401, mantener las que ya están
    if (error.response?.status === 401) {
      // Usuario no autenticado, no hacer nada
      return
    }
    state.playlists = []
  } finally {
    state.cargando = false
  }
}

// Cargar playlists al iniciar (solo si hay usuario autenticado)
// Esto se hará cuando se llame a obtenerPorUsuario

export const playlistService = {
  async listar() {
    await cargarPlaylists()
    return state.playlists
  },

  obtenerPorId(id) {
    return state.playlists.find((playlist) => playlist.id === id) ?? null
  },

  async obtenerPorUsuario(userId) {
    // Cargar playlists si no están cargadas
    if (state.playlists.length === 0 && !state.cargando) {
      await cargarPlaylists()
    }
    
    // Filtrar por usuario
    return state.playlists.filter((playlist) => playlist.ownerId === userId)
  },

  async crear({ nombre, descripcion, ownerId, canciones = [], esDefault = false }) {
    if (!ownerId) {
      throw new Error('La playlist debe pertenecer a un usuario.')
    }
    
    try {
      const response = await api.post('/api/playlist/playlists', {
        nombre,
        descripcion: descripcion || null,
      })
      
      const data = handleResponse(response)
      const nuevaPlaylist = response.data.payload || data
      
      // Agregar canciones si se proporcionaron
      if (canciones.length > 0) {
        for (const cancionId of canciones) {
          try {
            await api.post(`/api/playlist/playlists/${nuevaPlaylist.id}/songs`, {
              songId: cancionId,
            })
          } catch (error) {
            console.warn(`No se pudo agregar la canción ${cancionId} a la playlist:`, error)
          }
        }
      }
      
      // Recargar playlists para obtener la versión completa
      await cargarPlaylists()
      
      const playlistCompleta = this.obtenerPorId(nuevaPlaylist.id)
      return playlistCompleta || normalizarPlaylist(nuevaPlaylist, canciones)
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async actualizar(id, { nombre, descripcion }, opciones) {
    try {
      const response = await api.patch(`/api/playlist/playlists/${id}`, {
        nombre,
        descripcion: descripcion || null,
      })
      
      const data = handleResponse(response)
      const playlistActualizada = response.data.payload || data
      
      // Actualizar en la lista local
      const indice = state.playlists.findIndex((p) => p.id === id)
      if (indice !== -1) {
        // Mantener las canciones existentes
        const cancionesActuales = state.playlists[indice].cancionIds
        state.playlists[indice] = normalizarPlaylist(playlistActualizada, cancionesActuales)
      } else {
        // Si no está en la lista, recargar todas
        await cargarPlaylists()
      }
      
      return this.obtenerPorId(id)
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async eliminar(id, opciones) {
    try {
      await api.delete(`/api/playlist/playlists/${id}`)
      
      // Eliminar de la lista local
      const indice = state.playlists.findIndex((playlist) => playlist.id === id)
      if (indice !== -1) {
        state.playlists.splice(indice, 1)
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async agregarCancion(playlistId, cancionId, opciones) {
    try {
      await api.post(`/api/playlist/playlists/${playlistId}/songs`, {
        songId: cancionId,
      })
      
      // Actualizar en la lista local
      const playlist = this.obtenerPorId(playlistId)
      if (playlist && !playlist.cancionIds.includes(cancionId)) {
        playlist.cancionIds.push(cancionId)
      } else {
        // Si no está en la lista, recargar
        await cargarPlaylists()
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async quitarCancion(playlistId, cancionId, opciones) {
    try {
      await api.delete(`/api/playlist/playlists/${playlistId}/songs/${cancionId}`)
      
      // Actualizar en la lista local
      const playlist = this.obtenerPorId(playlistId)
      if (playlist) {
        playlist.cancionIds = playlist.cancionIds.filter((id) => id !== cancionId)
      } else {
        // Si no está en la lista, recargar
        await cargarPlaylists()
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  removerCancionDeTodas(cancionId) {
    // Actualizar todas las playlists localmente
    let huboCambios = false
    state.playlists.forEach((playlist) => {
      if (playlist.cancionIds.includes(cancionId)) {
        playlist.cancionIds = playlist.cancionIds.filter((id) => id !== cancionId)
        huboCambios = true
      }
    })
    // Nota: No se hace llamada al backend porque esto debería manejarse cuando se elimina la canción
  },

  async eliminarPorUsuario(userId) {
    // Obtener todas las playlists del usuario y eliminarlas
    const playlistsUsuario = this.obtenerPorUsuario(userId)
    for (const playlist of playlistsUsuario) {
      try {
        await this.eliminar(playlist.id, { ownerId: userId, esAdmin: false })
      } catch (error) {
        console.warn(`No se pudo eliminar la playlist ${playlist.id}:`, error)
      }
    }
  },
}
