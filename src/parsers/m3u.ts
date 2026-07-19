import type { Channel } from '../types'

function parseExtInf(line: string): Partial<Channel> {
  const info: Partial<Channel> = {}

  const logoMatch = line.match(/tvg-logo="([^"]*)"/i)
  if (logoMatch) info.logo = logoMatch[1]

  const groupMatch = line.match(/group-title="([^"]*)"/i)
  if (groupMatch) info.group = groupMatch[1]

  const commaIndex = line.lastIndexOf(',')
  if (commaIndex !== -1) {
    info.name = line.slice(commaIndex + 1).trim()
  }

  return info
}

export function parseM3u(content: string): Channel[] {
  const lines = content.split(/\r?\n/)
  const channels: Channel[] = []
  let pending: Partial<Channel> | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#EXTM3U')) continue

    if (line.startsWith('#EXTINF:')) {
      pending = parseExtInf(line)
      continue
    }

    if (line.startsWith('#')) continue

    const url = line
    if (!url.startsWith('http://') && !url.startsWith('https://')) continue

    const name = pending?.name || `Channel ${channels.length + 1}`
    channels.push({
      id: `${channels.length}-${url}`,
      name,
      url,
      logo: pending?.logo,
      group: pending?.group,
    })
    pending = null
  }

  return channels
}
