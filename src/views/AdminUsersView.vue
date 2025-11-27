<template>
  <section>
    <header
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <h1 class="h3 text-white mb-1">Administrar usuarios</h1>
        <p class="text-white-50 mb-0">
          Revisá el listado de cuentas creadas y eliminá usuarios si es necesario.
        </p>
      </div>
    </header>

    <div v-if="mensaje" class="alert" :class="mensajeEsError ? 'alert-danger' : 'alert-success'">
      {{ mensaje }}
    </div>

    <div v-else class="card border-0 admin-tabla">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table align-middle table-dark table-striped m-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usuarios" :key="usuario.id">
                <td>
                  <div class="fw-semibold text-white">{{ usuario.nombre }}</div>
                  <div class="small text-white-50">{{ usuario.id }}</div>
                </td>
                <td>{{ usuario.email }}</td>
                <td>
                  <span
                    class="badge"
                    :class="usuario.rol === 'admin' ? 'text-bg-success' : 'text-bg-secondary'"
                  >
                    {{ usuario.rol }}
                  </span>
                </td>
                <td class="text-end">
                  <button
                    class="btn btn-outline-primary btn-sm me-2"
                    :disabled="usuario.rol === 'admin'"
                    @click="abrirModalModificar(usuario)"
                  >
                    <i class="bi bi-pencil me-1"></i>
                    Modificar
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    :disabled="usuario.rol === 'admin'"
                    @click="eliminarUsuario(usuario)"
                  >
                    <i class="bi bi-trash me-1"></i>
                    Eliminar
                  </button>
                </td>
              </tr>
              <tr v-if="usuarios.length === 0 && !cargando">
                <td colspan="4" class="text-center text-secondary py-5">
                  No hay usuarios registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para modificar usuario -->
    <div
      v-if="mostrarModal"
      class="modal d-block"
      style="background-color: rgba(0, 0, 0, 0.5)"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border border-secondary">
          <div class="modal-header border-secondary">
            <h5 class="modal-title text-white">Modificar usuario</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="cerrarModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarCambios">
              <div class="mb-3">
                <label for="nombre" class="form-label text-white">Nombre</label>
                <input
                  id="nombre"
                  v-model="formulario.nombre"
                  type="text"
                  class="form-control bg-secondary text-white border-0"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="apellido" class="form-label text-white">Apellido</label>
                <input
                  id="apellido"
                  v-model="formulario.apellido"
                  type="text"
                  class="form-control bg-secondary text-white border-0"
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label text-white">Email</label>
                <input
                  id="email"
                  v-model="formulario.email"
                  type="email"
                  class="form-control bg-secondary text-white border-0"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="rol" class="form-label text-white">Rol</label>
                <select
                  id="rol"
                  v-model="formulario.rol"
                  class="form-select bg-secondary text-white border-0"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="cerrarModal"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="guardando"
                >
                  {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '../servicios/auth'

const usuarios = ref([])
const mensaje = ref('')
const mensajeEsError = ref(false)
const cargando = ref(false)
const mostrarModal = ref(false)
const guardando = ref(false)
const usuarioEnEdicion = ref(null)
const formulario = ref({
  nombre: '',
  apellido: '',
  email: '',
  rol: 'usuario',
})

// Cargar usuarios al montar el componente
onMounted(async () => {
  await cargarUsuarios()
})

async function cargarUsuarios() {
  cargando.value = true
  try {
    const usuariosData = await authService.getUsuarios()
    // Normalizar los usuarios para que tengan el formato esperado
    // El backend devuelve: { id, nombre, apellido, email, role }
    usuarios.value = Array.isArray(usuariosData) 
      ? usuariosData.map((usuario) => ({
          id: usuario.id,
          nombre: `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'Sin nombre',
          email: usuario.email || '',
          rol: usuario.role?.toLowerCase() || 'usuario',
        }))
      : []
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    notificar(error.message || 'Error al cargar usuarios', true)
    usuarios.value = []
  } finally {
    cargando.value = false
  }
}

function notificar(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
  setTimeout(() => {
    mensaje.value = ''
    mensajeEsError.value = false
  }, 2500)
}

function abrirModalModificar(usuario) {
  usuarioEnEdicion.value = usuario
  formulario.value = {
    nombre: usuario.nombre,
    apellido: usuario.apellido || '',
    email: usuario.email,
    rol: usuario.rol,
  }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  usuarioEnEdicion.value = null
  formulario.value = {
    nombre: '',
    apellido: '',
    email: '',
    rol: 'usuario',
  }
}

async function guardarCambios() {
  if (!usuarioEnEdicion.value) return
  
  guardando.value = true
  try {
    await authService.actualizarPerfil(usuarioEnEdicion.value.id, {
      nombre: formulario.value.nombre,
      apellido: formulario.value.apellido,
      email: formulario.value.email,
      role: formulario.value.rol,
    })
    
    notificar('Usuario actualizado correctamente.')
    cerrarModal()
    // Recargar la lista de usuarios
    await cargarUsuarios()
  } catch (error) {
    notificar(error.message || 'Error al actualizar usuario', true)
  } finally {
    guardando.value = false
  }
}

async function eliminarUsuario(usuario) {
  if (!confirm(`¿Eliminar la cuenta de "${usuario.nombre}"?`)) return
  try {
    await authService.eliminarUsuario(usuario.id)
    notificar('Usuario eliminado correctamente.')
    // Recargar la lista de usuarios
    await cargarUsuarios()
  } catch (error) {
    notificar(error.message || 'Error al eliminar usuario', true)
  }
}
</script>

<style scoped>
.admin-tabla {
  background: rgba(33, 33, 33, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  color: #f8f9fa;
}

.table > :not(caption) > * > * {
  background-color: transparent;
}
</style>


