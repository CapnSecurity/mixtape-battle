"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "@/src/components/ui/Button";
import { songsterrBass, ultimateGuitarGuitar, youtube, lyrics, spotify, genius, wikipedia, allMusic } from "../../../lib/links";
import { useCsrfToken, withCsrfToken } from "@/lib/use-csrf";

type Song = {
  id: number;
  title: string;
  artist: string;
  elo: number;
  album?: string | null;
  releaseDate?: number | null;
  albumArtUrl?: string | null;
  genre?: string | null;
  durationMs?: number | null;
  spotify?: string | null;
  apple?: string | null;
  youtube?: string | null;
  bandcamp?: string | null;
  soundcloud?: string | null;
  lyrics?: string | null;
  songsterr?: string | null;
  ultimateGuitar?: string | null;
};

function SongBrowser() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const songIdParam = searchParams.get('songId');
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { token: csrfToken } = useCsrfToken();

  async function handleDeleteSong() {
    if (!selectedSong) return;
    
    if (!confirm(`Are you sure you want to delete "${selectedSong.title}" by ${selectedSong.artist}? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      if (!csrfToken) {
        alert('Security token not ready. Please try again.');
        setDeleting(false);
        return;
      }

      const res = await fetch(
        '/api/songs/delete',
        withCsrfToken(csrfToken, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: selectedSong.id }),
        })
      );

      if (res.ok) {
        // Refresh the song list
        await fetchSongs();
      } else {
        alert('Failed to delete song');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Error deleting song');
    } finally {
      setDeleting(false);
    }
  }

  const isAdmin = session?.user && (session.user as any).isAdmin;

  async function fetchSongs() {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      // Sort alphabetically by artist, then by title
      const sortedData = data.sort((a: Song, b: Song) => {
        const artistCompare = a.artist.localeCompare(b.artist);
        if (artistCompare !== 0) return artistCompare;
        return a.title.localeCompare(b.title);
      });
      setSongs(sortedData);
      
      // If songId query param exists, select that song; otherwise select first
      if (songIdParam && sortedData.length > 0) {
        const targetSong = sortedData.find((s: Song) => s.id === parseInt(songIdParam));
        setSelectedSong(targetSong || sortedData[0]);
      } else if (sortedData.length > 0) {
        setSelectedSong(sortedData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSongs();
  }, [songIdParam]);

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
                    {song.artist} - {song.title}
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
                  {/* Album Art */}
                  {selectedSong.albumArtUrl ? (
                    <div className="mb-8 flex justify-center">
                      <img 
                        src={selectedSong.albumArtUrl} 
                        alt={`${selectedSong.album || selectedSong.title} album art`}
                        className="w-64 h-64 object-cover rounded-2xl shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="text-8xl mb-8 text-center">🎶</div>
                  )}
                  
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
                    
                    {selectedSong.genre && (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Genre</span>
                        <p className="text-lg text-[var(--text)] font-semibold">{selectedSong.genre}</p>
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
                  <div className="mb-6 flex gap-3">
                    <Button asChild variant="surface">
                      <Link href="/add-song">➕ Add New Song</Link>
                    </Button>
                    <Button asChild variant="surface">
                      <Link href="/add-resource">🔗 Update Links</Link>
                    </Button>
                    {isAdmin && (
                      <Button 
                        onClick={handleDeleteSong}
                        disabled={deleting}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {deleting ? 'Deleting...' : '🗑️ Delete Song'}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

                    {/* Guitar Tabs */}
                    <a
                      href={selectedSong.ultimateGuitar || ultimateGuitarGuitar(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">🎸</div>
                      Guitar Tabs
                    </a>

                    {/* Bass Tabs */}
                    <a
                      href={selectedSong.songsterr || songsterrBass(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">🎸</div>
                      Bass Tabs
                    </a>

                    {/* Lyrics (Genius) */}
                    <a
                      href={selectedSong.lyrics || genius(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">📝</div>
                      Lyrics
                    </a>

                    {/* YouTube */}
                    <a
                      href={selectedSong.youtube || youtube(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">▶️</div>
                      YouTube Music
                    </a>

                    {/* Spotify */}
                    <a
                      href={spotify(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">🎧</div>
                      Spotify
                    </a>

                    {/* Wikipedia */}
                    <a
                      href={wikipedia(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">📚</div>
                      Wikipedia
                    </a>

                    {/* AllMusic */}
                    <a
                      href={allMusic(selectedSong.artist, selectedSong.album)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm cursor-pointer border border-[var(--ring)]/20 hover:shadow-[var(--shadow)]"
                    >
                      <div className="text-3xl mb-2">💿</div>
                      AllMusic
                    </a>

                    {/* Streaming services - only show if available */}
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

function SongBrowserWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg)] py-16 px-4 flex items-center justify-center">
        <p className="text-[var(--muted)] text-lg">Loading songs...</p>
      </div>
    }>
      <SongBrowser />
    </Suspense>
  );
}

export default SongBrowserWrapper;
