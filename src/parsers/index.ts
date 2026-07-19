import type { Channel } from '../types'
import { parseJsonPlaylist } from './json'
import { parseM3u } from './m3u'

export function parsePlaylist(content: string, filename: string): Channel[] {
  const lower = filename.toLowerCase()

  if (lower.endsWith('.json')) {
    const channels = parseJsonPlaylist(content)
    if (channels.length === 0) {
      throw new Error('No valid channels found in JSON file.')
    }
    return channels
  }

  if (lower.endsWith('.m3u') || lower.endsWith('.m3u8')) {
    const channels = parseM3u(content)
    if (channels.length === 0) {
      throw new Error('No valid channels found in M3U file.')
    }
    return channels
  }

  // Try M3U first, then JSON
  if (content.trim().startsWith('#EXTM3U') || content.includes('#EXTINF:')) {
    const channels = parseM3u(content)
    if (channels.length > 0) return channels
  }

  try {
    const channels = parseJsonPlaylist(content)
    if (channels.length > 0) return channels
  } catch {
    // fall through
  }

  throw new Error('Unsupported file format. Use .m3u or .json playlists.')
}
