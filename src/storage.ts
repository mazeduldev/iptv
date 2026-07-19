import type { Channel } from "./types";

const STORAGE_KEY = "iptv:playlist";

export interface StoredPlaylist {
  channels: Channel[];
  playlistName: string | null;
  selectedId: string | null;
}

export function loadPlaylist(): StoredPlaylist | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredPlaylist;
    if (!Array.isArray(parsed.channels)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function savePlaylist(playlist: StoredPlaylist): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
  } catch {
    // Storage may be full or unavailable (private mode); ignore.
  }
}

export function clearPlaylist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
