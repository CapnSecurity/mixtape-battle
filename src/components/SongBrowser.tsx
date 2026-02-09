"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ultimateGuitarGuitar, songsterrBass, youtube, lyrics } from "@/lib/links";
import Comments from "@/src/components/Comments";

type Song = {
  id: number;
  title: string;
  artist: string;
  elo: number;
  genre: string | null;
  releaseDate: number | null;
  album: string | null;
  albumArtUrl?: string | null;
};

export default function SongBrowser() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "artist" | "elo" | "year">("artist");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      const res = await fetch("/api/songs");
      if (res.ok) {
        const data = await res.json();
        // Sort alphabetically by artist, then by title
        const sortedData = data.sort((a: Song, b: Song) => {
          const artistCompare = a.artist.localeCompare(b.artist);
          if (artistCompare !== 0) return artistCompare;
          return a.title.localeCompare(b.title);
        });
        setSongs(sortedData);
        
        // Select first song by default
        if (sortedData.length > 0) {
          setSelectedSong(sortedData[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSortedSongs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    let filtered = songs;
    
    if (query) {
      filtered = songs.filter((song) => {
        const titleMatch = song.title.toLowerCase().includes(query);
        const artistMatch = song.artist.toLowerCase().includes(query);
        const genreMatch = song.genre?.toLowerCase().includes(query) ?? false;
        const yearMatch = song.releaseDate?.toString().includes(query) ?? false;
        
        return titleMatch || artistMatch || genreMatch || yearMatch;
      });
    }

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortBy) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "artist":
          aVal = a.artist.toLowerCase();
          bVal = b.artist.toLowerCase();
          break;
        case "elo":
          aVal = a.elo;
          bVal = b.elo;
          break;
        case "year":
          aVal = a.releaseDate ?? 0;
          bVal = b.releaseDate ?? 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [songs, searchQuery, sortBy, sortOrder]);

  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  function getSortIcon(column: typeof sortBy) {
    if (sortBy !== column) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  }

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

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Selected Song Details */}
            {selectedSong && (
              <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-10 shadow-[var(--shadow)]">
                <div className="mb-10 pb-10 border-b border-[var(--ring)]/20">
                  {selectedSong.albumArtUrl && (
                    <div className="mb-8 flex justify-center">
                      <img 
                        src={selectedSong.albumArtUrl} 
                        alt={`${selectedSong.album || selectedSong.title} album art`}
                        className="w-64 h-64 object-cover rounded-2xl shadow-2xl"
                      />
                    </div>
                  )}
                  
                  <h2 className="text-5xl font-bold text-[var(--text)] mb-3">
                    {selectedSong.title}
                  </h2>
                  <p className="text-2xl text-[var(--muted)] mb-6 font-semibold">
                    {selectedSong.artist}
                  </p>

                  <div className="flex flex-wrap gap-8 mb-6">
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
                  <h3 className="text-2xl font-bold text-[var(--text)] mb-6">📚 Learning Resources</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <a
                      href={ultimateGuitarGuitar(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm border border-[var(--ring)]/20"
                    >
                      <div className="text-3xl mb-2">🎸</div>
                      Guitar Tabs
                    </a>
                    <a
                      href={songsterrBass(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm border border-[var(--ring)]/20"
                    >
                      <div className="text-3xl mb-2">🎵</div>
                      Bass Tabs
                    </a>
                    <a
                      href={youtube(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm border border-[var(--ring)]/20"
                    >
                      <div className="text-3xl mb-2">▶️</div>
                      YouTube
                    </a>
                    <a
                      href={lyrics(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-6 px-5 rounded-xl text-center transition-all text-sm border border-[var(--ring)]/20"
                    >
                      <div className="text-3xl mb-2">📝</div>
                      Lyrics
                    </a>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mt-10 pt-10 border-t border-[var(--ring)]/20">
                  <Comments songId={selectedSong.id} />
                </div>
              </div>
            )}

            {/* Search and Table */}
            <div>
              <h3 className="text-3xl font-bold text-[var(--text)] mb-6">Search All Songs</h3>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by song, artist, genre, or year..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 text-lg rounded-xl bg-[var(--surface)] border border-[var(--ring)]/20 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {filteredAndSortedSongs.length} of {songs.length} songs
                </p>
              </div>

              {/* Results Table */}
              {filteredAndSortedSongs.length > 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--surface2)] border-b border-[var(--ring)]/20">
                        <tr>
                          <th
                            className="text-left px-6 py-4 font-semibold text-[var(--text)] cursor-pointer hover:bg-[var(--surface)] transition-colors"
                            onClick={() => handleSort("title")}
                          >
                            Song {getSortIcon("title")}
                          </th>
                          <th
                            className="text-left px-6 py-4 font-semibold text-[var(--text)] cursor-pointer hover:bg-[var(--surface)] transition-colors"
                            onClick={() => handleSort("artist")}
                          >
                            Artist {getSortIcon("artist")}
                          </th>
                          <th className="text-left px-6 py-4 font-semibold text-[var(--text)]">
                            Genre
                          </th>
                          <th
                            className="text-left px-6 py-4 font-semibold text-[var(--text)] cursor-pointer hover:bg-[var(--surface)] transition-colors"
                            onClick={() => handleSort("year")}
                          >
                            Year {getSortIcon("year")}
                          </th>
                          <th
                            className="text-center px-6 py-4 font-semibold text-[var(--text)] cursor-pointer hover:bg-[var(--surface)] transition-colors"
                            onClick={() => handleSort("elo")}
                          >
                            ELO {getSortIcon("elo")}
                          </th>
                          <th className="text-center px-6 py-4 font-semibold text-[var(--text)]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedSongs.map((song, index) => (
                          <tr
                            key={song.id}
                            className={`border-b border-[var(--ring)]/10 hover:bg-[var(--surface2)] transition-colors cursor-pointer ${
                              index % 2 === 0 ? "" : "bg-[var(--surface)]/50"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedSong(song)}
                                className="text-[var(--text)] hover:text-[var(--accent)] font-medium transition-colors text-left"
                              >
                                {song.title}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-[var(--muted)]">{song.artist}</td>
                            <td className="px-6 py-4 text-[var(--muted)]">
                              {song.genre || "-"}
                            </td>
                            <td className="px-6 py-4 text-[var(--muted)]">
                              {song.releaseDate || "-"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-semibold">
                                {Math.round(song.elo)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 justify-center">
                                <a
                                  href={ultimateGuitarGuitar(song.artist, song.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                                  title="Guitar Tabs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  🎸
                                </a>
                                <a
                                  href={songsterrBass(song.artist, song.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                                  title="Bass Tabs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  🎵
                                </a>
                                <a
                                  href={youtube(song.artist, song.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                                  title="YouTube"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  ▶️
                                </a>
                                <a
                                  href={lyrics(song.artist, song.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                                  title="Lyrics"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  📝
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border border-[var(--ring)]/20 rounded-2xl p-12 text-center bg-[var(--surface)]/70">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
                    No Songs Found
                  </h2>
                  <p className="text-[var(--muted)] text-lg">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <Link
                href="/battle"
                className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white font-bold hover:opacity-90 transition-opacity"
              >
                Start Battle ⚔️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
