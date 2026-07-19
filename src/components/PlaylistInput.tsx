import { useRef, useState, type FormEvent } from "react";
import { parsePlaylist } from "../parsers";
import type { Channel } from "../types";

interface PlaylistInputProps {
  onLoad: (channels: Channel[], filename: string) => void;
}

function filenameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).pop();
    if (name && name.includes(".")) return name;
  } catch {
    // fall through
  }
  return "playlist.m3u";
}

export function PlaylistInput({ onLoad }: PlaylistInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContent = (content: string, source: string) => {
    const channels = parsePlaylist(content, source);
    onLoad(channels, source);
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const content = await file.text();
      loadContent(content, file.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse playlist."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUrl = async (event?: FormEvent) => {
    event?.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Enter a playlist URL.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      setError("Enter a valid URL.");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Only http and https URLs are supported.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(parsedUrl.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist (${response.status}).`);
      }

      const content = await response.text();
      const source = filenameFromUrl(parsedUrl.toString());
      loadContent(content, source);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Could not fetch playlist. The server may block browser requests (CORS)."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load playlist URL."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playlist-input">
      <form className="playlist-input__url" onSubmit={(e) => void handleUrl(e)}>
        <input
          type="url"
          className="playlist-input__url-field"
          placeholder="https://example.com/playlist.m3u"
          value={url}
          disabled={loading}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="playlist-input__button"
          disabled={loading || !url.trim()}
        >
          Load URL
        </button>
      </form>

      <input
        ref={inputRef}
        type="file"
        accept=".m3u,.m3u8,.json,application/json,text/plain"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div>
        <button
          type="button"
          className="playlist-input__button playlist-input__button--secondary"
          title="Upload an .m3u, .m3u8, or .json playlist file"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? "Loading..." : "Upload file"}
        </button>

        <p className="playlist-input__hint">
          Paste a link or upload an <code>.m3u</code> / <code>.json</code> file
        </p>
        {error && <p className="playlist-input__error">{error}</p>}
      </div>
    </div>
  );
}
