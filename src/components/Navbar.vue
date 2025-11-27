<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
    <div class="container">
      <RouterLink class="navbar-brand fw-semibold" :to="{ name: 'inicio' }">
        <i class="bi bi-music-note-beamed me-2"></i>
        MusicApp
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSpotify"
        aria-controls="navbarSpotify"
        aria-expanded="false"
        aria-label="Menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSpotify">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'inicio' }">
              Inicio
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'canciones' }">
              Canciones
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'playlists' }">
              Playlists
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'estadisticas' }">
              Estadísticas
            </RouterLink>
          </li>
          <template v-if="esAdmin">
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'admin-canciones' }">
                Administrar canciones
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'admin-usuarios' }">
                Administrar usuarios
              </RouterLink>
            </li>
          </template>
        </ul>

        <div class="d-flex align-items-center gap-3 text-white-50">
          <div>
            <small class="text-uppercase d-block text-white-50">
              {{ esAdmin ? 'Administrador' : 'Usuario' }}
            </small>
            <strong class="text-white">{{ usuario.nombre }}</strong>
          </div>
          <button class="btn btn-outline-light btn-sm" @click="$emit('logout')">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    required: true,
  },
})

const esAdmin = computed(() => props.usuario?.rol === 'admin')
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(16px);
  background: rgba(18, 18, 18, 0.95) !important;
}
</style>

