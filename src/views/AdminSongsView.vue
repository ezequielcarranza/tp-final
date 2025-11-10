<template>
  <section>
    <header class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h1 class="h3 text-white mb-1">Administrar canciones</h1>
        <p class="text-white-50 mb-0">
          Crear, editar o eliminar canciones disponibles para todos los usuarios.
        </p>
      </div>
      <RouterLink class="btn btn-outline-light" :to="{ name: 'canciones' }">
        Ver biblioteca pública
      </RouterLink>
    </header>

    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card border-0 admin-form">
          <div class="card-body">
            <h2 class="h5 text-white mb-3">
              {{ editando ? 'Editar canción' : 'Nueva canción' }}
            </h2>
            <form @submit.prevent="guardarCancion">
              <div class="mb-3">
                <label class="form-label text-white-50">Título</label>
                <input v-model="form.titulo" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Artista</label>
                <input v-model="form.artista" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Álbum</label>
                <input v-model="form.album" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Género</label>
                <input v-model="form.genero" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Duración</label>
                <input
                  v-model="form.duracion"
                  type="text"
                  class="form-control"
                  placeholder="mm:ss"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">URL de audio</label>
                <input
                  v-model="form.url"
                  type="url"
                  class="form-control"
                  placeholder="https://..."
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Portada (URL de imagen)</label>
                <input
                  v-model="form.portada"
                  type="url"
                  class="form-control"
                  placeholder="https://..."
                />
              </div>
              <div class="mb-3">
                <label class="form-label text-white-50">Descripción</label>
                <textarea
                  v-model="form.descripcion"
                  class="form-control"
                  rows="3"
                  placeholder="Notas sobre la canción"
                ></textarea>
              </div>
              <div class="d-grid gap-2">
                <button class="btn btn-success" type="submit">
                  {{ editando ? 'Guardar cambios' : 'Agregar canción' }}
                </button>
                <button
                  v-if="editando"
                  class="btn btn-outline-light"
                  type="button"
                  @click="cancelarEdicion"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div v-if="mensaje" class="alert" :class="mensajeEsError ? 'alert-danger' : 'alert-success'">
          {{ mensaje }}
        </div>
        <div class="card border-0 admin-tabla">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table align-middle table-dark table-striped m-0">
                <thead>
                  <tr>
                    <th>Portada</th>
                    <th>Título y artista</th>
                    <th>Género</th>
                    <th>Duración</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cancion in canciones" :key="cancion.id">
                    <td>
                      <img :src="cancion.portada" alt="" class="cover rounded" />
                    </td>
                    <td>
                      <div class="fw-semibold text-white">{{ cancion.titulo }}</div>
                      <div class="small text-white-50">{{ cancion.artista }} • {{ cancion.album }}</div>
                    </td>
                    <td>{{ cancion.genero }}</td>
                    <td>{{ cancion.duracion }}</td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-light" @click="editarCancion(cancion)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" @click="eliminarCancion(cancion)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="canciones.length === 0">
                    <td colspan="5" class="text-center text-secondary py-5">
                      No hay canciones registradas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { songsService } from '../servicios/songs'
import { playlistService } from '../servicios/playlists'

const canciones = computed(() => songsService.obtenerTodas())

const form = reactive({
  id: '',
  titulo: '',
  artista: '',
  album: '',
  genero: '',
  duracion: '',
  url: '',
  portada: '',
  descripcion: '',
})

const editando = ref(false)
const mensaje = ref('')
const mensajeEsError = ref(false)

function limpiarFormulario() {
  form.id = ''
  form.titulo = ''
  form.artista = ''
  form.album = ''
  form.genero = ''
  form.duracion = ''
  form.url = ''
  form.portada = ''
  form.descripcion = ''
  editando.value = false
}

function notificar(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
  setTimeout(() => {
    mensaje.value = ''
    mensajeEsError.value = false
  }, 2500)
}

function guardarCancion() {
  const payload = {
    titulo: form.titulo.trim(),
    artista: form.artista.trim(),
    album: form.album.trim(),
    genero: form.genero.trim(),
    duracion: form.duracion.trim(),
    url: form.url.trim(),
    portada: form.portada.trim(),
    descripcion: form.descripcion.trim(),
  }

  try {
    if (editando.value) {
      songsService.actualizar(form.id, payload)
      notificar('Canción actualizada correctamente.')
    } else {
      songsService.crear(payload)
      notificar('Canción creada correctamente.')
    }
    limpiarFormulario()
  } catch (error) {
    notificar(error.message, true)
  }
}

function editarCancion(cancion) {
  form.id = cancion.id
  form.titulo = cancion.titulo
  form.artista = cancion.artista
  form.album = cancion.album
  form.genero = cancion.genero
  form.duracion = cancion.duracion
  form.url = cancion.url
  form.portada = cancion.portada
  form.descripcion = cancion.descripcion
  editando.value = true
}

function cancelarEdicion() {
  limpiarFormulario()
  notificar('Edición cancelada.')
}

function eliminarCancion(cancion) {
  if (!confirm(`¿Eliminar "${cancion.titulo}" de la biblioteca?`)) return
  try {
    songsService.eliminar(cancion.id)
    playlistService.removerCancionDeTodas(cancion.id)
    notificar('Canción eliminada.')
    if (editando.value && form.id === cancion.id) {
      limpiarFormulario()
    }
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

.cover {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 12px !important;
}

.table > :not(caption) > * > * {
  background-color: transparent;
}
</style>

