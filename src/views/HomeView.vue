<template>
  <section class="home">
    <header class="home__header">
      <div>
        <h1 class="display-6 fw-bold text-white">
          Hola, {{ usuario?.nombre }} 👋
        </h1>
        <p class="lead text-white-50">
          Gestioná tus playlists, descubrí nuevas canciones y administra la biblioteca.
        </p>
      </div>
      <RouterLink
        class="btn btn-success btn-lg"
        :to="{ name: usuario?.rol === 'admin' ? 'admin-canciones' : 'playlists' }"
      >
        {{ usuario?.rol === 'admin' ? 'Administrar canciones' : 'Crear playlist' }}
      </RouterLink>
    </header>

    <!-- <div class="row g-4 mt-1">
      <div class="col-md-4">
        <div class="info-card">
          <span class="info-card__icon bg-success-subtle text-success">
            <i class="bi bi-music-note-list"></i>
          </span>
          <h3>{{ totalCanciones }} canciones</h3>
          <p class="text-white-50 mb-0">
            Biblioteca disponible para todos los usuarios logueados.
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="info-card">
          <span class="info-card__icon bg-info-subtle text-info">
            <i class="bi bi-collection-play"></i>
          </span>
          <h3>{{ totalPlaylistsUsuario }} playlists</h3>
          <p class="text-white-50 mb-0">
            Tus playlists personales para organizar tu música favorita.
          </p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="info-card">
          <span class="info-card__icon bg-warning-subtle text-warning">
            <i class="bi bi-people"></i>
          </span>
          <h3>{{ totalUsuarios }} usuarios</h3>
          <p class="text-white-50 mb-0">
            Usuarios registrados en la plataforma demo.
          </p>
        </div>
      </div>
    </div> -->
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { authState, authService } from '../servicios/auth'
import { songsService } from '../servicios/songs'
import { playlistService } from '../servicios/playlists'

const usuario = computed(() => authState.usuarioActual.value)
const totalUsuarios = ref(0)
const totalCanciones = computed(() => songsService.obtenerTodas().length)

// Cargar datos cuando el usuario esté autenticado
onMounted(async () => {
  if (usuario.value) {
    try {
      // Cargar canciones
      await songsService.recargar()
      // Cargar usuarios (solo si es admin)
      if (usuario.value.rol === 'admin') {
        const usuarios = await authService.getUsuarios()
        totalUsuarios.value = usuarios.length
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error al cargar datos:', error)
      }
    }
  }
})

const playlistsUsuario = computed(() => {
  if (!usuario.value) return []
  return playlistService.obtenerPorUsuario(usuario.value.id)
})

const playlistsDestacadas = computed(() =>
  playlistsUsuario.value.slice().sort((a, b) => {
    return new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime()
  }).slice(0, 3),
)

const totalPlaylistsUsuario = computed(() => playlistsUsuario.value.length)
</script>

<style scoped>
.home__header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.15), rgba(0, 0, 0, 0));
  border-radius: 24px;
  padding: 2.5rem;
}

@media (min-width: 768px) {
  .home__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.info-card {
  background: rgba(40, 40, 40, 0.8);
  border-radius: 20px;
  padding: 1.8rem;
  color: #f8f9fa;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.info-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
}

.playlist-card {
  background: rgba(33, 33, 33, 0.85);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>

