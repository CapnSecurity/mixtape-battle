"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ultimateGuitarGuitar, songsterrBass, youtube, lyrics } from "@/lib/links";

type Song = {
  id: number;
  title: string;
  artist: string;
  elo: number;
  genre: string | null;
  releaseDate: number | null;
  album: string | null;
};

export default function SongBrowser() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "artist" | "elo" | "year">("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      const res = await fetch("/api/songs");
      if (res.ok) {
        const data = await res.json();
        setSongs(data);
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
      <div className="min-h-screen bg-[var(--bg)] py-16 px-4 text-[var(--text)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-xl text-[var(--muted)]">Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-16 px-4 text-[var(--text)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[var(--text)] mb-4">Song Library</h1>
          <p className="text-xl text-[var(--muted)]">
            {songs.length} songs to learn and battle
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
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
                      Resources
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSongs.map((song, index) => (
                    <tr
                      key={song.id}
                      className={`border-b border-[var(--ring)]/10 hover:bg-[var(--surface2)] transition-colors ${
                        index % 2 === 0 ? "" : "bg-[var(--surface)]/50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/songs/${song.id}`}
                          className="text-[var(--text)] hover:text-[var(--accent)] font-medium transition-colors"
                        >
                          {song.title}
                        </Link>
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
                          >
                            🎸
                          </a>
                          <a
                            href={songsterrBass(song.artist, song.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                            title="Bass Tabs"
                          >
                            🎵
                          </a>
                          <a
                            href={youtube(song.artist, song.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                            title="YouTube"
                          >
                            ▶️
                          </a>
                          <a
                            href={lyrics(song.artist, song.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--accent)]/20 text-[var(--text)] text-sm transition-colors"
                            title="Lyrics"
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
  );
}
