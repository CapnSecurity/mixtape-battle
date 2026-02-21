"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ultimateGuitarGuitar, ultimateGuitarBass, songsterrBass, youtube, lyrics, spotify, genius, wikipedia, allMusic } from "@/lib/links";
import Comments from "@/src/components/Comments";
import AddToWoodshed from "@/src/components/AddToWoodshed";
import SongDetailClient from "@/src/components/SongDetailClient";
import { EditSongButton } from "@/app/components/EditSongButton";
import { SetlistButton } from "@/app/components/SetlistButton";

type Song = {
  id: number;
  title: string;
  artist: string;
  elo: number;
  genre: string | null;
  releaseDate: number | null;
  album: string | null;
  albumArtUrl?: string | null;
  lastPracticedAt?: string | null;  // ISO string from JSON API
  keyNotes?: string | null;
  tuningNotes?: string | null;
  ultimateGuitar?: string | null;
  songsterr?: string | null;
  youtube?: string | null;
  lyrics?: string | null;
};

export default function SongBrowser() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "artist" | "song" | "genre" | "year">("all");
  const [sortBy, setSortBy] = useState<"title" | "artist" | "elo" | "year">("artist");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const songDetailsRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  function handleSongSelect(song: Song) {
    setSelectedSong(song);
    // Scroll to song details after a short delay to allow render
    setTimeout(() => {
      songDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

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
        
        // Check if there's a songId in the URL (e.g., from adding a new song)
        const songIdParam = searchParams.get('songId');
        if (songIdParam && sortedData.length > 0) {
          const songToSelect = sortedData.find((s: Song) => s.id === parseInt(songIdParam));
          if (songToSelect) {
            setSelectedSong(songToSelect);
            // Scroll to the song details after a delay
            setTimeout(() => {
              songDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
          } else {
            // If song not found, select first song
            setSelectedSong(sortedData[0]);
          }
        } else if (sortedData.length > 0) {
          // No songId parameter, select first song by default
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
    
    // Only show results if there's a search query
    if (query) {
      filtered = songs.filter((song) => {
        switch (searchType) {
          case "artist":
            return song.artist.toLowerCase().includes(query);
          case "song":
            return song.title.toLowerCase().includes(query);
          case "genre":
            return song.genre?.toLowerCase().includes(query) ?? false;
          case "year":
            return song.releaseDate?.toString().includes(query) ?? false;
          case "all":
          default:
            const titleMatch = song.title.toLowerCase().includes(query);
            const artistMatch = song.artist.toLowerCase().includes(query);
            const genreMatch = song.genre?.toLowerCase().includes(query) ?? false;
            const yearMatch = song.releaseDate?.toString().includes(query) ?? false;
            return titleMatch || artistMatch || genreMatch || yearMatch;
        }
      });
    } else {
      // No search query = no results shown
      filtered = [];
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
  }, [songs, searchQuery, searchType, sortBy, sortOrder]);

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
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-7xl font-bold text-[var(--text)] mb-6">Song Library</h1>
              <p className="text-2xl text-[var(--muted)] max-w-3xl">
                Browse all songs and access tabs, lyrics, and videos for learning
              </p>
            </div>
            <Link 
              href="/add-song"
              className="flex-shrink-0 bg-[linear-gradient(135deg,var(--gold),var(--pink))] text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 text-lg"
            >
              <span>➕</span> Add Song
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Dropdown and Search Section */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-6 sticky top-24 space-y-6">
              {/* Dropdown */}
              <div>
                <label className="block text-lg font-bold text-[var(--text)] mb-4">
                  Select a Song
                </label>
                <select
                  value={selectedSong?.id || ""}
                  onChange={(e) => {
                    const song = songs.find((s) => s.id === parseInt(e.target.value));
                    if (song) handleSongSelect(song);
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

              {/* Search */}
              <div>
                <label className="block text-lg font-bold text-[var(--text)] mb-4">
                  Search Songs
                </label>
                
                {/* Search Type Radio Buttons */}
                <div className="mb-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchType"
                      value="all"
                      checked={searchType === "all"}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text)]">All Fields</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchType"
                      value="artist"
                      checked={searchType === "artist"}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text)]">Artist</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchType"
                      value="song"
                      checked={searchType === "song"}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text)]">Song Title</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchType"
                      value="genre"
                      checked={searchType === "genre"}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text)]">Genre</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="searchType"
                      value="year"
                      checked={searchType === "year"}
                      onChange={(e) => setSearchType(e.target.value as any)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-[var(--text)]">Year</span>
                  </label>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Search by ${searchType === 'all' ? 'anything' : searchType}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--ring)]/20 text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {filteredAndSortedSongs.length} result{filteredAndSortedSongs.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">{/* Search Results Table */}
            {searchQuery && filteredAndSortedSongs.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-[var(--text)] mb-4">Search Results</h3>
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
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedSongs.map((song, index) => (
                          <tr
                            key={song.id}
                            onClick={() => handleSongSelect(song)}
                            className={`border-b border-[var(--ring)]/10 hover:bg-[var(--surface2)] transition-colors cursor-pointer ${
                              index % 2 === 0 ? "" : "bg-[var(--surface)]/50"
                            } ${selectedSong?.id === song.id ? "bg-[var(--accent)]/10" : ""}`}
                          >
                            <td className="px-6 py-4">
                              <span className="text-[var(--text)] font-medium">
                                {song.title}
                              </span>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {searchQuery && filteredAndSortedSongs.length === 0 && (
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
            {/* Selected Song Details */}
            {selectedSong && (
              <div ref={songDetailsRef} className="space-y-8">
                {/* Song Header Card with Gradient */}
                <div className="bg-[linear-gradient(135deg,var(--gold),var(--pink))] rounded-2xl shadow-[var(--shadow)] p-8">
                  {selectedSong.albumArtUrl ? (
                    <div className="mb-6 flex justify-center">
                      <img 
                        src={selectedSong.albumArtUrl} 
                        alt={`${selectedSong.album || selectedSong.title} album art`}
                        className="w-64 h-64 object-cover rounded-xl shadow-2xl"
                      />
                    </div>
                  ) : (
                    <div className="text-7xl mb-6 text-center">🎶</div>
                  )}
                  
                  <h2 className="text-4xl font-bold text-[var(--bg)] mb-2 text-center">
                    {selectedSong.title}
                  </h2>
                  <p className="text-xl text-[var(--bg)]/80 text-center mb-6">
                    {selectedSong.artist}
                  </p>

                  {/* Metadata */}
                  {(selectedSong.album || selectedSong.releaseDate || selectedSong.genre) && (
                    <div className="bg-[var(--bg)]/20 rounded-xl p-4 mb-4 flex flex-wrap justify-center gap-6">
                      {selectedSong.album && (
                        <div className="text-center">
                          <div className="text-xs text-[var(--bg)]/60 uppercase tracking-wider mb-1">Album</div>
                          <div className="text-sm font-semibold text-[var(--bg)]">{selectedSong.album}</div>
                        </div>
                      )}
                      {selectedSong.releaseDate && (
                        <div className="text-center">
                          <div className="text-xs text-[var(--bg)]/60 uppercase tracking-wider mb-1">Year</div>
                          <div className="text-sm font-semibold text-[var(--bg)]">{selectedSong.releaseDate}</div>
                        </div>
                      )}
                      {selectedSong.genre && (
                        <div className="text-center">
                          <div className="text-xs text-[var(--bg)]/60 uppercase tracking-wider mb-1">Genre</div>
                          <div className="text-sm font-semibold text-[var(--bg)]">{selectedSong.genre}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[var(--bg)]/20 rounded-xl p-6 text-center">
                    <div className="text-sm text-[var(--bg)]/80 mb-2">Battle Score</div>
                    <div className="text-5xl font-bold text-[var(--bg)]">
                      {Math.round(selectedSong.elo)}
                    </div>
                  </div>
                </div>

                {/* Edit Song Button (Admin Only) */}
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-6 shadow-[var(--shadow)]">
                  <div className="flex items-center justify-between gap-4">
                    <EditSongButton 
                      song={{
                        id: selectedSong.id,
                        title: selectedSong.title,
                        artist: selectedSong.artist,
                        album: selectedSong.album,
                        releaseDate: selectedSong.releaseDate,
                        genre: selectedSong.genre,
                      }}
                      onUpdate={fetchSongs}
                    />
                    <SetlistButton songId={selectedSong.id} variant="button" />
                  </div>
                </div>

                {/* Resource Links Card */}
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-8 shadow-[var(--shadow)]">
                {/* Resource Links */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-[var(--text)]">📚 Learn This Song</h3>
                    <AddToWoodshed songId={selectedSong.id} variant="button" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {/* Guitar Tabs */}
                    <a
                      href={selectedSong.ultimateGuitar || ultimateGuitarGuitar(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">🎸</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">Guitar Tabs</div>
                        <div className="text-sm text-[var(--muted)]">Ultimate Guitar</div>
                      </div>
                    </a>

                    {/* Bass Tabs */}
                    <a
                      href={selectedSong.songsterr || songsterrBass(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">🎸</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">Bass Tabs</div>
                        <div className="text-sm text-[var(--muted)]">Songsterr</div>
                      </div>
                    </a>

                    {/* Lyrics (Genius) */}
                    <a
                      href={selectedSong.lyrics || genius(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">📝</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">Lyrics</div>
                        <div className="text-sm text-[var(--muted)]">Genius Lyrics</div>
                      </div>
                    </a>

                    {/* YouTube */}
                    <a
                      href={selectedSong.youtube || youtube(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">▶️</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">YouTube</div>
                        <div className="text-sm text-[var(--muted)]">Watch performances</div>
                      </div>
                    </a>

                    {/* Spotify */}
                    <a
                      href={spotify(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">🎧</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">Spotify</div>
                        <div className="text-sm text-[var(--muted)]">Listen on Spotify</div>
                      </div>
                    </a>

                    {/* Wikipedia */}
                    <a
                      href={wikipedia(selectedSong.artist, selectedSong.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">📚</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">Wikipedia</div>
                        <div className="text-sm text-[var(--muted)]">Artist or Song Info</div>
                      </div>
                    </a>

                    {/* AllMusic */}
                    <a
                      href={allMusic(selectedSong.artist, selectedSong.album)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
                    >
                      <span className="text-2xl">💿</span>
                      <div>
                        <div className="font-bold text-[var(--text)]">AllMusic</div>
                        <div className="text-sm text-[var(--muted)]">Album & Artist Info</div>
                      </div>
                    </a>
                  </div>
                </div>
                </div>

                {/* Readiness & Practice Tracking */}
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-8 shadow-[var(--shadow)]">
                  <SongDetailClient
                    songId={selectedSong.id}
                    lastPracticedAt={selectedSong.lastPracticedAt || null}
                    keyNotes={selectedSong.keyNotes || null}
                    tuningNotes={selectedSong.tuningNotes || null}
                  />
                </div>

                {/* Comments Section */}
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-8 shadow-[var(--shadow)]">
                  <Comments songId={selectedSong.id} />
                </div>
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
      </div>
    </div>
  );
}
