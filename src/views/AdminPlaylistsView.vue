<template>
  <section>
    <header
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <h1 class="h3 text-white mb-1">Administrar playlists</h1>
        <p class="text-white-50 mb-1">
          Editá o eliminá las playlists del usuario seleccionado.
        </p>
        <p v-if="propietario" class="text-white-50 mb-0">
          Usuario: <strong>{{ propietario.nombre }}</strong> ({{ propietario.email }})
        </p>
      </div>
      <RouterLink class="btn btn-outline-light" :to="{ name: 'admin-usuarios' }">
        Volver a usuarios
      </RouterLink>
    </header>

    <div v-if="!ownerId" class="card border-0 admin-form">
      <div class="card-body text-center text-secondary py-5">
        Seleccioná un usuario desde la vista de <strong>Administrar usuarios</strong> para ver sus
        playlists.
      </div>
    </div>

    <div v-else-if="!propietario" class="card border-0 admin-form">
      <div class="card-body text-center text-secondary py-5">
        El usuario indicado no existe. Volvé al listado de usuarios para seleccionar otro.
      </div>
    </div>

    <div v-else class="row g-4">
      <div class="col-lg-5">
        <div class="card border-0 admin-tabla">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table align-middle table-dark table-striped m-0">
                <thead>
                  <tr>
                    <th>Playlist</th>
                    <th class="text-center">Canciones</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="playlist in playlistsPropietario"
                    :key="playlist.id"
                    :class="{ 'table-active': playlist.id === playlistSeleccionadaId }"
                  >
                    <td>
                      <div class="fw-semibold text-white">{{ playlist.nombre }}</div>
                      <div class="small text-white-50">
                        {{ playlist.descripcion || 'Sin descripción' }}
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge text-bg-dark">{{ playlist.cancionIds.length }}</span>
                    </td>
                    <td class="text-end">
                      <button
                        class="btn btn-outline-light btn-sm"
                        :class="{ active: playlist.id === playlistSeleccionadaId }"
                        @click="seleccionarPlaylist(playlist.id)"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                  <tr v-if="playlistsPropietario.length === 0">
                    <td colspan="4" class="text-center text-secondary py-5">
                      No hay playlists creadas aún.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-7" v-if="playlistSeleccionada">
        <div
          v-if="mensaje"
          class="alert"
          :class="mensajeEsError ? 'alert-danger' : 'alert-success'"
        >
          {{ mensaje }}
        </div>

        <div class="card border-0 admin-form mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 class="h5 text-white mb-1">Editar playlist</h2>
                <p class="text-white-50 mb-0">
                  Propietario:
                  <strong>{{ propietario?.nombre ?? 'Desconocido' }}</strong>
                </p>
              </div>
              <button
                class="btn btn-outline-danger btn-sm"
                :disabled="!puedeEliminar"
                @click="eliminarPlaylist"
              >
                <i class="bi bi-trash me-1"></i>
                Eliminar playlist
              </button>
            </div>

            <form @submit.prevent="guardarCambios">
              <div class="mb-3">
                <label class="form-label text-white-50">Nombre</label>
                <input
                  v-model="form.nombre"
                  type="text"
                  class="form-control"
                  :disabled="!esEditable"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Descripción</label>
                <textarea
                  v-model="form.descripcion"
                  class="form-control"
                  rows="3"
                  :disabled="!esEditable"
                ></textarea>
              </div>
              <button class="btn btn-success" type="submit" :disabled="!esEditable">
                <i class="bi bi-floppy me-1"></i>
                Guardar cambios
              </button>
            </form>
          </div>
        </div>

        <div class="card border-0 admin-tabla">
          <div class="card-body">
            <h3 class="h6 text-white mb-3">Canciones de la playlist</h3>

            <div v-if="cancionesSeleccionadas.length === 0" class="text-center text-secondary py-5">
              Esta playlist no tiene canciones asignadas.
            </div>

            <div
              v-else
              class="list-group list-group-flush"
            >
              <div
                v-for="cancion in cancionesSeleccionadas"
                :key="cancion.id"
                class="list-group-item bg-transparent text-white d-flex align-items-center gap-3"
              >
                <img :src="cancion.portada" alt="" class="cover rounded" />
                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ cancion.titulo }}</div>
                  <div class="small text-white-50">
                    {{ cancion.artista }} • {{ cancion.album }}
                  </div>
                </div>
                <span class="badge text-bg-dark">{{ cancion.duracion }}</span>
                <button
                  class="btn btn-outline-light btn-sm"
                  :disabled="!esEditable"
                  @click="removerCancion(cancion.id)"
                >
                  <i class="bi bi-dash-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-7" v-else>
        <div class="card border-0 admin-form">
          <div class="card-body text-center text-secondary py-5">
            Seleccioná una playlist del listado para verla o editarla.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { playlistService } from '../servicios/playlists'
import { authState } from '../servicios/auth'
import { songsService } from '../servicios/songs'

const route = useRoute()

const ownerId = ref(typeof route.query.ownerId === 'string' ? route.query.ownerId : '')

watch(
  () => route.query.ownerId,
  (nuevo) => {
    ownerId.value = typeof nuevo === 'string' ? nuevo : ''
  },
  { immediate: true },
)

const usuarios = computed(() => authState.usuarios.value ?? [])
const usuariosPorId = computed(() => {
  return usuarios.value.reduce((acc, usuario) => {
    acc[usuario.id] = usuario
    return acc
  }, {})
})

const playlistSeleccionadaId = ref('')
const mensaje = ref('')
const mensajeEsError = ref(false)

const form = reactive({
  nombre: '',
  descripcion: '',
})

const propietario = computed(() => (ownerId.value ? usuariosPorId.value[ownerId.value] ?? null : null))

const playlistsPropietario = computed(() => {
  if (!ownerId.value) return []
  return playlistService.obtenerPorUsuario(ownerId.value)
})

const playlistSeleccionada = computed(() =>
  playlistsPropietario.value.find((playlist) => playlist.id === playlistSeleccionadaId.value) ?? null,
)

const esEditable = computed(() => {
  if (!propietario.value) return false
  return propietario.value.rol !== 'admin'
})

const puedeEliminar = computed(() => {
  if (!esEditable.value) return false
  return playlistSeleccionada.value?.esDefault !== true
})

const cancionesSeleccionadas = computed(() => {
  if (!playlistSeleccionada.value) return []
  return playlistSeleccionada.value.cancionIds
    .map((id) => songsService.buscarPorId(id))
    .filter(Boolean)
})

watch(playlistSeleccionada, (nueva) => {
  if (!nueva) {
    form.nombre = ''
    form.descripcion = ''
    return
  }
  form.nombre = nueva.nombre
  form.descripcion = nueva.descripcion ?? ''
})

watch(
  playlistsPropietario,
  (nuevas) => {
    if (!nuevas.some((pl) => pl.id === playlistSeleccionadaId.value)) {
      playlistSeleccionadaId.value = nuevas[0]?.id ?? ''
    }
  },
  { immediate: true },
)

watch(
  ownerId,
  () => {
    if (!ownerId.value) {
      playlistSeleccionadaId.value = ''
    }
  },
  { immediate: true },
)

function notificar(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
  setTimeout(() => {
    mensaje.value = ''
    mensajeEsError.value = false
  }, 2500)
}

function seleccionarPlaylist(id) {
  if (playlistSeleccionadaId.value === id) return
  playlistSeleccionadaId.value = id
}

function guardarCambios() {
  if (!playlistSeleccionada.value) return
  try {
    playlistService.actualizar(
      playlistSeleccionada.value.id,
      {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      },
      { esAdmin: true },
    )
    notificar('Playlist actualizada correctamente.')
  } catch (error) {
    notificar(error.message, true)
  }
}

function eliminarPlaylist() {
  if (!playlistSeleccionada.value) return
  if (!confirm(`¿Eliminar la playlist "${playlistSeleccionada.value.nombre}"?`)) return
  try {
    playlistService.eliminar(playlistSeleccionada.value.id, { esAdmin: true })
    notificar('Playlist eliminada.')
  } catch (error) {
    notificar(error.message, true)
  }
}

function removerCancion(cancionId) {
  if (!playlistSeleccionada.value) return
  try {
    playlistService.quitarCancion(playlistSeleccionada.value.id, cancionId, { esAdmin: true })
    notificar('Canción retirada de la playlist.')
  } catch (error) {
    notificar(error.message, true)
  }
}
</script>

<style scoped>
.admin-form,
.admin-tabla {
  background: rgba(33, 33, 33, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  color: #f8f9fa;
}

.admin-form .form-control,
.admin-form textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
}

.admin-form .form-control:focus,
.admin-form textarea:focus {
  border-color: #1db954;
  box-shadow: 0 0 0 0.25rem rgba(29, 185, 84, 0.15);
  background: rgba(255, 255, 255, 0.08);
}

.table > :not(caption) > * > * {
  background-color: transparent;
}

.cover {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 12px !important;
}
</style>


