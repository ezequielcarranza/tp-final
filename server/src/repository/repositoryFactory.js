// src/repository/repositoryFactory.js
import { config } from '../config/config.js';
import SongRepositorySupabase from './song.supabase.repository.js';
import UserRepositorySupabase from './user.supabase.repository.js';
import PlaybackRepositorySupabase from './playback.supabase.repository.js';
import PlaylistRepositorySupabase from './playlist.supabase.repository.js';

export class RepositoryFactory {
  static #getDatabaseType() {
    return (config.DATABASE ?? 'supabase').toLowerCase();
  }

  static getSongRepository() {
    const databaseType = this.#getDatabaseType();

    switch (databaseType) {
      case 'supabase':
        return new SongRepositorySupabase();

      default:
        throw new Error(`Tipo de base de datos no soportado para songs: ${databaseType}`);
    }
  }

  static getUserRepository() {
    const databaseType = this.#getDatabaseType();

    switch (databaseType) {
      case 'supabase':
        return new UserRepositorySupabase();

      default:
        throw new Error(`Tipo de base de datos no soportado para users: ${databaseType}`);
    }
  }

  static getPlaybackRepository() {
    const databaseType = this.#getDatabaseType();

    switch (databaseType) {
      case 'supabase':
        return new PlaybackRepositorySupabase();

      default:
        throw new Error(`Tipo de base de datos no soportado para playback_log: ${databaseType}`);
    }
  }

  static getPlaylistRepository() {
    const databaseType = this.#getDatabaseType();

    switch (databaseType) {
      case 'supabase':
        return new PlaylistRepositorySupabase();

      default:
        throw new Error(`Tipo de base de datos no soportado para playlists: ${databaseType}`);
    }
  }
}
