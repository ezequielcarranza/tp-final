<template>
  <div class="login-wrapper">
    <div class="login-card card shadow-lg border-0">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-music-note-beamed icon"></i>
          <h1 class="h4 fw-semibold mt-3 text-white">Crea tu cuenta</h1>
          <p class="text-secondary mb-0">
            Registrate y disfruta de las mejores canciones.
          </p>
        </div>

        <div v-if="mensaje" class="alert" :class="mensajeEsError ? 'alert-danger' : 'alert-success'">
          {{ mensaje }}
        </div>

        <form @submit.prevent="onRegister">
          <div class="mb-3">
            <label class="form-label text-white-50">Nombre completo</label>
            <input
              v-model="registerForm.nombre"
              type="text"
              class="form-control"
              placeholder="Tu nombre"
              required
              :disabled="cargando"
            />
          </div>

          <div class="mb-3">
            <label class="form-label text-white-50">Correo electrónico</label>
            <input
              v-model="registerForm.email"
              type="email"
              class="form-control"
              placeholder="correo@ejemplo.com"
              required
              :disabled="cargando"
            />
          </div>

          <div class="mb-4">
            <label class="form-label text-white-50">Contraseña</label>
            <input
              v-model="registerForm.password"
              type="password"
              class="form-control"
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
              :disabled="cargando"
            />
          </div>

          <button 
            class="btn btn-success w-100 py-2 fw-semibold" 
            type="submit"
            :disabled="cargando"
          >
            <span v-if="cargando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <hr class="my-4 opacity-25" />

        <div class="text-white-50 text-center mb-3">
          <span>¿Ya tenés una cuenta?</span>
        </div>

        <div class="col-12">
          <RouterLink
            class="btn btn-outline-light w-100 py-2"
            :to="{ name: 'login' }"
          >
            Iniciar sesión
          </RouterLink>
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

const registerForm = ref({
  nombre: '',
  email: '',
  password: '',
})

const mensaje = ref('')
const mensajeEsError = ref(false)
const cargando = ref(false)

function limpiarMensajes() {
  mensaje.value = ''
  mensajeEsError.value = false
}

function informar(texto, esError = false) {
  mensaje.value = texto
  mensajeEsError.value = esError
}

async function onRegister() {
  limpiarMensajes()
  cargando.value = true
  
  try {
    const nuevoUsuario = await authService.registrar(registerForm.value)
    
    informar('¡Cuenta creada con éxito! Iniciando sesión...', false)
    
    // Iniciar sesión automáticamente después del registro
    setTimeout(async () => {
      try {
        await authService.login({
          email: registerForm.value.email,
          password: registerForm.value.password,
        })
        
        const redirect = route.query.redirect
        router.push(typeof redirect === 'string' ? redirect : { name: 'inicio' })
      } catch (error) {
        informar('Error al iniciar sesión: ' + error.message, true)
        cargando.value = false
      }
    }, 1000)
  } catch (error) {
    informar(error.message, true)
    cargando.value = false
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
  
  