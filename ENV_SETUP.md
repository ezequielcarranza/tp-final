# Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto `proyecto-spotify/` con el siguiente contenido:

```env
# Base de datos
SUPABASE_URL=tu_url_de_supabase_aqui
SUPABASE_API_KEY=tu_api_key_de_supabase_aqui
DATABASE=supabase

# Servidor
SERVER_PORT=3000
SERVER_HOST=localhost

# JWT - IMPORTANTE: Cambia esto por una clave secreta segura
JWT_SECRET_KEY=tu_secret_key_muy_segura_aqui_cambiar_esto
JWT_ACCES_EXPIRES=24h

# Spotify API (opcional)
SPOTIFY_CLIENT_ID=tu_client_id_opcional
SPOTIFY_CLIENT_SECRET=tu_client_secret_opcional
SPOTIFY_API_BASE=https://api.spotify.com/v1
SPOTIFY_TOKEN_URL=https://accounts.spotify.com/api/token
```

## Pasos para crear el archivo .env:

1. En la raíz del proyecto `proyecto-spotify/`, crea un archivo llamado `.env`
2. Copia el contenido de arriba
3. Reemplaza los valores con tus credenciales reales:
   - `SUPABASE_URL`: Tu URL de proyecto Supabase
   - `SUPABASE_API_KEY`: Tu API key de Supabase
   - `JWT_SECRET_KEY`: Una clave secreta aleatoria y segura (puedes generar una con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

## Nota importante:

El archivo `.env` está en el `.gitignore` y NO debe subirse al repositorio por seguridad.

