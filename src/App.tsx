import { useState } from 'react'
import { ChannelList } from './components/ChannelList'
import { PlaylistInput } from './components/PlaylistInput'
import { VideoPlayer } from './components/VideoPlayer'
import type { Channel } from './types'
import './App.css'

function App() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selected, setSelected] = useState<Channel | null>(null)
  const [playlistName, setPlaylistName] = useState<string | null>(null)

  const handleLoad = (loaded: Channel[], filename: string) => {
    setChannels(loaded)
    setPlaylistName(filename)
    setSelected(loaded[0] ?? null)
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>IPTV Player</h1>
          {playlistName && (
            <p className="app__subtitle">
              {playlistName} · {channels.length} channels
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
