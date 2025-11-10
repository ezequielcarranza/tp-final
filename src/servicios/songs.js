import { reactive } from 'vue'
import { loadState, saveState } from './storage'

const SONGS_KEY = 'spotify-songs'

const cancionesIniciales = [
  {
    id: 'song-001',
    titulo: 'The Scientist',
    artista: 'Coldplay',
    album: 'A Rush of Blood to the Head',
    genero: 'Rock Alternativo',
    duracion: '05:09',
    url: '/audio/Coldplay - The Scientist (Official 4K Video).mp3',
    portada:
      'https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Balada icónica cargada de emoción y arreglos minimalistas.',
  },
  {
    id: 'song-002',
    titulo: 'November Rain',
    artista: "Guns N' Roses",
    album: 'Use Your Illusion I',
    genero: 'Rock',
    duracion: '08:57',
    url: "/audio/Guns N' Roses - November Rain.mp3",
    portada:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    descripcion: 'Power ballad épica con arreglos orquestales y solos memorables.',
  },
]

const state = reactive({
  canciones: loadState(SONGS_KEY, cancionesIniciales),
})

function persistir() {
  saveState(SONGS_KEY, state.canciones)
}

function generarId() {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return `song-${random}`
}

export const songsService = {
  obtenerTodas() {
    return state.canciones
  },

  buscarPorId(id) {
    return state.canciones.find((cancion) => cancion.id === id) ?? null
  },

  crear(datos) {
    const portada =
      datos.portada?.trim() ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'
    const nuevaCancion = {
      id: generarId(),
      ...datos,
      portada,
    }
    state.canciones.push(nuevaCancion)
    persistir()
    return nuevaCancion
  },

  actualizar(id, datos) {
    const cancion = this.buscarPorId(id)
    if (!cancion) {
      throw new Error('La canción no existe.')
    }
    Object.assign(cancion, datos)
    persistir()
    return cancion
  },

  eliminar(id) {
    const indice = state.canciones.findIndex((cancion) => cancion.id === id)
    if (indice === -1) {
      throw new Error('La canción no existe.')
    }
    state.canciones.splice(indice, 1)
    persistir()
  },
}

