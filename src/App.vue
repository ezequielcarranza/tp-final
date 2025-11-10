<template>
  <div class="app-wrapper">
    <Navbar
      v-if="estaLogueado"
      :usuario="usuarioActual"
      @logout="cerrarSesion"
    />
    <main class="app-content" :class="{ 'app-content--full': !estaLogueado }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { authService, authState } from './servicios/auth'

const router = useRouter()

const usuarioActual = computed(() => authState.usuarioActual.value)
const estaLogueado = computed(() => Boolean(usuarioActual.value))

function cerrarSesion() {
  authService.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #121212, #1f1f1f 60%, #282828);
  color: #f8f9fa;
}

.app-content {
  padding: 6rem 0 2rem;
  min-height: calc(100vh - 56px);
  width: min(1100px, 90vw);
  margin: 0 auto;
}

.app-content--full {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0;
}
</style>
