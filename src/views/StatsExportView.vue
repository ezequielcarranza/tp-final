<template>
  <section>
    <header class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h1 class="h3 text-white mb-1">Exportar Estadísticas</h1>
        <p class="text-white-50 mb-0">
          Descarga tus estadísticas de música en formato Excel. El archivo incluye tus canciones, artistas, álbumes y géneros más escuchados.
        </p>
      </div>
    </header>

    <div class="row justify-content-center">
      <div class="col-lg-6">
        <div class="card border-0 stats-export-card">
          <div class="card-body text-center p-5">
            <div class="mb-4">
              <i class="bi bi-file-earmark-excel-fill stats-icon"></i>
            </div>
            <h2 class="h4 text-white mb-3">Estadísticas de Música</h2>
            <p class="text-white-50 mb-4">
              Genera un archivo Excel con todas tus estadísticas de reproducción. El archivo incluye:
            </p>
            <ul class="list-unstyled text-white-50 text-start mb-4 mx-auto" style="max-width: 400px;">
              <li class="mb-2">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                Top canciones globales
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                Tus canciones más escuchadas
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                Tus artistas favoritos
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                Tus álbumes más reproducidos
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                Géneros más escuchados
              </li>
            </ul>
            <button
              @click="descargarEstadisticas"
              :disabled="descargando"
              class="btn btn-success btn-lg"
            >
              <span v-if="descargando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else class="bi bi-download me-2"></i>
              {{ descargando ? 'Descargando...' : 'Descargar Estadísticas' }}
            </button>
            <div v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import api from '../servicios/api'

const descargando = ref(false)
const error = ref(null)

const descargarEstadisticas = async () => {
  descargando.value = true
  error.value = null

  try {
    const response = await api.get('/api/stats/export', {
      responseType: 'blob', // Importante para descargar archivos binarios
    })

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'musicapp_stats.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error al descargar estadísticas:', err)
    error.value = err.response?.data?.message || 'Error al descargar las estadísticas. Por favor, intenta nuevamente.'
  } finally {
    descargando.value = false
  }
}
</script>

<style scoped>
.stats-export-card {
  background: rgba(33, 33, 33, 0.85);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.stats-icon {
  font-size: 4rem;
  color: #1db954;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.list-unstyled li {
  padding-left: 0.5rem;
}
</style>

