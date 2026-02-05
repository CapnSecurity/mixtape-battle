"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/src/components/ui/Button";

type Song = {
  id: number;
  title: string;
  artist: string;
  elo: number;
  album?: string | null;
  releaseDate?: number | null;
  spotify?: string | null;
  apple?: string | null;
  youtube?: string | null;
  bandcamp?: string | null;
  soundcloud?: string | null;
  lyrics?: string | null;
  songsterr?: string | null;
  ultimateGuitar?: string | null;
};

export default function SongBrowser() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        setSongs(data);
        if (data.length > 0) {
          setSelectedSong(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] py-16 px-4 flex items-center justify-center">
        <p className="text-[var(--muted)] text-lg">Loading songs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-20 px-4 md:px-8 text-[var(--text)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-7xl font-bold text-[var(--text)] mb-6">Song Library</h1>
          <p className="text-2xl text-[var(--muted)] max-w-3xl">
            Browse all songs and access tabs, lyrics, and videos for learning
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Dropdown Section */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-6 sticky top-24">
              <label className="block text-lg font-bold text-[var(--text)] mb-4">
                Select a Song
              </label>
              <select
                value={selectedSong?.id || ""}
                onChange={(e) => {
                  const song = songs.find((s) => s.id === parseInt(e.target.value));
                  if (song) setSelectedSong(song);
                }}
                className="w-full rounded-xl p-4 text-[var(--text)] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] text-base bg-[var(--surface2)] cursor-pointer border border-[var(--ring)]/20 transition-colors"
              >
                {songs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} - {song.artist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Song Details */}
          {selectedSong && (
            <div className="lg:col-span-3">
              <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-10 shadow-[var(--shadow)]">
                {/* Song Info */}
                <div className="mb-10 pb-10 border-b border-[var(--ring)]/20">
                  <h2 className="text-5xl font-bold text-[var(--text)] mb-3">
                    {selectedSong.title}
                  </h2>
                  <p className="text-2xl text-[var(--muted)] mb-6 font-semibold">
                    {selectedSong.artist}
                  </p>

                  <div className="flex flex-col md:flex-row gap-8 mb-6">
                    {selectedSong.album && (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Album</span>
                        <p className="text-lg text-[var(--text)] font-semibold">{selectedSong.album}</p>
                      </div>
                    )}

                    {selectedSong.releaseDate && (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Released</span>
                        <p className="text-lg text-[var(--text)] font-semibold">{selectedSong.releaseDate}</p>
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Battle Score</span>
                      <p className="text-4xl font-bold text-[var(--gold)]">
                        {Math.round(selectedSong.elo)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resource Links */}
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-[var(--text)] mb-8">📚 Learning Resources</h3>
                  <div className="mb-6">
                    <Button asChild variant="surface">
                      <Link href="/add-resource">Add Song / Resource Manually</Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedSong.songsterr && (
                      <a
                        href={selectedSong.songsterr}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">🎸</div>
                        Songsterr
                      </a>
                    )}

                    {selectedSong.ultimateGuitar && (
                      <a
                        href={selectedSong.ultimateGuitar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">🎸</div>
                        Ultimate Guitar
                      </a>
                    )}

                    {selectedSong.lyrics && (
                      <a
                        href={selectedSong.lyrics}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">📝</div>
                        Lyrics
                      </a>
                    )}

                    {selectedSong.youtube && (
                      <a
                        href={selectedSong.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">▶️</div>
                        Video
                      </a>
                    )}

                    {selectedSong.spotify && (
                      <a
                        href={selectedSong.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">🎵</div>
                        Spotify
                      </a>
                    )}

                    {selectedSong.apple && (
                      <a
                        href={selectedSong.apple}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">🍎</div>
                        Apple Music
                      </a>
                    )}

                    {selectedSong.bandcamp && (
                      <a
                        href={selectedSong.bandcamp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">🎹</div>
                        Bandcamp
                      </a>
                    )}

                    {selectedSong.soundcloud && (
                      <a
                        href={selectedSong.soundcloud}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                      >
                        <div className="text-3xl mb-2">☁️</div>
                        SoundCloud
                      </a>
                    )}
                  </div>

                  {!selectedSong.songsterr &&
                    !selectedSong.ultimateGuitar &&
                    !selectedSong.lyrics &&
                    !selectedSong.youtube &&
                    !selectedSong.spotify &&
                    !selectedSong.apple &&
                    !selectedSong.bandcamp &&
                    !selectedSong.soundcloud && (
                      <p className="text-[var(--muted)] italic mt-8 text-lg">
                        No resources available for this song yet.
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-12 border-t border-[var(--ring)]/20">
          <Button asChild size="lg">
            <Link href="/battle">Start Battling ⚔️</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
