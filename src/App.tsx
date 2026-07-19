import { useEffect, useState } from 'react'
import { ChannelList } from './components/ChannelList'
import { PlaylistInput } from './components/PlaylistInput'
import { VideoPlayer } from './components/VideoPlayer'
import { clearPlaylist, loadPlaylist, savePlaylist } from './storage'
import type { Channel } from './types'
import './App.css'

const persisted = loadPlaylist()

function App() {
  const [channels, setChannels] = useState<Channel[]>(persisted?.channels ?? [])
  const [selected, setSelected] = useState<Channel | null>(() => {
    if (!persisted) return null
    return (
      persisted.channels.find((c) => c.id === persisted.selectedId) ??
      persisted.channels[0] ??
      null
    )
  })
  const [playlistName, setPlaylistName] = useState<string | null>(
    persisted?.playlistName ?? null
  )

  useEffect(() => {
    savePlaylist({
      channels,
      playlistName,
      selectedId: selected?.id ?? null,
    })
  }, [channels, playlistName, selected])

  const handleLoad = (loaded: Channel[], filename: string) => {
    setChannels((existing) => {
      const seen = new Set(existing.map((c) => c.url))
      const added: Channel[] = []
      for (const c of loaded) {
        if (seen.has(c.url)) continue
        seen.add(c.url)
        added.push(c)
      }
      const merged = [...existing, ...added]

      setPlaylistName((prevName) =>
        existing.length === 0 ? filename : prevName ?? filename
      )
      setSelected((prev) => prev ?? merged[0] ?? null)

      return merged
    })
  }

  const handleReset = () => {
    clearPlaylist()
    setChannels([])
    setPlaylistName(null)
    setSelected(null)
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>IPTV Player</h1>
          {playlistName && (
            <p className="app__subtitle">
              {playlistName} · {channels.length} channels
              <button
                type="button"
                className="app__reset"
                onClick={handleReset}
                title="Remove the saved playlist"
              >
                Reset
              </button>
            </p>
          )}
        </div>
        <PlaylistInput onLoad={handleLoad} />
      </header>

      {channels.length === 0 ? (
        <section className="welcome">
          <h2>Welcome</h2>
          <p>
            Load a playlist from a URL or file to browse channels and watch live
            streams in your browser.
          </p>
          <div className="welcome__formats">
            <article>
              <h3>M3U</h3>
              <pre>{`#EXTM3U\n#EXTINF:-1,News\nhttps://example.com/stream.m3u8`}</pre>
            </article>
            <article>
              <h3>JSON</h3>
              <pre>{`[\n  { "name": "News", "url": "https://..." }\n]`}</pre>
            </article>
          </div>
        </section>
      ) : (
        <main className="app__main">
          <ChannelList
            channels={channels}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
          <VideoPlayer channel={selected} />
        </main>
      )}
    </div>
  )
}

export default App
