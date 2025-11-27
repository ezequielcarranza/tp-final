<template>
  <section>
    <header class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h1 class="h3 text-white mb-1">Biblioteca de canciones</h1>
        <p class="text-white-50 mb-0">
          Escuchá las canciones disponibles y añadí tus favoritas a playlists personales.
        </p>
      </div>
      <RouterLink
        v-if="esAdmin"
        class="btn btn-outline-light"
        :to="{ name: 'admin-canciones' }"
      >
        Gestionar biblioteca
      </RouterLink>
    </header>

    <div class="card border-0 shadow-sm bg-dark-subtle mb-4">
      <div class="card-body bg-dark-subtle">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="search"
                v-model.trim="terminoBusqueda"
                class="form-control"
                placeholder="Buscar por título, artista o género"
              />
            </div>
          </div>
          <div class="col-md-6" v-if="playlistsUsuario.length">
            <div class="input-group">
              <label class="input-group-text" for="playlist-select">
                <i class="bi bi-music-note-list me-2"></i>Agregar a playlist
              </label>
              <select
                id="playlist-select"
                class="form-select"
                v-model="playlistSeleccionada"
              >
                <option disabled value="">Seleccioná una playlist</option>
                <option v-for="playlist in playlistsUsuario" :key="playlist.id" :value="playlist.id">
                  {{ playlist.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mensaje" class="alert" :class="mensajeEsError ? 'alert-danger' : 'alert-success'">
      {{ mensaje }}
    </div>

    <div v-if="cancionesFiltradas.length === 0" class="text-center text-secondary py-5">
      <p class="mb-0">No encontramos canciones con ese criterio de búsqueda.</p>
    </div>

    <div class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="cancion in cancionesFiltradas" :key="cancion.id">
        <div class="song-card card border-0 h-100">
          <img :src="cancion.portada" class="card-img-top song-card__cover" :alt="`Portada de ${cancion.titulo}`" />
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 class="h5 text-white mb-1">{{ cancion.titulo }}</h2>
                <p class="mb-1 text-white-50">{{ cancion.artista }} • {{ cancion.album }}</p>
                <span class="badge text-bg-dark border">{{ cancion.genero }}</span>
              </div>
              <div class="d-flex align-items-start gap-2">
                <span class="badge rounded-pill text-bg-success">{{ cancion.duracion }}</span>
              </div>
            </div>

            <p class="text-white-50 small mb-3">{{ cancion.descripcion }}</p>

            <audio
              v-if="cancion.url"
              class="w-100 mb-3"
              controls
              :src="cancion.url"
              @play="registrarReproduccion(cancion.id)"
            >
              Tu navegador no soporta audio HTML5.
            </audio>
            <div v-else class="alert alert-warning small mb-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Audio no disponible
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <button
                type="button"
                class="btn btn-outline-light me-2"
                :disabled="!playlistSeleccionada"
                @click="agregarCancionAPlaylist(cancion.id)"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Agregar a playlist
              </button>
              <button
                v-if="playlistFavoritos"
                type="button"
                class="btn btn-outline-light favorite-btn"
                :class="{ 'is-active': esCancionFavorita(cancion.id) }"
                :aria-pressed="esCancionFavorita(cancion.id)"
                :title="esCancionFavorita(cancion.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'"
                @click="alternarFavorito(cancion.id)"
              >
                <i :class="['bi', esCancionFavorita(cancion.id) ? 'bi-heart-fill' : 'bi-heart']"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, watchEffect, onMounted } from 'vue'
import { authState } from '../servicios/auth'
import { songsService } from '../servicios/songs'
import { playlistService } from '../servicios/playlists'

const usuario = computed(() => authState.usuarioActual.value)
const esAdmin = computed(() => usuario.value?.rol === 'admin')

const terminoBusqueda = ref('')
const playlistSeleccionada = ref('')
const mensaje = ref('')
const mensajeEsError = ref(false)
const playlistFavoritosId = ref('')
const playlistsUsuario = ref([])

// Cargar canciones al montar el componente solo si el usuario está autenticado
onMounted(async () => {
  if (usuario.value) {
    try {
      await songsService.recargar()
    } catch (error) {
      // Solo mostrar error si no es 401 (no autenticado)
      if (error.response?.status !== 401) {
        console.error('Error al cargar canciones:', error)
      }
    }
  }
})

// Cargar canciones cuando el usuario se autentica
watch(
  () => usuario.value?.id,
  async (userId) => {
    if (userId) {
      try {
        await songsService.recargar()
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Error al cargar canciones:', error)
        }
      }
    }
  },
)

watch(
  () => usuario.value?.id,
  () => {
    playlistSeleccionada.value = ''
    cargarPlaylists()
  },
)

async function cargarPlaylists() {
  const userId = usuario.value?.id
  if (!userId) {
    playlistsUsuario.value = []
    playlistFavoritosId.value = ''
    return
  }
  
  try {
    const playlists = await playlistService.obtenerPorUsuario(userId)
    
    // Buscar playlist "Favoritos" por nombre (no por esDefault ya que no existe en la BD)
    let favoritos = playlists.find((playlist) => playlist.nombre === 'Favoritos')
    
    // Si no existe, no la creamos aquí (solo se crea durante el registro)
    // Esto evita crear múltiples playlists "Favoritos"
    if (favoritos) {
      playlistFavoritosId.value = favoritos.id
      // Filtrar playlists excluyendo "Favoritos"
      playlistsUsuario.value = playlists.filter((playlist) => playlist.nombre !== 'Favoritos')
    } else {
      playlistFavoritosId.value = ''
      playlistsUsuario.value = playlists
    }
  } catch (error) {
    console.error('Error al cargar playlists:', error)
  }
}

// Cargar playlists cuando hay usuario
watchEffect(() => {
  if (usuario.value?.id) {
    cargarPlaylists()
  }
})

const playlistFavoritos = computed(() => {
  if (!playlistFavoritosId.value) return null
  return playlistService.obtenerPorId(playlistFavoritosId.value)
})

const cancionesFiltradas = computed(() => {
  const termino = terminoBusqueda.value.toLowerCase().trim()
  const canciones = songsService.obtenerTodas()
  
  if (!termino) return canciones
  
  return canciones.filter((cancion) => {
    const tokens = [cancion.titulo, cancion.artista, cancion.genero, cancion.album]
    return tokens.some((token) => {
      // Asegurar que token es string antes de aplicar toLowerCase
      if (!token || typeof token !== 'string') return false
      return token.toLowerCase().includes(termino)
    })
  })
})

function mostrarMensaje(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
  setTimeout(() => {
    mensaje.value = ''
    mensajeEsError.value = false
  }, 3000)
}

async function agregarCancionAPlaylist(cancionId) {
  if (!playlistSeleccionada.value) {
    mostrarMensaje('Seleccioná una playlist primero.', true)
    return
  }
  try {
    await playlistService.agregarCancion(
      playlistSeleccionada.value,
      cancionId,
      usuario.value?.id,
    )
    mostrarMensaje('Canción agregada correctamente.')
    // Recargar playlists para actualizar la vista
    await cargarPlaylists()
  } catch (error) {
    mostrarMensaje(error.message, true)
  }
}

function esCancionFavorita(cancionId) {
  return Boolean(playlistFavoritos.value?.cancionIds.includes(cancionId))
}

async function alternarFavorito(cancionId) {
  if (!playlistFavoritos.value) {
    mostrarMensaje('No encontramos tu playlist de favoritos.', true)
    return
  }
  try {
    if (esCancionFavorita(cancionId)) {
      await playlistService.quitarCancion(
        playlistFavoritos.value.id,
        cancionId,
        usuario.value?.id,
      )
      mostrarMensaje('Canción quitada de Favoritos.')
    } else {
      await playlistService.agregarCancion(
        playlistFavoritos.value.id,
        cancionId,
        usuario.value?.id,
      )
      mostrarMensaje('Canción agregada a Favoritos.')
    }
    // Recargar playlists para actualizar la vista
    await cargarPlaylists()
  } catch (error) {
    mostrarMensaje(error.message, true)
  }
}

async function registrarReproduccion(cancionId) {
  if (!usuario.value?.id) return
  try {
    await songsService.reproducir(cancionId)
  } catch (error) {
    // No mostrar error al usuario, solo registrar en consola
    console.warn('Error al registrar reproducción:', error)
  }
}
</script>

<style scoped>
.song-card {
  background: rgba(33, 33, 33, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.song-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

.song-card__cover {
  height: 200px;
  object-fit: cover;
}

.favorite-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.favorite-btn i {
  font-size: 1.1rem;
}

.favorite-btn:hover {
  color: #dc3545;
  border-color: rgba(220, 53, 69, 0.4);
}

.favorite-btn.is-active {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.12);
  border-color: rgba(220, 53, 69, 0.5) !important;
}

.favorite-btn.is-active:hover {
  border-color: rgba(220, 53, 69, 0.6) !important;
}

audio {
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
}
</style>

