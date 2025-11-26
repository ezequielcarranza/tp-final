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
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authService } from '../servicios/auth'

const usuarios = ref([])
const mensaje = ref('')
const mensajeEsError = ref(false)
const cargando = ref(false)

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


