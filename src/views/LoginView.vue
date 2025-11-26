<template>
  <div class="login-wrapper">
    <div class="login-card card shadow-lg border-0">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-music-note-beamed icon"></i>
          <h1 class="h4 fw-semibold mt-3 text-white">Inicia sesión</h1>
          <p class="text-secondary mb-0">
            Accedé a tu biblioteca de canciones y playlists personales.
          </p>
        </div>

        <div v-if="mensaje" class="alert" :class="mensajeEsError ? 'alert-danger' : 'alert-success'">
          {{ mensaje }}
        </div>

        <form @submit.prevent="onLogin">
          <div class="mb-3">
            <label class="form-label text-white-50">Correo electrónico</label>
            <input
              v-model="loginForm.email"
              type="email"
              class="form-control"
              placeholder="admin@spotify.dev"
              required
            />
          </div>

          <div class="mb-4">
            <label class="form-label text-white-50">Contraseña</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="form-control"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button class="btn btn-success w-100 py-2 fw-semibold" type="submit">
            Ingresar
          </button>
        </form>

        <hr class="my-4 opacity-25" />

        <div class="text-white-50 text-center mb-3">
          <span>¿Todavía no tenés una cuenta?</span>
        </div>

        <div class="col-12">
          <RouterLink
            class="btn btn-outline-light w-100 py-2"
            :to="{ name: 'registro' }"
          >
            Registrate
          </RouterLink>
        </div>

        <div class="mt-4 small text-secondary">
          <p class="mb-1 fw-semibold text-white">Credenciales de prueba</p>
          <ul class="list-unstyled small m-0">
            <li>Administrador: ezequuielcarranza02@gmail.com / Password123</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../servicios/auth'
import { playlistService } from '../servicios/playlists'

const router = useRouter()
const route = useRoute()

const loginForm = ref({
  email: 'ezequuielcarranza02@gmail.com',
  password: 'Password123',
})

const registerForm = ref({
  nombre: '',
  email: '',
  password: '',
})

const mensaje = ref('')
const mensajeEsError = ref(false)

function limpiarMensajes() {
  mensaje.value = ''
  mensajeEsError.value = false
}

function informar(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
}

async function onLogin() {
  limpiarMensajes()
  try {
    await authService.login(loginForm.value)
    informar('¡Bienvenido! Redirigiendo...', false)
    const redirect = route.query.redirect
    setTimeout(() => {
      router.push(typeof redirect === 'string' ? redirect : { name: 'inicio' })
    }, 500)
  } catch (error) {
    informar(error.message, true)
  }
}

async function onRegister() {
  limpiarMensajes()
  try {
    await authService.registrar(registerForm.value)
    informar('Cuenta creada con éxito. Ahora podés iniciar sesión.', false)
    registerForm.value = { nombre: '', email: '', password: '' }
  } catch (error) {
    informar(error.message, true)
  }
}
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: rgba(33, 33, 33, 0.9);
  border-radius: 24px;
}

.icon {
  font-size: 3rem;
  color: #1db954;
}

.form-control {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.08);
  color: #f8f9fa;
  border-color: #1db954;
  box-shadow: 0 0 0 0.25rem rgba(29, 185, 84, 0.15);
}

.alert {
  border-radius: 12px;
}
</style>

