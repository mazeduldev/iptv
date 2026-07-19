import { useMemo, useState } from 'react'
import type { Channel } from '../types'

interface ChannelListProps {
  channels: Channel[]
  selectedId: string | null
  onSelect: (channel: Channel) => void
}

export function ChannelList({
  channels,
  selectedId,
  onSelect,
}: ChannelListProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return channels
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.group?.toLowerCase().includes(q),
    )
  }, [channels, query])

  const grouped = useMemo(() => {
    const map = new Map<string, Channel[]>()
    for (const channel of filtered) {
      const key = channel.group || 'Uncategorized'
      const list = map.get(key) ?? []
      list.push(channel)
      map.set(key, list)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <aside className="channels">
      <div className="channels__header">
        <h2>Channels</h2>
        <span className="channels__count">{channels.length}</span>
      </div>
      <input
        type="search"
        className="channels__search"
        placeholder="Search channels..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="channels__list">
        {grouped.length === 0 && (
          <p className="channels__empty">No channels match your search.</p>
        )}
        {grouped.map(([group, items]) => (
          <section key={group} className="channels__group">
            <h3>{group}</h3>
            <ul>
              {items.map((channel) => (
                <li key={channel.id}>
                  <button
                    type="button"
                    className={
                      selectedId === channel.id
                        ? 'channel channel--active'
                        : 'channel'
                    }
                    onClick={() => onSelect(channel)}
                  >
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt=""
                        className="channel__logo"
                        loading="lazy"
                      />
                    ) : (
                      <span className="channel__logo channel__logo--placeholder">
                        TV
                      </span>
                    )}
                    <span className="channel__name">{channel.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
