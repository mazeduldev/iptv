import type { Channel } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function extractUrl(entry: Record<string, unknown>): string | null {
  const candidates = ['url', 'stream', 'link', 'src', 'stream_url', 'streamUrl']
  for (const key of candidates) {
    const value = entry[key]
    if (typeof value === 'string' && value.startsWith('http')) return value
  }
  return null
}

function extractName(entry: Record<string, unknown>, index: number): string {
  const candidates = ['name', 'title', 'label', 'channel']
  for (const key of candidates) {
    const value = entry[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return `Channel ${index + 1}`
}

function entryToChannel(entry: unknown, index: number): Channel | null {
  if (!isRecord(entry)) return null

  const url = extractUrl(entry)
  if (!url) return null

  const logo =
    typeof entry.logo === 'string'
      ? entry.logo
      : typeof entry.icon === 'string'
        ? entry.icon
        : typeof entry.tvgLogo === 'string'
          ? entry.tvgLogo
          : undefined

  const group =
    typeof entry.group === 'string'
      ? entry.group
      : typeof entry.category === 'string'
        ? entry.category
        : typeof entry.groupTitle === 'string'
          ? entry.groupTitle
          : undefined

  return {
    id: `${index}-${url}`,
    name: extractName(entry, index),
    url,
    logo,
    group,
  }
}

function findChannelArray(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data

  if (!isRecord(data)) return null

  const keys = ['channels', 'streams', 'stations', 'items', 'playlist']
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key] as unknown[]
  }

  return null
}

export function parseJsonPlaylist(content: string): Channel[] {
  const data: unknown = JSON.parse(content)
  const entries = findChannelArray(data)

  if (!entries) {
    throw new Error(
      'JSON must be an array of channels or an object with a "channels" array.',
    )
  }

  return entries
    .map((entry, index) => entryToChannel(entry, index))
    .filter((channel): channel is Channel => channel !== null)
}
