# Proyecto Spotify - Aplicación de Música Completa

Aplicación web completa de música con frontend en Vue 3 y backend en Express integrados en un solo proyecto.

## 🏗️ Estructura del Proyecto

```
proyecto-spotify/
├── src/              # Frontend (Vue 3 + Vite)
│   ├── components/   # Componentes Vue
│   ├── views/        # Vistas/páginas
│   ├── servicios/    # Servicios del frontend
│   └── ...
├── server/           # Backend (Express)
│   ├── src/          # Código fuente del backend
│   │   ├── config/   # Configuración
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routers/
│   │   └── ...
│   ├── sql/          # Scripts SQL
│   └── test/         # Tests HTTP
└── ...
```

## 📋 Requisitos Previos

- Node.js >= 20.19.0 o >= 22.12.0
- npm >= 6.0.0
- Base de datos Supabase (o configurar otra base de datos)

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```sh
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `proyecto-spotify/` con las siguientes variables:

```env
# Base de datos
SUPABASE_URL=tu_url_de_supabase
SUPABASE_API_KEY=tu_api_key_de_supabase
DATABASE=supabase

# Servidor
SERVER_PORT=3000
SERVER_HOST=localhost

# JWT
JWT_SECRET_KEY=tu_secret_key_muy_segura
JWT_ACCES_EXPIRES=24h

# Spotify API (opcional)
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret
SPOTIFY_API_BASE=https://api.spotify.com/v1
SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token
```

**Nota:** El archivo `.env` está en el `.gitignore` por seguridad. No lo subas al repositorio.

### 3. Configurar Base de Datos

Ejecuta los scripts SQL en `server/sql/` en tu base de datos Supabase para crear las tablas necesarias.

## 🎯 Ejecutar el Proyecto

### Desarrollo (Frontend y Backend juntos)

Para ejecutar tanto el frontend como el backend simultáneamente:

```sh
npm run dev:all
```

Este comando iniciará:
- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173` (o el puerto que Vite asigne)

### Desarrollo (Solo Frontend)

```sh
npm run dev
```

### Desarrollo (Solo Backend)

```sh
npm run dev:server
```

### Producción

```sh
# Construir frontend
npm run build

# Previsualizar build de producción
npm run preview
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia solo el frontend en modo desarrollo
- `npm run dev:server` - Inicia solo el backend en modo desarrollo
- `npm run dev:all` - Inicia frontend y backend simultáneamente
- `npm run build` - Construye el frontend para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run linter:format` - Formatea el código del backend con Biome

## 🔧 Configuración del Proxy

El frontend está configurado para usar un proxy que redirige las peticiones `/api/*` al backend. Esto está configurado en `vite.config.js`.

Si necesitas cambiar el puerto del backend, actualiza la variable `SERVER_PORT` en el archivo `.env`.

## 📚 API Endpoints

El backend expone los siguientes endpoints:

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/user/create` - Registrar nuevo usuario
- `GET /api/song/songs` - Obtener todas las canciones
- `GET /api/playlist/playlists` - Obtener playlists del usuario
- Y más...

Consulta los archivos en `server/test/` para ver ejemplos de uso de la API.

## 🛠️ Tecnologías Utilizadas

### Frontend
- Vue 3
- Vue Router
- Vite
- Axios
- Bootstrap 5

### Backend
- Express 5
- Supabase (Base de datos)
- JWT (Autenticación)
- bcryptjs (Hash de contraseñas)
- Morgan (Logging)

## 📖 Recomendaciones IDE

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Desactiva Vetur si lo tienes instalado

## 🌐 Navegadores Recomendados

- Chromium-based browsers (Chrome, Edge, Brave, etc.)
- Firefox

Instala las extensiones de Vue.js DevTools para mejor experiencia de desarrollo.

## 📄 Licencia

Este proyecto es privado.
