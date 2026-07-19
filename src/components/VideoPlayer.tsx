import Hls from 'hls.js'
import { useEffect, useRef, useState } from 'react'
import type { Channel } from '../types'

interface VideoPlayerProps {
  channel: Channel | null
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !channel) return

    setError(null)
    let hls: Hls | null = null

    const isHls =
      channel.url.includes('.m3u8') ||
      channel.url.includes('application/vnd.apple.mpegurl')

    const cleanup = () => {
      if (hls) {
        hls.destroy()
        hls = null
      }
      video.removeAttribute('src')
      video.load()
    }

    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true })
      hls.loadSource(channel.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Unable to play this stream. It may be offline or blocked.')
        }
      })
    } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.url
    } else {
      video.src = channel.url
    }

    void video.play().catch(() => {
      // Autoplay may be blocked until user interacts; controls still work.
    })

    return cleanup
  }, [channel])

  const toggleFullscreen = async () => {
    const target = containerRef.current ?? videoRef.current
    if (!target) return

    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await target.requestFullscreen()
    }
  }

  if (!channel) {
    return (
      <div className="player player--empty">
        <p>Select a channel to start watching</p>
      </div>
    )
  }

  return (
    <div className="player" ref={containerRef}>
      <video
        ref={videoRef}
        className="player__video"
        controls
        playsInline
        autoPlay
      />
      <div className="player__bar">
        <div className="player__info">
          <span className="player__name">{channel.name}</span>
          {channel.group && (
            <span className="player__group">{channel.group}</span>
          )}
        </div>
        <button
          type="button"
          className="player__fullscreen"
          onClick={() => void toggleFullscreen()}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
      </div>
      {error && <p className="player__error">{error}</p>}
    </div>
  )
}
