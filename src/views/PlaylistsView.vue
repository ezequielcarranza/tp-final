<template>
  <section>
    <header class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h1 class="h3 text-white mb-1">Tus playlists</h1>
        <p class="text-white-50 mb-0">
          Organizá tus canciones favoritas en playlists personalizadas.
        </p>
      </div>
      <RouterLink class="btn btn-outline-light" :to="{ name: 'canciones' }">
        Explorar canciones
      </RouterLink>
    </header>

    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card border-0 crear-playlist-card">
          <div class="card-body">
            <h2 class="h5 text-white mb-3">Crear nueva playlist</h2>
            <form @submit.prevent="crearPlaylist">
              <div class="mb-3">
                <label class="form-label text-white-50">Nombre</label>
                <input
                  v-model="form.nombre"
                  type="text"
                  class="form-control"
                  placeholder="Ej. Rutina Gym"
                  required
                  minlength="3"
                />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Descripción</label>
                <textarea
                  v-model="form.descripcion"
                  class="form-control"
                  rows="3"
                  placeholder="Contanos de qué se trata la playlist"
                ></textarea>
              </div>
              <button class="btn btn-success w-100" type="submit">
                <i class="bi bi-plus-circle me-2"></i>
                Crear playlist
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div v-if="mensaje" class="alert" :class="mensajeEsError ? 'alert-danger' : 'alert-success'">
          {{ mensaje }}
        </div>

        <div v-if="playlists.length === 0" class="text-center text-secondary py-5 crear-playlist-card">
          <p class="mb-0">
            Todavía no creaste playlists. Comenzá usando el formulario a la izquierda.
          </p>
        </div>

        <div v-else>
          <div class="d-flex overflow-auto gap-3 mb-4 pb-2">
            <button
              v-for="playlist in playlists"
              :key="playlist.id"
              class="btn playlist-pill"
              :class="{
                'btn-success': playlist.id === playlistActivaId,
                'btn-outline-light': playlist.id !== playlistActivaId,
              }"
              @click="seleccionarPlaylist(playlist.id)"
            >
              {{ playlist.nombre }}
              <span class="badge text-bg-dark ms-2">{{ playlist.cancionIds.length }}</span>
            </button>
          </div>

          <div class="playlist-detalle card border-0">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 class="h4 text-white mb-1">{{ playlistSeleccionada?.nombre }}</h2>
                  <p class="text-white-50 mb-0">
                    {{ playlistSeleccionada?.descripcion || 'Sin descripción' }}
                  </p>
                </div>
                <button class="btn btn-outline-danger btn-sm" @click="eliminarPlaylistSeleccionada">
                  <i class="bi bi-trash me-2"></i>
                  Eliminar playlist
                </button>
              </div>

              <div v-if="cancionesPlaylist.length === 0" class="text-center text-secondary py-5">
                <p class="mb-0">
                  Esta playlist está vacía. Agregá canciones desde la biblioteca.
                </p>
              </div>

              <div class="list-group list-group-flush">
                <div
                  v-for="cancion in cancionesPlaylist"
                  :key="cancion.id"
                  class="list-group-item bg-transparent text-white d-flex flex-column gap-3"
                >
                  <div class="d-flex align-items-center gap-3">
                    <img :src="cancion.portada" alt="" class="cover rounded" />
                    <div class="flex-grow-1">
                      <h3 class="h6 mb-1">{{ cancion.titulo }}</h3>
                      <p class="mb-0 text-white-50">
                        {{ cancion.artista }} • {{ cancion.album }} • {{ cancion.genero }}
                      </p>
                    </div>
                    <button
                      class="btn btn-outline-light btn-sm"
                      @click="quitarCancion(cancion.id)"
                    >
                      <i class="bi bi-dash-circle"></i>
                    </button>
                  </div>
                  <audio
                    v-if="cancion.url"
                    class="w-50 mb-3"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authState } from '../servicios/auth'
import { playlistService } from '../servicios/playlists'
import { songsService } from '../servicios/songs'

const route = useRoute()
const router = useRouter()

const usuario = computed(() => authState.usuarioActual.value)
const playlists = ref([])

// Cargar playlists cuando hay usuario
watch(
  () => usuario.value?.id,
  async (userId) => {
    if (userId) {
      try {
        playlists.value = await playlistService.obtenerPorUsuario(userId)
      } catch (error) {
        console.error('Error al cargar playlists:', error)
        playlists.value = []
      }
    } else {
      playlists.value = []
    }
  },
  { immediate: true },
)

const form = reactive({
  nombre: '',
  descripcion: '',
})

const mensaje = ref('')
const mensajeEsError = ref(false)

const playlistActivaId = ref('')

watch(
  () => route.query.playlistId,
  (id) => {
    if (typeof id === 'string' && playlists.value.some((pl) => pl.id === id)) {
      playlistActivaId.value = id
    } else if (!playlistActivaId.value && playlists.value.length) {
      playlistActivaId.value = playlists.value[0].id
    }
  },
  { immediate: true },
)

watch(
  playlists,
  (nuevas) => {
    if (nuevas.length === 0) {
      playlistActivaId.value = ''
      return
    }
    if (!nuevas.some((pl) => pl.id === playlistActivaId.value)) {
      playlistActivaId.value = nuevas[0].id
    }
  },
  { immediate: true },
)

const playlistSeleccionada = computed(() =>
  playlists.value.find((playlist) => playlist.id === playlistActivaId.value) ?? null,
)

const cancionesPlaylist = computed(() => {
  if (!playlistSeleccionada.value) return []
  return playlistSeleccionada.value.cancionIds
    .map((id) => songsService.buscarPorId(id))
    .filter(Boolean)
})

function mostrarMensaje(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
  setTimeout(() => {
    mensaje.value = ''
    mensajeEsError.value = false
  }, 3000)
}

function seleccionarPlaylist(id) {
  playlistActivaId.value = id
  router.replace({ query: { ...route.query, playlistId: id } })
}

async function crearPlaylist() {
  try {
    const playlist = await playlistService.crear({
      nombre: form.nombre,
      descripcion: form.descripcion,
      ownerId: usuario.value?.id,
    })
    form.nombre = ''
    form.descripcion = ''
    // Recargar playlists
    playlists.value = await playlistService.obtenerPorUsuario(usuario.value.id)
    seleccionarPlaylist(playlist.id)
    mostrarMensaje('Playlist creada correctamente.')
  } catch (error) {
    mostrarMensaje(error.message, true)
  }
}

async function eliminarPlaylistSeleccionada() {
  if (!playlistSeleccionada.value) return
  try {
    await playlistService.eliminar(playlistSeleccionada.value.id, usuario.value?.id)
    // Recargar playlists
    playlists.value = await playlistService.obtenerPorUsuario(usuario.value.id)
    mostrarMensaje('Playlist eliminada.')
  } catch (error) {
    mostrarMensaje(error.message, true)
  }
}

async function quitarCancion(cancionId) {
  if (!playlistSeleccionada.value) return
  try {
    await playlistService.quitarCancion(
      playlistSeleccionada.value.id,
      cancionId,
      usuario.value?.id,
    )
    // Recargar playlists para actualizar la vista
    playlists.value = await playlistService.obtenerPorUsuario(usuario.value.id)
    mostrarMensaje('Canción retirada de la playlist.')
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
.crear-playlist-card {
  background: rgba(40, 40, 40, 0.9);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 1rem;
  color: #f8f9fa;
}

.playlist-pill {
  border-radius: 999px;
  white-space: nowrap;
}

.playlist-detalle {
  background: rgba(33, 33, 33, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.cover {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px !important;
}
</style>

