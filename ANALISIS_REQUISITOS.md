# Análisis de Cumplimiento de Requisitos del Proyecto

Este documento analiza el cumplimiento de los requisitos técnicos del proyecto Spotify.

## ✅ Requisitos Cumplidos

### 1. Framework CSS (Bootstrap) ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**: 
  - Bootstrap 5.3.8 instalado en `package.json`
  - Importado en `src/bootstrap.js`
  - Uso extensivo de clases Bootstrap en todos los componentes (cards, buttons, forms, navbar, etc.)
  - Ejemplo: `src/components/Navbar.vue` usa clases como `navbar`, `btn`, `container`

### 2. Componentes (archivo único) ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - Todos los componentes usan archivo único (`.vue`)
  - `src/components/Navbar.vue` es un componente reutilizable
  - Todas las vistas son componentes Vue de archivo único:
    - `LoginView.vue`, `SignInView.vue`, `HomeView.vue`, `SongsView.vue`, `PlaylistsView.vue`, etc.
  - **Nota**: No se encontraron componentes de múltiples archivos (template/script/style separados)

### 3. Uso de métodos y propiedades computadas ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - Uso extensivo de `computed()` en múltiples componentes:
    - `src/App.vue`: `usuarioActual`, `estaLogueado`
    - `src/views/PlaylistsView.vue`: `playlistSeleccionada`, `cancionesPlaylist`
    - `src/views/SongsView.vue`: `cancionesFiltradas`, `playlistFavoritos`
  - Métodos definidos como funciones en todos los componentes
  - Ejemplo de método: `crearPlaylist()`, `eliminarPlaylistSeleccionada()`, etc.

### 4. Directivas Data Binding ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - **v-bind (`:`)**: Usado extensivamente
    - `:usuario="usuarioActual"`, `:to="{ name: 'inicio' }"`, `:src="cancion.portada"`
  - **v-on (`@`)**: Usado extensivamente
    - `@submit.prevent="crearPlaylist"`, `@click="seleccionarPlaylist(id)"`, `@logout="cerrarSesion"`
  - **v-model**: Usado en formularios
    - `v-model="form.nombre"`, `v-model="loginForm.email"`, `v-model="terminoBusqueda"`

### 5. Directivas estructurales (Parcial) ⚠️
- **Estado**: ⚠️ PARCIALMENTE CUMPLIDO
- **Evidencia**:
  - ✅ **v-if**: Usado extensivamente
    - `src/App.vue`: `v-if="estaLogueado"`
    - `src/views/PlaylistsView.vue`: `v-if="mensaje"`, `v-if="playlists.length === 0"`
  - ✅ **v-else**: Usado en varios componentes
    - `src/views/PlaylistsView.vue`: `v-else` después de `v-if="playlists.length === 0"`
  - ✅ **v-for**: Usado extensivamente
    - `v-for="playlist in playlists"`, `v-for="cancion in cancionesFiltradas"`
  - ❌ **v-show**: NO ENCONTRADO
  - ❌ **v-else-if**: NO ENCONTRADO

### 6. Directivas de atributos ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - **:class**: Usado dinámicamente
    - `:class="{ 'btn-success': playlist.id === playlistActivaId, 'btn-outline-light': playlist.id !== playlistActivaId }"`
    - `:class="{ 'app-content--full': !estaLogueado }"`
    - `:class="mensajeEsError ? 'alert-danger' : 'alert-success'"`
  - **:style**: No encontrado uso explícito, pero :class dinámico cumple el requisito de directivas de atributos

### 7. Lifecycle Hooks ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - **onMounted**: Usado en múltiples componentes
    - `src/views/SongsView.vue`: `onMounted(async () => { ... })`
    - `src/views/HomeView.vue`: `onMounted(async () => { ... })`
    - `src/views/AdminUsersView.vue`: `onMounted(async () => { ... })`
  - **watch** y **watchEffect** también usados para reactividad

### 8. Manejo de Props y eventos ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - **Props**: 
    - `src/components/Navbar.vue` define props:
      ```javascript
      const props = defineProps({
        usuario: { type: Object, required: true }
      })
    - `src/App.vue` pasa props: `:usuario="usuarioActual"`
  - **Eventos**:
    - `src/components/Navbar.vue` emite: `@click="$emit('logout')"`
    - `src/App.vue` escucha: `@logout="cerrarSesion"`

### 9. Formulario con validaciones ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - Múltiples formularios con validaciones HTML:
    - `src/views/LoginView.vue`: `required`, `type="email"`, `type="password"`
    - `src/views/SignInView.vue`: `required`, `minlength="6"`, `type="email"`
    - `src/views/PlaylistsView.vue`: `required`, `minlength="3"`
    - `src/views/AdminSongsView.vue`: múltiples campos `required`
  - Validaciones del lado del cliente presentes

### 10. Routeo de componentes con parámetros (Parcial) ⚠️
- **Estado**: ⚠️ PARCIALMENTE CUMPLIDO
- **Evidencia**:
  - ✅ Routeo implementado con Vue Router 4
  - ✅ Parámetros desde código:
    - `router.push({ name: 'login' })`
    - `router.replace({ query: { ...route.query, playlistId: id } })`
  - ✅ Parámetros query desde HTML:
    - `src/views/PlaylistsView.vue` lee `route.query.playlistId`
    - `src/router.js` usa `query: { redirect: to.fullPath }`
  - ❌ **NO hay rutas con parámetros dinámicos en el path** (ej: `/playlist/:id`)
  - Las rutas actuales son estáticas: `/inicio`, `/canciones`, `/playlists`, etc.
  - Se usan query params pero no path params

### 11. Implementación de una API REST Full mediante axios (con async/await) ✅
- **Estado**: ✅ CUMPLIDO
- **Evidencia**:
  - Axios instalado y configurado en `src/servicios/api.js`
  - Uso extensivo de `async/await` en todos los servicios:
    - `src/servicios/auth.js`: `async login()`, `async registrar()`
    - `src/servicios/playlists.js`: `async crear()`, `async obtenerPorUsuario()`
    - `src/servicios/songs.js`: `async recargar()`, `async crear()`
  - Interceptores configurados para autenticación
  - Llamadas REST completas: GET, POST, PATCH, DELETE
  - Ejemplo:
    ```javascript
    async function crearPlaylist() {
      const response = await api.post('/api/playlist/playlists', { nombre, descripcion })
      const data = handleResponse(response)
      // ...
    }
    ```

### 12. Uso de patrón de estado global ⚠️
- **Estado**: ⚠️ PARCIALMENTE CUMPLIDO (Patrón personalizado, no Vuex/Pinia)
- **Evidencia**:
  - Estado reactivo implementado con `reactive()` de Vue 3
  - Servicios mantienen estado global:
    - `src/servicios/auth.js`: `const state = reactive({ usuarioActual: null })`
    - `src/servicios/playlists.js`: `const state = reactive({ playlists: [], cargando: false })`
    - `src/servicios/songs.js`: `const state = reactive({ canciones: [], cargando: false })`
  - Estado exportado y accesible globalmente:
    - `export const authState = { usuarioActual: computed(() => state.usuarioActual) }`
  - **Nota**: No usa Vuex ni Pinia, pero implementa un patrón de estado global funcional

## ❌ Requisitos NO Cumplidos

### 1. Vue CLI 3 ❌
- **Estado**: ❌ NO CUMPLIDO
- **Evidencia**:
  - El proyecto usa **Vite** en lugar de Vue CLI 3
  - `package.json` muestra: `"vite": "^7.1.11"`
  - `vite.config.js` presente en el proyecto
  - `package.json` scripts usan `vite` no `vue-cli-service`
- **Recomendación**: Si el requisito es obligatorio, migrar a Vue CLI 3 o aclarar si Vite es aceptable

## Resumen Ejecutivo

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Vue CLI 3 | ❌ No cumplido | Usa Vite en lugar de Vue CLI 3 |
| Framework CSS | ✅ Cumplido | Bootstrap 5.3.8 |
| Componentes (archivo único) | ✅ Cumplido | Todos los componentes son .vue |
| Componentes (múltiples archivos) | ⚠️ No encontrado | Solo componentes de archivo único |
| Métodos y computed | ✅ Cumplido | Uso extensivo |
| Directivas Data Binding | ✅ Cumplido | v-bind, v-on, v-model |
| Directivas estructurales | ⚠️ Parcial | Falta v-show y v-else-if |
| Directivas de atributos | ✅ Cumplido | :class usado dinámicamente |
| Lifecycle Hooks | ✅ Cumplido | onMounted usado |
| Props y eventos | ✅ Cumplido | Implementado correctamente |
| Formulario con validaciones | ✅ Cumplido | Validaciones HTML presentes |
| Routeo con parámetros | ⚠️ Parcial | Solo query params, no path params |
| API REST con axios/async-await | ✅ Cumplido | Implementado completamente |
| Estado global | ⚠️ Parcial | Patrón personalizado, no Vuex/Pinia |

## Puntuación Total

- **Cumplidos completamente**: 10/14 (71%)
- **Parcialmente cumplidos**: 3/14 (21%)
- **No cumplidos**: 1/14 (7%)

## Recomendaciones para Completar Requisitos Faltantes

1. **Agregar v-show y v-else-if**: Fáciles de implementar en cualquier componente
2. **Agregar ruta con parámetros dinámicos**: Crear una ruta como `/playlist/:id` o `/cancion/:id`
3. **Migrar a Vue CLI 3** o aclarar con el docente si Vite es aceptable (Vite es más moderno)
4. **Considerar agregar componente de múltiples archivos** si es un requisito específico
5. **Considerar usar Vuex/Pinia** si se requiere explícitamente un patrón de estado global estándar

