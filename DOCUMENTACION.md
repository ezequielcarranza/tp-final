# Documentación Técnica - Proyecto MusicApp

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Arquitectura del Backend](#arquitectura-del-backend)
4. [Arquitectura del Frontend](#arquitectura-del-frontend)
5. [Integración Frontend-Backend](#integración-frontend-backend)
6. [Base de Datos](#base-de-datos)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [API Endpoints](#api-endpoints)
9. [Servicios Externos](#servicios-externos)
10. [Flujos de Datos](#flujos-de-datos)
11. [Configuración y Despliegue](#configuración-y-despliegue)

---

## Introducción

**MusicApp** es una aplicación web completa para gestión y reproducción de música, desarrollada con una arquitectura moderna que separa frontend y backend. La aplicación permite a los usuarios gestionar canciones, crear playlists personalizadas, reproducir música y obtener estadísticas de uso.

### Tecnologías Principales

- **Frontend**: Vue 3, Vue Router, Vite, Axios, Bootstrap 5
- **Backend**: Express 5, Node.js
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT (JSON Web Tokens)
- **Servicios Externos**: Spotify API

---

## Estructura del Proyecto

```
proyecto-spotify/
├── src/                          # Frontend (Vue 3)
│   ├── assets/                   # Recursos estáticos (CSS)
│   │   ├── base.css
│   │   └── main.css
│   ├── components/               # Componentes Vue reutilizables
│   │   └── Navbar.vue
│   ├── servicios/                # Servicios del frontend
│   │   ├── api.js                # Configuración de Axios e interceptores
│   │   ├── auth.js               # Servicio de autenticación
│   │   ├── songs.js              # Servicio de canciones
│   │   ├── playlists.js          # Servicio de playlists
│   │   └── storage.js            # Gestión de localStorage
│   ├── views/                    # Vistas/páginas de la aplicación
│   │   ├── HomeView.vue          # Página principal
│   │   ├── LoginView.vue         # Login
│   │   ├── SignInView.vue        # Registro
│   │   ├── SongsView.vue         # Lista de canciones
│   │   ├── PlaylistsView.vue     # Gestión de playlists
│   │   ├── AdminSongsView.vue    # Admin: gestión de canciones
│   │   └── AdminUsersView.vue    # Admin: gestión de usuarios
│   ├── App.vue                   # Componente raíz
│   ├── main.js                   # Punto de entrada
│   ├── router.js                 # Configuración de rutas
│   └── bootstrap.js              # Configuración de Bootstrap
│
├── server/                       # Backend (Express)
│   ├── src/
│   │   ├── config/              # Configuración
│   │   │   └── config.js        # Variables de entorno
│   │   ├── controllers/         # Controladores (lógica de negocio)
│   │   │   ├── auth.controllers.js
│   │   │   ├── user.controllers.js
│   │   │   ├── song.controllers.js
│   │   │   ├── playlist.controllers.js
│   │   │   ├── playback.controllers.js
│   │   │   ├── stats.controllers.js
│   │   │   └── stats.export.controllers.js
│   │   ├── databases/           # Conexión a base de datos
│   │   │   ├── DatabaseFactory.js
│   │   │   └── supabase.cnx.js
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── userDTO.js
│   │   │   ├── songDTO.js
│   │   │   └── playlistDTO.js
│   │   ├── middleware/          # Middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   └── notFoundHandler.js
│   │   ├── models/              # Modelos de datos
│   │   │   ├── user.js
│   │   │   └── song.model.supabase.js
│   │   ├── repository/          # Repositorios (acceso a datos)
│   │   │   ├── repositoryFactory.js
│   │   │   ├── user.supabase.repository.js
│   │   │   ├── song.supabase.repository.js
│   │   │   ├── playlist.supabase.repository.js
│   │   │   └── playback.supabase.repository.js
│   │   ├── routers/             # Rutas de la API
│   │   │   ├── auth.routers.js
│   │   │   ├── user.router.js
│   │   │   ├── song.router.js
│   │   │   ├── playlist.router.js
│   │   │   ├── stats.router.js
│   │   │   └── stats.export.router.js
│   │   ├── services/            # Servicios de negocio
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── song.service.js
│   │   │   ├── playlist.service.js
│   │   │   ├── playback.service.js
│   │   │   ├── stats.service.js
│   │   │   └── external/
│   │   │       └── spotify.service.js
│   │   ├── utils/               # Utilidades
│   │   │   ├── validations.utils.js
│   │   │   └── string.utils.js
│   │   └── server.js            # Configuración del servidor Express
│   ├── sql/                     # Scripts SQL
│   │   ├── init_db.sql          # Esquema de base de datos
│   │   └── add_url_to_songs.sql
│   ├── test/                    # Tests HTTP
│   │   ├── auth.http
│   │   ├── user.http
│   │   ├── song.http
│   │   ├── playlist.http
│   │   ├── playback.http
│   │   └── stats.http
│   └── app.js                   # Punto de entrada del servidor
│
├── public/                      # Archivos públicos
│   ├── audio/                   # Archivos de audio de ejemplo
│   └── favicon.ico
│
├── package.json                 # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
├── jsconfig.json               # Configuración de JavaScript
├── index.html                   # HTML principal
├── README.md                    # Documentación básica
└── DOCUMENTACION.md            # Esta documentación
```

---

## Arquitectura del Backend

### Patrón Arquitectónico

El backend sigue una **arquitectura en capas** con separación de responsabilidades:

```
Request → Router → Middleware → Controller → Service → Repository → Database
         ↓
      Response ← DTO ← Service ← Repository ← Database
```

### Capas del Backend

#### 1. **Routers** (`server/src/routers/`)
Define las rutas HTTP y aplica middlewares de autenticación/autorización.

**Ejemplo: `song.router.js`**
```javascript
songRouter.use(authMiddleware);  // Todas las rutas requieren autenticación
songRouter.get('/songs', getAll);
songRouter.post('/play/:id', playSong);
songRouter.get('/:id', getById);
songRouter.delete('/:id', isAdmin, deleteSong);  // Solo admin
songRouter.post('/create', isAdmin, createSong);  // Solo admin
```

#### 2. **Middleware** (`server/src/middleware/`)
- **`auth.middleware.js`**: Verifica el token JWT y extrae información del usuario
- **`admin.middleware.js`**: Verifica que el usuario tenga rol ADMIN
- **`notFoundHandler.js`**: Maneja rutas no encontradas (404)

#### 3. **Controllers** (`server/src/controllers/`)
Reciben requests, validan datos, llaman a servicios y formatean respuestas usando DTOs.

**Flujo típico:**
```javascript
async function getAll(req, res) {
  try {
    const songs = await songService.getAllSongs();
    const formattedSongs = songListResponseDTO(songs);
    res.json({ status: 200, OK: true, payload: formattedSongs });
  } catch (error) {
    res.status(500).json({ status: 500, OK: false, message: error.message });
  }
}
```

#### 4. **Services** (`server/src/services/`)
Contienen la lógica de negocio. Validan datos, aplican reglas de negocio y coordinan repositorios.

**Ejemplo: `song.service.js`**
```javascript
async createSong({ titulo, artista }) {
  // 1. Obtener datos de Spotify
  const spotifyData = await fetchDataSpotify(titulo, artista);
  
  // 2. Preparar datos
  const song = {
    titulo,
    artista,
    album: spotifyData.albumName ?? 'sin album',
    genero: spotifyData.genres?.length ? spotifyData.genres : ['Sin género'],
    // ...
  };
  
  // 3. Guardar en base de datos
  return await database.createOne(song);
}
```

#### 5. **Repositories** (`server/src/repository/`)
Abstraen el acceso a la base de datos. Implementan operaciones CRUD específicas para cada entidad.

**Patrón Factory:**
```javascript
// repositoryFactory.js
static getSongRepository() {
  const databaseType = config.DATABASE ?? 'supabase';
  switch (databaseType) {
    case 'supabase':
      return new SongRepositorySupabase();
    default:
      throw new Error(`Tipo de base de datos no soportado`);
  }
}
```

#### 6. **DTOs** (`server/src/dto/`)
Transforman datos entre el formato de la base de datos y el formato de la API.

**Ejemplo: `songDTO.js`**
```javascript
export const songResponseDTO = (song) => {
  return {
    id: song.id,
    titulo: toTitleCase(song.titulo),  // Normalización
    artista: toTitleCase(song.artista),
    duracion: formatDuration(song.duracion),  // Conversión segundos → mm:ss
    fechaLanzamiento: song.fecha_lanzamiento,  // snake_case → camelCase
    // ...
  };
};
```

#### 7. **Database Factory** (`server/src/databases/`)
Patrón Singleton para gestionar la conexión a Supabase.

```javascript
class SupaBaseConnection {
  static #instance = null;
  
  static connect() {
    if (!SupaBaseConnection.#instance) {
      SupaBaseConnection.#instance = createClient(
        config.SUPABASE_URL,
        config.SUPABASE_API_KEY
      );
    }
    return SupaBaseConnection.#instance;
  }
}
```

### Flujo de una Petición

1. **Request** llega a Express (`server.js`)
2. **Router** (`song.router.js`) captura la ruta
3. **Middleware** (`auth.middleware.js`) valida token JWT
4. **Controller** (`song.controllers.js`) recibe request
5. **Service** (`song.service.js`) ejecuta lógica de negocio
6. **Repository** (`song.supabase.repository.js`) consulta base de datos
7. **DTO** (`songDTO.js`) formatea respuesta
8. **Response** se envía al cliente

---

## Arquitectura del Frontend

### Patrón Arquitectónico

El frontend sigue una **arquitectura basada en servicios** con estado reactivo:

```
Component → Service → API (Axios) → Backend
         ↑
    Estado Reactivo (Vue)
```

### Estructura del Frontend

#### 1. **Vistas** (`src/views/`)
Componentes de página que representan rutas completas.

**Rutas definidas:**
- `/login` → `LoginView.vue`
- `/registro` → `SignInView.vue`
- `/inicio` → `HomeView.vue` (requiere auth)
- `/canciones` → `SongsView.vue` (requiere auth)
- `/playlists` → `PlaylistsView.vue` (requiere auth)
- `/admin/canciones` → `AdminSongsView.vue` (requiere admin)
- `/admin/usuarios` → `AdminUsersView.vue` (requiere admin)

#### 2. **Componentes** (`src/components/`)
Componentes reutilizables:
- `Navbar.vue`: Barra de navegación con información del usuario

#### 3. **Servicios** (`src/servicios/`)
Gestionan el estado y la comunicación con el backend.

**`auth.js`** - Autenticación:
```javascript
const state = reactive({
  usuarioActual: null,
});

export const authService = {
  async login({ email, password }) {
    const response = await api.post('/api/auth/login', { email, password });
    tokenService.setToken(response.data.token);
    state.usuarioActual = { /* datos del usuario */ };
    return state.usuarioActual;
  },
  
  logout() {
    state.usuarioActual = null;
    tokenService.clearToken();
  },
  
  isAuthenticated() {
    return Boolean(state.usuarioActual && tokenService.getToken());
  },
  
  isAdmin() {
    return state.usuarioActual?.rol === 'admin';
  },
};
```

**`songs.js`** - Gestión de canciones:
```javascript
const state = reactive({
  canciones: [],
  cargando: false,
});

export const songsService = {
  async recargar() {
    await cargarCanciones();  // Carga desde backend
    return state.canciones;
  },
  
  obtenerTodas() {
    return state.canciones;  // Retorna estado local
  },
  
  async crear(datos) {
    const nuevaCancion = await api.post('/api/song/create', datos);
    state.canciones.push(nuevaCancion);  // Actualiza estado local
    return nuevaCancion;
  },
};
```

**`playlists.js`** - Gestión de playlists:
Similar a `songs.js`, mantiene estado local de playlists y sincroniza con backend.

#### 4. **API Client** (`src/servicios/api.js`)
Configuración centralizada de Axios con interceptores.

**Interceptores:**
- **Request**: Agrega token JWT automáticamente a todas las peticiones
- **Response**: Maneja errores 401 (token expirado) y redirige a login

```javascript
// Interceptor de request
api.interceptors.request.use((config) => {
  const token = loadState(TOKEN_KEY, null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearState(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 5. **Router** (`src/router.js`)
Configuración de rutas con guards de autenticación.

```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  // Proteger rutas que requieren autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // Proteger rutas de admin
  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'inicio' });
  }

  // Redirigir a inicio si ya está autenticado y va a login/registro
  if ((to.name === 'login' || to.name === 'registro') && isAuthenticated) {
    return next({ name: 'inicio' });
  }

  return next();
});
```

#### 6. **Storage** (`src/servicios/storage.js`)
Abstracción sobre `localStorage` con fallback a memoria.

```javascript
export function loadState(key, fallback) {
  try {
    const stored = storage.getItem(key);
    if (!stored) return clone(fallback);
    return JSON.parse(stored);
  } catch (error) {
    return clone(fallback);
  }
}
```

### Estado Reactivo

El frontend usa **Vue 3 Composition API** con estado reactivo:

- Cada servicio mantiene su propio estado reactivo (`reactive()`)
- Los componentes acceden al estado mediante `computed()` o directamente
- Los cambios en el estado se propagan automáticamente a los componentes

---

## Integración Frontend-Backend

### Comunicación HTTP

El frontend se comunica con el backend mediante **REST API** usando Axios.

### Proxy de Vite

Vite está configurado para redirigir peticiones `/api/*` al backend:

```javascript
// vite.config.js
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

**Flujo:**
1. Frontend hace petición: `api.get('/api/song/songs')`
2. Vite proxy redirige a: `http://127.0.0.1:3001/api/song/songs`
3. Backend procesa y responde
4. Frontend recibe respuesta

### Formato de Respuestas

**Backend responde:**
```json
{
  "status": 200,
  "OK": true,
  "payload": { /* datos */ },
  "message": "Operación exitosa",
  "token": "jwt_token"  // Solo en login
}
```

**Frontend procesa:**
```javascript
export const handleResponse = (response) => {
  const data = response.data;
  if (data.OK) {
    return data.payload || data;
  }
  throw new Error(data.message || 'Error en la petición');
};
```

### Autenticación

1. **Login:**
   - Frontend envía `POST /api/auth/login` con `{ email, password }`
   - Backend valida credenciales y retorna JWT
   - Frontend guarda token en `localStorage`
   - Frontend decodifica token y actualiza estado de usuario

2. **Peticiones Autenticadas:**
   - Interceptor de Axios agrega `Authorization: Bearer <token>` automáticamente
   - Backend valida token con `authMiddleware`
   - Si token es inválido, backend responde 401
   - Frontend intercepta 401 y redirige a login

### Sincronización de Estado

El frontend mantiene estado local para:
- **Performance**: Evita recargar datos innecesariamente
- **UX**: Interfaz más rápida y fluida
- **Offline**: Funciona parcialmente sin conexión

**Estrategia:**
- Estado local se actualiza después de operaciones exitosas
- Recarga manual disponible cuando es necesario
- Sincronización automática en operaciones críticas

---

## Base de Datos

### Esquema de Base de Datos

La aplicación usa **Supabase (PostgreSQL)** con las siguientes tablas:

#### 1. **`users`** - Usuarios
```sql
CREATE TABLE public.users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL,
  apellido         TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  password         TEXT NOT NULL,  -- Hash bcrypt
  role             TEXT NOT NULL DEFAULT 'USER',  -- 'USER' o 'ADMIN'
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **`songs`** - Canciones
```sql
CREATE TABLE public.songs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           TEXT NOT NULL,
  artista          TEXT NOT NULL,
  album            TEXT DEFAULT 'sin album',
  genero           TEXT[] NOT NULL,  -- Array de géneros
  duracion         INTEGER NOT NULL,  -- En segundos
  portada          TEXT DEFAULT 'no disponible',
  fecha_lanzamiento DATE,
  url              TEXT,  -- URL de audio (preview de Spotify o personalizada)
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **`playlists`** - Playlists
```sql
CREATE TABLE public.playlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. **`playlist_songs`** - Relación Playlist-Canción
```sql
CREATE TABLE public.playlist_songs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id     UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id         UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(playlist_id, song_id)  -- Evita duplicados
);
```

#### 5. **`playback_log`** - Log de Reproducciones
```sql
CREATE TABLE public.playback_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  song_id         UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Funciones SQL

La base de datos incluye funciones para estadísticas:

- **`top_songs_global(limit)`**: Top canciones globales
- **`top_songs_by_user(user_uuid, limit)`**: Top canciones por usuario
- **`top_artists_by_user(user_uuid, limit)`**: Top artistas por usuario
- **`top_albums_by_user(user_uuid, limit)`**: Top álbumes por usuario
- **`top_genres_by_user(user_uuid, limit)`**: Top géneros por usuario

### Repositorios

Cada entidad tiene su repositorio que implementa operaciones CRUD:

**Ejemplo: `song.supabase.repository.js`**
```javascript
async getAll() {
  const { data, error } = await this.supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

async createOne(song) {
  const { data, error } = await this.supabase
    .from('songs')
    .insert(song)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

---

## Autenticación y Autorización

### Autenticación (JWT)

#### Flujo de Login

1. **Usuario envía credenciales:**
   ```javascript
   POST /api/auth/login
   { "email": "user@example.com", "password": "password123" }
   ```

2. **Backend valida:**
   - Verifica que email y password no estén vacíos
   - Normaliza email (trim + lowercase)
   - Busca usuario en base de datos
   - Compara password con hash bcrypt
   - Genera JWT con datos del usuario

3. **Backend responde:**
   ```json
   {
     "status": 200,
     "OK": true,
     "payload": {
       "id": "uuid",
       "nombre": "Juan",
       "apellido": "Pérez",
       "email": "user@example.com",
       "role": "USER"
     },
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

4. **Frontend guarda token:**
   - Almacena en `localStorage` con clave `spotify-token`
   - Decodifica token para obtener datos del usuario
   - Actualiza estado reactivo `authState.usuarioActual`

#### Estructura del JWT

**Payload:**
```json
{
  "subject": "user_id",
  "email": "user@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Configuración:**
- **Secret**: `JWT_SECRET_KEY` (variable de entorno)
- **Expiración**: `JWT_ACCES_EXPIRES` (default: 24h)

### Autorización

#### Middleware de Autenticación

**`auth.middleware.js`:**
```javascript
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      status: 401,
      OK: false,
      message: 'No se ha proporcionado token de autenticación',
    });
  }
  
  const token = authHeader.split(' ')[1];  // "Bearer <token>"
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
    req.user = {
      id: decoded.subject,
      email: decoded.email,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      OK: false,
      message: 'Token inválido o expirado',
    });
  }
}
```

#### Middleware de Admin

**`admin.middleware.js`:**
```javascript
export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      status: 403,
      OK: false,
      message: 'No tenés permisos para acceder a este recurso',
    });
  }
  next();
}
```

#### Protección de Rutas

**Backend:**
```javascript
// Requiere autenticación
songRouter.use(authMiddleware);

// Requiere admin
songRouter.post('/create', isAdmin, createSong);
songRouter.delete('/:id', isAdmin, deleteSong);
```

**Frontend:**
```javascript
// Router guard
if (to.meta.requiresAuth && !isAuthenticated) {
  return next({ name: 'login' });
}

if (to.meta.requiresAdmin && !isAdmin) {
  return next({ name: 'inicio' });
}
```

---

## API Endpoints

### Autenticación

#### `POST /api/auth/login`
Iniciar sesión.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": 200,
  "OK": true,
  "payload": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "user@example.com",
    "role": "USER"
  },
  "token": "jwt_token"
}
```

---

### Usuarios

#### `POST /api/user/create`
Crear nuevo usuario (público).

**Request:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "user@example.com",
  "fecha_nacimiento": "2000-01-01",
  "password": "password123"
}
```

#### `GET /api/user/users`
Obtener todos los usuarios (requiere admin).

#### `GET /api/user/:id`
Obtener usuario por ID (requiere auth).

#### `PATCH /api/user/:id`
Actualizar usuario (requiere auth, solo propio o admin).

#### `DELETE /api/user/:id`
Eliminar usuario (requiere auth, solo propio o admin).

---

### Canciones

#### `GET /api/song/songs`
Obtener todas las canciones (requiere auth).

**Response:**
```json
{
  "status": 200,
  "OK": true,
  "payload": [
    {
      "id": "uuid",
      "titulo": "The Scientist",
      "artista": "Coldplay",
      "album": "A Rush of Blood to the Head",
      "genero": ["Alternative Rock"],
      "duracion": "04:26",
      "portada": "url",
      "fechaLanzamiento": "2002-08-26",
      "url": "preview_url"
    }
  ]
}
```

#### `GET /api/song/:id`
Obtener canción por ID (requiere auth).

#### `POST /api/song/create`
Crear canción (requiere admin).

**Request:**
```json
{
  "titulo": "The Scientist",
  "artista": "Coldplay"
}
```

**Nota:** El backend busca automáticamente datos en Spotify API.

#### `PATCH /api/song/:id`
Actualizar canción (requiere admin).

#### `DELETE /api/song/:id`
Eliminar canción (requiere admin).

#### `POST /api/song/play/:id`
Registrar reproducción (requiere auth).

---

### Playlists

#### `GET /api/playlist/playlists`
Obtener todas las playlists del usuario autenticado (requiere auth).

#### `GET /api/playlist/playlists/:id`
Obtener playlist por ID (requiere auth, solo propia).

#### `POST /api/playlist/playlists`
Crear playlist (requiere auth).

**Request:**
```json
{
  "nombre": "Mi Playlist",
  "descripcion": "Descripción opcional"
}
```

#### `PATCH /api/playlist/playlists/:id`
Actualizar playlist (requiere auth, solo propia).

#### `DELETE /api/playlist/playlists/:id`
Eliminar playlist (requiere auth, solo propia).

#### `GET /api/playlist/playlists/:id/songs`
Obtener canciones de una playlist (requiere auth, solo propia).

#### `POST /api/playlist/playlists/:id/songs`
Agregar canción a playlist (requiere auth, solo propia).

**Request:**
```json
{
  "songId": "uuid"
}
```

#### `DELETE /api/playlist/playlists/:id/songs/:songId`
Quitar canción de playlist (requiere auth, solo propia).

---

### Estadísticas

#### `GET /api/stats/top-songs?limit=10`
Top canciones globales (requiere auth).

#### `GET /api/stats/top-songs-user?limit=10`
Top canciones del usuario (requiere auth).

#### `GET /api/stats/top-artists?limit=10`
Top artistas del usuario (requiere auth).

#### `GET /api/stats/top-albums?limit=10`
Top álbumes del usuario (requiere auth).

#### `GET /api/stats/top-genres?limit=10`
Top géneros del usuario (requiere auth).

#### `GET /api/stats/export?limit=10`
Exportar estadísticas a Excel (requiere auth).

---

## Servicios Externos

### Spotify API

El backend integra con **Spotify API** para enriquecer datos de canciones.

#### Flujo de Integración

1. **Obtener Token de Acceso:**
   - Usa **Client Credentials Flow**
   - Token se cachea y renueva automáticamente

2. **Buscar Track:**
   - Busca por título y artista
   - Obtiene información del track

3. **Obtener Géneros:**
   - Consulta información del artista
   - Extrae géneros del artista

4. **Retornar Datos:**
   - Album, portada, duración, géneros, preview URL

**Implementación: `spotify.service.js`**
```javascript
export async function fetchDataSpotify(titulo, artista) {
  // 1. Obtener token (con cache)
  const token = await getSpotifyToken();
  
  // 2. Buscar track
  const track = await searchTrack(titulo, artista);
  
  // 3. Obtener géneros del artista
  const genres = await fetchArtistGenres(track.artists[0].id);
  
  // 4. Formatear y retornar
  return {
    albumName: track.album?.name,
    albumReleaseDate: track.album?.release_date,
    durationSeg: Math.floor(track.duration_ms / 1000),
    genres,
    cover: track.album?.images[0]?.url,
    previewUrl: track.preview_url,
  };
}
```

**Uso en Service:**
```javascript
// song.service.js
async createSong({ titulo, artista }) {
  const spotifyData = await fetchDataSpotify(titulo, artista);
  
  const song = {
    titulo,
    artista,
    album: spotifyData.albumName ?? 'sin album',
    genero: spotifyData.genres?.length ? spotifyData.genres : ['Sin género'],
    duracion: spotifyData.durationSeg ?? 0,
    portada: spotifyData.cover ?? 'no disponible',
    url: spotifyData.previewUrl ?? null,
  };
  
  return await database.createOne(song);
}
```

**Configuración:**
- `SPOTIFY_CLIENT_ID`: Client ID de Spotify
- `SPOTIFY_CLIENT_SECRET`: Client Secret de Spotify
- `SPOTIFY_API_BASE`: `https://api.spotify.com/v1`
- `SPOTIFY_TOKEN_URL`: `https://accounts.spotify.com/api/token`

---

## Flujos de Datos

### Flujo de Registro

1. Usuario completa formulario en `SignInView.vue`
2. `authService.registrar()` envía `POST /api/user/create`
3. Backend valida datos y crea usuario
4. Frontend automáticamente hace login
5. Frontend crea playlist "Favoritos" por defecto
6. Usuario es redirigido a `/inicio`

### Flujo de Reproducción

1. Usuario hace clic en "Reproducir" en `SongsView.vue`
2. `songsService.reproducir(id)` envía `POST /api/song/play/:id`
3. Backend registra en `playback_log`
4. Frontend reproduce audio (si hay URL disponible)
5. Estadísticas se actualizan automáticamente

### Flujo de Creación de Playlist

1. Usuario crea playlist en `PlaylistsView.vue`
2. `playlistService.crear()` envía `POST /api/playlist/playlists`
3. Backend crea playlist y retorna datos
4. Frontend actualiza estado local
5. Usuario puede agregar canciones

### Flujo de Agregar Canción a Playlist

1. Usuario selecciona canción y playlist
2. `playlistService.agregarCancion()` envía `POST /api/playlist/playlists/:id/songs`
3. Backend valida permisos y agrega relación
4. Frontend actualiza estado local de la playlist

### Flujo de Creación de Canción (Admin)

1. Admin completa formulario en `AdminSongsView.vue`
2. `songsService.crear()` envía `POST /api/song/create` con `{ titulo, artista }`
3. Backend llama a `fetchDataSpotify()` para obtener datos
4. Backend crea canción con datos enriquecidos
5. Frontend actualiza lista de canciones

---

## Configuración y Despliegue

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_API_KEY=tu_api_key
DATABASE=supabase

# Servidor
SERVER_PORT=3001
SERVER_HOST=localhost

# JWT
JWT_SECRET_KEY=tu_secret_key_muy_segura_minimo_32_caracteres
JWT_ACCES_EXPIRES=24h

# Spotify API (opcional)
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
SPOTIFY_API_BASE=https://api.spotify.com/v1
SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token

# Frontend (opcional)
VITE_API_BASE_URL=http://127.0.0.1:3001
```

### Scripts NPM

```json
{
  "start": "vite --open",              // Inicia frontend y abre navegador
  "dev": "vite",                       // Frontend en desarrollo
  "dev:server": "node --watch server/app.js",  // Backend en desarrollo
  "dev:all": "concurrently \"npm run dev:server\" \"npm run dev\"",  // Ambos
  "build": "vite build",               // Build de producción
  "preview": "vite preview",           // Preview del build
  "linter:format": "npx @biomejs/biome format --write ./server/src server/app.js"
}
```

### Configuración de Base de Datos

1. Crear proyecto en Supabase
2. Ejecutar `server/sql/init_db.sql` en el SQL Editor
3. Configurar `SUPABASE_URL` y `SUPABASE_API_KEY` en `.env`

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar backend y frontend
npm run dev:all

# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

### Producción

```bash
# Build del frontend
npm run build

# El build se genera en /dist
# Servir con un servidor estático (nginx, Apache, etc.)
# Backend debe estar en un servidor Node.js
```

### Puertos

- **Backend**: `3001` (configurable con `SERVER_PORT`)
- **Frontend**: `5173` (puerto por defecto de Vite, cambia automáticamente si está ocupado)

### CORS

El backend tiene CORS habilitado para permitir peticiones del frontend:

```javascript
// server.js
server.use(cors());
```

---

## Consideraciones Adicionales

### Seguridad

- **Passwords**: Hasheados con bcrypt (10 rounds)
- **JWT**: Firmados con secret key, expiración configurable
- **Validación**: Datos validados en backend antes de procesar
- **Autorización**: Middleware verifica permisos en cada ruta

### Performance

- **Estado Local**: Frontend cachea datos para reducir peticiones
- **Token Cache**: Spotify token se cachea para evitar requests innecesarios
- **Lazy Loading**: Vistas cargadas bajo demanda con `import()`

### Escalabilidad

- **Factory Pattern**: Permite cambiar de base de datos fácilmente
- **Repository Pattern**: Abstrae acceso a datos
- **Service Layer**: Lógica de negocio separada de controladores

### Mantenibilidad

- **Separación de Responsabilidades**: Cada capa tiene una función clara
- **DTOs**: Transformación de datos centralizada
- **Validaciones**: Utilidades reutilizables
- **Código Limpio**: Sin código deprecado o comentado

---

## Conclusión

Esta documentación cubre la arquitectura, estructura e integración del proyecto MusicApp. Para más detalles sobre implementación específica, consultar los archivos fuente comentados en el código.

**Última actualización**: Después de limpieza de código deprecado (2024)

