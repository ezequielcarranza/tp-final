-- Agregar campo url a la tabla songs para almacenar la URL del audio
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Comentario para documentar el campo
COMMENT ON COLUMN public.songs.url IS 'URL del archivo de audio (preview de Spotify o URL personalizada)';

