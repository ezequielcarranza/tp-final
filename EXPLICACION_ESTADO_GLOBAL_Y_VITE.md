# Explicación Detallada: Patrón de Estado Global Funcional y Vite

## Parte 1: Patrón de Estado Global Funcional

### 📚 ¿Qué es este patrón?

El proyecto implementa un **patrón de estado global funcional** usando Vue 3 Composition API. A diferencia de Vuex o Pinia (que son librerías externas), este patrón utiliza directamente las funciones reactivas de Vue (`reactive()`, `computed()`) para crear un estado compartido entre componentes.

### 🏗️ Arquitectura del Patrón

El patrón se estructura en tres capas:

```
Componentes Vue
     ↓
Servicios (State Managers)
     ↓
Estado Reactivo (reactive)
```

Cada servicio (`auth.js`, `songs.js`, `playlists.js`) actúa como un "mini-store" que:
1. Mantiene su propio estado reactivo
2. Expone métodos para modificar el estado
3. Sincroniza con el backend mediante API calls
4. Proporciona acceso controlado al estado

---

## 🔍 Análisis Detallado: Servicio de Autenticación (`auth.js`)

### Estructura del Estado

```javascript
// Estado privado (no exportado directamente)
const state = reactive({
  usuarioActual: null,  // Objeto con { id, nombre, email, rol }
})
```

**Características importantes:**
- `state` es **privado** (no se exporta directamente)
- Usa `reactive()` de Vue 3, lo que hace que cualquier cambio se propague automáticamente
- El estado persiste en memoria durante la sesión del usuario

### Exportación Controlada del Estado

```javascript
// Exportación pública del estado (read-only)
export const authState = {
  usuarioActual: computed(() => state.usuarioActual),
}
```

**¿Por qué usar `computed()`?**
- Garantiza que los componentes reciban una referencia reactiva
- Previene mutaciones accidentales del estado desde fuera del servicio
- Mantiene la reactividad cuando los componentes acceden al estado

### Inicialización del Estado

```javascript
// Cargar usuario del token si existe
function loadUserFromToken() {
  const token = tokenService.getToken()
  if (token) {
    try {
      // Decodificar el token JWT (sin verificar, solo para obtener datos)
      const payload = JSON.parse(atob(token.split('.')[1]))
      state.usuarioActual = {
        id: payload.subject,
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: payload.email,
        rol: payload.role?.toLowerCase() || 'usuario',
      }
    } catch (error) {
      tokenService.clearToken()
    }
  }
}

// Cargar usuario al iniciar (cuando se importa el módulo)
loadUserFromToken()
```

**Flujo de inicialización:**
1. Cuando se importa `auth.js` por primera vez, se ejecuta `loadUserFromToken()`
2. Lee el token JWT del `localStorage`
3. Decodifica el token para extraer información del usuario
4. Carga el usuario en el estado reactivo

### Métodos del Servicio (Actions)

```javascript
export const authService = {
  async login({ email, password }) {
    try {
      // 1. Llamada al backend
      const response = await api.post('/api/auth/login', { email, password })
      const data = handleResponse(response)
      
      // 2. Guardar token
      if (response.data.token) {
        tokenService.setToken(response.data.token)
      }
      
      // 3. ACTUALIZAR ESTADO GLOBAL
      state.usuarioActual = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido || '',
        email: user.email,
        rol: user.role?.toLowerCase() || 'usuario',
      }
      
      return state.usuarioActual
    } catch (error) {
      handleError(error)
      throw error
    }
  },

  logout() {
    // ACTUALIZAR ESTADO GLOBAL
    state.usuarioActual = null
    tokenService.clearToken()
  },
}
```

**Características:**
- Los métodos son **async** cuando interactúan con el backend
- **Actualizan directamente** `state`, lo que dispara reactividad
- Manejan errores y sincronizan con el backend

---

## 🔍 Análisis Detallado: Servicio de Canciones (`songs.js`)

### Estado con Array de Datos

```javascript
const state = reactive({
  canciones: [],        // Array de canciones
  cargando: false,     // Flag de carga
})
```

**Diferencia clave:** Este servicio mantiene un **array** de datos, no un objeto simple.

### Patrón de Carga Bajo Demanda

```javascript
// NO se carga automáticamente al importar
// Debe llamarse explícitamente

export const songsService = {
  // Obtener canciones del estado (sin cargar)
  obtenerTodas() {
    return state.canciones  // Retorna el array reactivo
  },

  // Cargar canciones del backend
  async recargar() {
    await cargarCanciones()  // Función interna
    return state.canciones
  },
}
```

**Ventaja:** Las canciones solo se cargan cuando el usuario está autenticado, ahorrando llamadas innecesarias.

### Función Interna de Carga

```javascript
async function cargarCanciones() {
  if (state.cargando) return  // Evita múltiples cargas simultáneas
  
  state.cargando = true  // ACTUALIZA ESTADO
  try {
    const response = await api.get('/api/song/songs')
    const canciones = response.data || []
    
    // ACTUALIZA ESTADO (dispara reactividad)
    state.canciones = canciones.map(normalizarCancion)
  } catch (error) {
    // Manejo de errores...
    state.canciones = []
  } finally {
    state.cargando = false  // ACTUALIZA ESTADO
  }
}
```

**Observaciones:**
- Usa `state.cargando` para evitar cargas duplicadas
- Normaliza los datos del backend al formato del frontend
- Actualiza el estado reactivo, lo que notifica a todos los componentes

### Operaciones CRUD

```javascript
async crear(datos) {
  try {
    // 1. Crear en el backend
    const response = await api.post('/api/song/create', datos)
    const nuevaCancion = normalizarCancion(response.data.payload)
    
    // 2. ACTUALIZAR ESTADO LOCAL (sin recargar todo)
    state.canciones.push(nuevaCancion)
    
    return nuevaCancion
  } catch (error) {
    handleError(error)
    throw error
  }
}
```

**Ventaja:** Actualiza el estado local inmediatamente (optimistic update), haciendo la UI más rápida.

---

## 🔍 Análisis Detallado: Servicio de Playlists (`playlists.js`)

### Estado Similar a Canciones

```javascript
const state = reactive({
  playlists: [],
  cargando: false,
})
```

### Sincronización Compleja

```javascript
async function cargarPlaylists() {
  state.cargando = true
  try {
    // 1. Obtener playlists
    const response = await api.get('/api/playlist/playlists')
    const playlists = response.data.payload || []
    
    // 2. Para cada playlist, obtener sus canciones (llamadas paralelas)
    const playlistsConCanciones = await Promise.all(
      playlists.map(async (playlist) => {
        const songsResponse = await api.get(`/api/playlist/playlists/${playlist.id}/songs`)
        const canciones = songsData.canciones || []
        return normalizarPlaylist(playlist, canciones)
      }),
    )
    
    // 3. ACTUALIZAR ESTADO
    state.playlists = playlistsConCanciones
  } finally {
    state.cargando = false
  }
}
```

**Característica importante:** Usa `Promise.all()` para cargar las canciones de todas las playlists en paralelo, optimizando el rendimiento.

---

## 📱 Cómo los Componentes Usan el Estado Global

### Ejemplo 1: App.vue

```javascript
import { computed } from 'vue'
import { authState } from './servicios/auth'

const usuarioActual = computed(() => authState.usuarioActual.value)
const estaLogueado = computed(() => Boolean(usuarioActual.value))
```

**Flujo:**
1. Importa `authState` (que contiene el `computed`)
2. Crea un `computed` local que accede a `authState.usuarioActual.value`
3. El componente se re-renderiza automáticamente cuando `state.usuarioActual` cambia

### Ejemplo 2: PlaylistsView.vue

```javascript
import { computed, watch } from 'vue'
import { authState } from '../servicios/auth'
import { playlistService } from '../servicios/playlists'

const usuario = computed(() => authState.usuarioActual.value)

// Reacciona cuando el usuario cambia
watch(
  () => usuario.value?.id,
  async (userId) => {
    if (userId) {
      // Cargar playlists cuando hay usuario
      playlists.value = await playlistService.obtenerPorUsuario(userId)
    }
  },
  { immediate: true }
)
```

**Flujo:**
1. El componente observa cambios en `usuario`
2. Cuando el usuario se autentica, se dispara el `watch`
3. Llama al servicio para cargar las playlists
4. El servicio actualiza su estado interno
5. El componente accede al estado a través de los métodos del servicio

### Ejemplo 3: SongsView.vue

```javascript
import { computed, onMounted } from 'vue'
import { songsService } from '../servicios/songs'

// Computed que lee del estado global
const cancionesFiltradas = computed(() => {
  const termino = terminoBusqueda.value.toLowerCase()
  const canciones = songsService.obtenerTodas()  // Lee del estado
  if (!termino) return canciones
  return canciones.filter((cancion) => {
    // Lógica de filtrado...
  })
})

// Cargar canciones al montar
onMounted(async () => {
  await songsService.recargar()  // Actualiza el estado global
})
```

**Flujo:**
1. `onMounted` carga las canciones (actualiza estado global)
2. `cancionesFiltradas` es un `computed` que lee de `songsService.obtenerTodas()`
3. Cuando `state.canciones` cambia, el `computed` se recalcula automáticamente
4. El componente se re-renderiza con las nuevas canciones

---

## 🔄 Flujo Completo de Reactividad

### Escenario: Usuario hace login

```
1. Usuario completa formulario → LoginView.vue
2. Llamada a authService.login()
3. Backend responde con datos del usuario
4. authService actualiza: state.usuarioActual = { ... }
5. authState.usuarioActual (computed) se actualiza
6. App.vue recibe el cambio (porque usa authState)
7. Navbar se muestra (v-if="estaLogueado")
8. HomeView carga datos (porque usuario ahora existe)
9. Otros componentes reaccionan según sus watchers/computed
```

**Toda esta reactividad ocurre automáticamente sin necesidad de eventos personalizados o callbacks.**

---

## 🆚 Comparación con Vuex/Pinia

| Aspecto | Patrón Actual (reactive) | Vuex/Pinia |
|---------|-------------------------|------------|
| **Complejidad** | Baja (solo Vue 3) | Media (librería adicional) |
| **DevTools** | Limitado | Excelente soporte |
| **Tamaño bundle** | Mínimo | Agrega ~10-15KB |
| **Time-travel debug** | No | Sí (con plugins) |
| **TypeScript** | Funciona bien | Mejor soporte |
| **Flexibilidad** | Alta | Estructurada |

**¿Cuándo usar cada uno?**
- **Este patrón (reactive)**: Proyectos medianos, equipos pequeños, sin necesidad de DevTools avanzados
- **Vuex/Pinia**: Proyectos grandes, múltiples desarrolladores, necesidad de debugging avanzado

---

## Parte 2: Uso de Vite

### 📦 ¿Qué es Vite?

**Vite** (del francés "rápido") es un **build tool** moderno creado por Evan You (creador de Vue). Reemplaza herramientas como Webpack o Vue CLI, ofreciendo:

- ⚡ **Hot Module Replacement (HMR)** extremadamente rápido
- 🚀 **Inicio de servidor** instantáneo (sin bundle previo)
- 📦 **Build optimizado** para producción usando Rollup

### 🆚 Vite vs Vue CLI 3

| Característica | Vue CLI 3 | Vite |
|----------------|-----------|------|
| **Tecnología base** | Webpack | ESM (ES Modules) |
| **Tiempo de inicio** | Lento (bundle completo) | Instantáneo |
| **HMR** | Rápido pero limitado | Extremadamente rápido |
| **Configuración** | Más compleja | Más simple |
| **Build producción** | Webpack | Rollup (más rápido) |
| **Actualización** | Mantenimiento limitado | Activamente mantenido |

**Nota importante:** Vue CLI está en modo mantenimiento. Vite es la herramienta recomendada actualmente.

---

## 🔧 Configuración de Vite en el Proyecto

### Archivo: `vite.config.js`

```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  // 1. PLUGINS
  plugins: [
    vue(),                    // Plugin oficial de Vue para Vite
    vueDevTools(),           // DevTools de Vue (opcional, para debugging)
  ],

  // 2. ALIASES
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  // 3. SERVIDOR DE DESARROLLO
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### Explicación Detallada

#### 1. Plugins

```javascript
plugins: [
  vue(),           // Convierte archivos .vue en módulos JavaScript
  vueDevTools(),   // Herramientas de desarrollo para Vue
]
```

**`@vitejs/plugin-vue`:**
- Procesa archivos `.vue` (template, script, style)
- Habilita HMR para componentes Vue
- Soporta `<script setup>`, CSS scoped, etc.

**`vite-plugin-vue-devtools`:**
- Permite usar Vue DevTools en el navegador
- Útil para inspeccionar componentes y estado

#### 2. Alias de Rutas

```javascript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  },
}
```

**¿Qué hace?**
- Crea un alias `@` que apunta a la carpeta `src`
- Permite importar así: `import Component from '@/components/Component.vue'`
- En lugar de: `import Component from '../../components/Component.vue'`

**Ejemplo de uso:**
```javascript
// Sin alias
import Navbar from '../../../components/Navbar.vue'

// Con alias
import Navbar from '@/components/Navbar.vue'
```

#### 3. Proxy del Servidor

```javascript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

**¿Qué hace?**
- Redirige todas las peticiones que empiezan con `/api` al backend
- **Ejemplo:**
  - Frontend hace: `GET /api/song/songs`
  - Vite intercepta y redirige a: `http://127.0.0.1:3001/api/song/songs`
  - Evita problemas de CORS en desarrollo

**¿Por qué es necesario?**
- El frontend corre en `http://localhost:5173` (puerto de Vite)
- El backend corre en `http://localhost:3001`
- Sin proxy, habría problemas de CORS (Cross-Origin Resource Sharing)

---

## 📝 package.json - Scripts de Vite

```json
{
  "scripts": {
    "start": "vite --open",           // Inicia servidor y abre navegador
    "dev": "vite",                    // Modo desarrollo
    "build": "vite build",            // Build para producción
    "preview": "vite preview"         // Preview del build de producción
  }
}
```

### Explicación de Scripts

#### `npm run dev` o `vite`
- Inicia el servidor de desarrollo
- Por defecto en `http://localhost:5173`
- Habilita HMR (cambios se reflejan instantáneamente)
- **No hace bundle completo**, solo sirve archivos según demanda

#### `npm run build` o `vite build`
- Crea la versión optimizada para producción
- Usa **Rollup** internamente
- Minifica código, optimiza assets, tree-shaking
- Genera carpeta `dist/` lista para desplegar

#### `npm run preview` o `vite preview`
- Sirve localmente el build de producción
- Útil para probar cómo se verá la app en producción

---

## 🏗️ Estructura de Archivos con Vite

### `index.html` (Entry Point)

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Vue Spotify</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- Vite inyecta el script aquí -->
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Características:**
- Vite busca `index.html` en la raíz del proyecto
- El script es de tipo `module` (ES Modules nativos)
- Vite procesa este archivo y agrega los módulos necesarios

### `src/main.js`

```javascript
import './assets/main.css'      // CSS global
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './bootstrap'            // Bootstrap CSS

const app = createApp(App)
app.use(router)
app.mount('#app')
```

**Flujo:**
1. Vite procesa `index.html`
2. Encuentra `<script type="module" src="/src/main.js">`
3. Procesa `main.js` y todas sus importaciones
4. Transforma archivos `.vue`, procesa CSS, etc.
5. Sirve todo al navegador como ES Modules

---

## ⚡ Ventajas de Vite en el Proyecto

### 1. Desarrollo Rápido

**Vue CLI 3:**
```
npm run serve
⏳ Compilando...
⏳ 30-60 segundos esperando
✅ Servidor listo
```

**Vite:**
```
npm run dev
✅ Servidor listo (menos de 1 segundo)
```

### 2. Hot Module Replacement (HMR)

**Vue CLI 3:**
- Cambias un componente
- Recompila todo el módulo
- 2-5 segundos de espera

**Vite:**
- Cambias un componente
- Solo actualiza ese componente
- Menos de 100ms

### 3. Importaciones Optimizadas

**Vue CLI 3:**
```javascript
import { debounce } from 'lodash'
// Incluye TODA la librería lodash en el bundle
```

**Vite:**
```javascript
import { debounce } from 'lodash'
// Solo incluye la función debounce (tree-shaking automático)
```

### 4. Variables de Entorno

Vite usa el prefijo `VITE_` para variables de entorno:

```javascript
// .env
VITE_API_BASE_URL=http://127.0.0.1:3001

// En código
const API_URL = import.meta.env.VITE_API_BASE_URL
```

**Características:**
- Solo variables con `VITE_` son expuestas al cliente
- Acceso mediante `import.meta.env`
- Type-safe con TypeScript

---

## 🔍 Flujo Completo: Desarrollo con Vite

### 1. Inicio del Proyecto

```bash
npm run dev
```

**Lo que hace Vite:**
1. Lee `vite.config.js`
2. Carga plugins (Vue, DevTools)
3. Configura proxy para `/api`
4. Inicia servidor en puerto 5173
5. **NO hace bundle**, solo prepara el servidor

### 2. Navegador Solicita Página

```
Navegador → GET http://localhost:5173/
Vite → Lee index.html
Vite → Procesa <script src="/src/main.js">
```

### 3. Procesamiento de Módulos

```
Vite encuentra: import App from './App.vue'
Vite → Transforma App.vue a JavaScript
Vite → Encuentra: import Navbar from './components/Navbar.vue'
Vite → Transforma Navbar.vue
... (proceso recursivo)
```

**Característica clave:** Solo procesa lo que se necesita, cuando se necesita.

### 4. Cambio en Código (HMR)

```
Desarrollador modifica PlaylistsView.vue
Vite detecta cambio
Vite → Re-procesa solo PlaylistsView.vue
Vite → Envía actualización al navegador
Navegador → Actualiza solo ese componente
```

**Todo en menos de 100ms.**

---

## 🚀 Build para Producción

### Comando

```bash
npm run build
```

### Proceso

1. **Análisis de dependencias**
   - Identifica todos los módulos usados
   - Elimina código no usado (tree-shaking)

2. **Optimización**
   - Minifica JavaScript
   - Optimiza imágenes
   - Code splitting automático

3. **Output**
   ```
   dist/
   ├── index.html
   ├── assets/
   │   ├── index-[hash].js
   │   └── index-[hash].css
   ```

### Comparación

**Vue CLI 3:**
- Build: 30-60 segundos
- Bundle: ~500KB (sin optimizar)

**Vite:**
- Build: 5-15 segundos
- Bundle: ~300KB (mejor optimizado)

---

## 📊 Resumen: Estado Global vs Vite

### Estado Global Funcional

✅ **Ventajas:**
- Simple y nativo de Vue 3
- No requiere librerías adicionales
- Perfecto para proyectos medianos
- Reactividad automática

⚠️ **Limitaciones:**
- Sin DevTools avanzadas
- Sin time-travel debugging
- Menos estructurado que Vuex/Pinia

### Vite

✅ **Ventajas:**
- Desarrollo extremadamente rápido
- HMR instantáneo
- Build optimizado
- Futuro de Vue.js

⚠️ **Limitaciones:**
- No es Vue CLI 3 (puede ser requisito académico)
- Requiere Node.js moderno (v14+)
- Curva de aprendizaje mínima (similar a Vue CLI)

---

## 🎯 Conclusiones

### Estado Global
El proyecto implementa un patrón de estado global **funcional y efectivo** usando:
- `reactive()` para estado reactivo
- Servicios modulares para cada dominio
- Computed properties para acceso controlado
- Sincronización automática con backend

**Es perfectamente válido** aunque no use Vuex/Pinia, ya que cumple la misma función de manera más ligera.

### Vite
Vite es la **herramienta moderna recomendada** para proyectos Vue 3:
- Más rápido que Vue CLI 3
- Mejor experiencia de desarrollo
- Build optimizado
- Futuro del ecosistema Vue

**Recomendación:** Si el requisito académico especifica Vue CLI 3, se puede mencionar que Vite es el sucesor oficial y ofrece las mismas funcionalidades con mejor rendimiento.

