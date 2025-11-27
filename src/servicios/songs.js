import { reactive } from 'vue'
import api, { handleResponse, handleError } from './api'

const state = reactive({
  canciones: [],
  cargando: false,
})

// Función para normalizar la canción del backend al formato del frontend
function normalizarCancion(cancion) {
  return {
    id: cancion.id,
    titulo: cancion.titulo || '',
    artista: cancion.artista || '',
    album: cancion.album || '',
    genero: cancion.genero || '',
    duracion: cancion.duracion || '00:00', // El backend devuelve en formato mm:ss
    url: cancion.url || '',
    portada: cancion.portada || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    descripcion: cancion.descripcion || '',
    fechaLanzamiento: cancion.fechaLanzamiento || null,
  }
}

// Cargar canciones del backend
async function cargarCanciones() {
  if (state.cargando) return
  
  state.cargando = true
  try {
    const response = await api.get('/api/song/songs')
    // El backend devuelve { OK, payload, message } - extraer payload
    const canciones = response.data.payload || response.data || []
    state.canciones = Array.isArray(canciones) ? canciones.map(normalizarCancion) : []
  } catch (error) {
    // Solo mostrar error si no es 401 (no autenticado)
    if (error.response?.status !== 401) {
      console.error('Error al cargar canciones:', error)
      handleError(error)
    }
    // No limpiar canciones si es 401, mantener las que ya están
    if (error.response?.status === 401) {
      // Usuario no autenticado, no hacer nada
      return
    }
    state.canciones = []
  } finally {
    state.cargando = false
  }
}

// NO cargar canciones automáticamente - esperar a que el usuario esté autenticado

export const songsService = {
  obtenerTodas() {
    // Retornar las canciones que ya están cargadas
    // No cargar automáticamente - debe llamarse explícitamente con recargar()
    return state.canciones
  },

  async recargar() {
    await cargarCanciones()
    return state.canciones
  },

  buscarPorId(id) {
    return state.canciones.find((cancion) => cancion.id === id) ?? null
  },

  async obtenerPorId(id) {
    // Primero buscar en el estado local
    const cancionLocal = this.buscarPorId(id)
    if (cancionLocal) {
      return cancionLocal
    }
    
    // Si no está en el estado local, obtener del backend
    try {
      const response = await api.get(`/api/song/${id}`)
      const data = handleResponse(response)
      const cancion = response.data.playload || data
      return normalizarCancion(cancion)
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async crear(datos) {
    try {
      const response = await api.post('/api/song/create', {
        titulo: datos.titulo,
        artista: datos.artista,
        album: datos.album || '',
        genero: datos.genero || '',
        duracion: datos.duracion || 0,
        url: datos.url || '',
        portada: datos.portada || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        descripcion: datos.descripcion || '',
        fecha_lanzamiento: datos.fechaLanzamiento || null,
      })
      
      const data = handleResponse(response)
      const nuevaCancion = normalizarCancion(response.data.payload || data)
      
      // Agregar a la lista local
      state.canciones.push(nuevaCancion)
      
      return nuevaCancion
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async actualizar(id, datos) {
    try {
      const response = await api.patch(`/api/song/${id}`, {
        titulo: datos.titulo,
        artista: datos.artista,
        album: datos.album,
        genero: datos.genero,
        duracion: datos.duracion,
        url: datos.url,
        portada: datos.portada,
        descripcion: datos.descripcion,
        fecha_lanzamiento: datos.fechaLanzamiento,
      })
      
      const data = handleResponse(response)
      const cancionActualizada = normalizarCancion(response.data.newDataSong || data)
      
      // Actualizar en la lista local
      const indice = state.canciones.findIndex((c) => c.id === id)
      if (indice !== -1) {
        state.canciones[indice] = cancionActualizada
      } else {
        state.canciones.push(cancionActualizada)
      }
      
      return cancionActualizada
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async eliminar(id) {
    try {
      await api.delete(`/api/song/${id}`)
      
      // Eliminar de la lista local
      const indice = state.canciones.findIndex((cancion) => cancion.id === id)
      if (indice !== -1) {
        state.canciones.splice(indice, 1)
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  async reproducir(id) {
    try {
      await api.post(`/api/song/play/${id}`)
    } catch (error) {
      // No lanzar error si falla la reproducción, solo registrar
      console.warn('Error al registrar reproducción:', error)
    }
  },
}
