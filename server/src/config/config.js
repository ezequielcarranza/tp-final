import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar dotenv para buscar el .env en la raíz del proyecto
dotenv.config({ path: join(__dirname, '../../../.env') });

const {
  //MONGO_URI,
  SUPABASE_URL,
  SUPABASE_API_KEY,
  DATABASE,
  SERVER_PORT,
  SERVER_HOST,
  JWT_SECRET_KEY,
  JWT_ACCES_EXPIRES,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_API_BASE,
  SPOTIFY_TOKEN_URL,
} = process.env;

export const config = {
  //MONGO_URI,
  SUPABASE_URL,
  SUPABASE_API_KEY,
  DATABASE,
  SERVER_PORT,
  SERVER_HOST,
  JWT_SECRET_KEY,
  JWT_ACCES_EXPIRES,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_API_BASE,
  SPOTIFY_TOKEN_URL,
};
