"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Song = {
  id: number;
  title: string;
  artist: string;
  elo: number;
  album?: string | null;
  releaseDate?: number | null;
  songsterrGuitarUrl?: string | null;
  songsterrBassUrl?: string | null;
  lyricsUrl?: string | null;
  youtubeUrl?: string | null;
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
      <div className="min-h-screen bg-white py-16 px-4 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading songs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-7xl font-bold text-gray-900 mb-6">Song Library</h1>
          <p className="text-2xl text-gray-600 max-w-3xl">
            Browse all songs and access tabs, lyrics, and videos for learning
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Dropdown Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 sticky top-24">
              <label className="block text-lg font-bold text-gray-900 mb-4">
                Select a Song
              </label>
              <select
                value={selectedSong?.id || ""}
                onChange={(e) => {
                  const song = songs.find((s) => s.id === parseInt(e.target.value));
                  if (song) setSelectedSong(song);
                }}
                className="w-full border-3 border-gray-400 rounded-lg p-4 text-gray-900 font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300 text-base bg-white cursor-pointer hover:border-gray-500 transition-colors"
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
              <div className="bg-white border-4 border-gray-300 rounded-xl p-10 shadow-lg">
                {/* Song Info */}
                <div className="mb-10 pb-10 border-b-3 border-gray-200">
                  <h2 className="text-5xl font-bold text-gray-900 mb-3">
                    {selectedSong.title}
                  </h2>
                  <p className="text-2xl text-gray-600 mb-6 font-semibold">
                    {selectedSong.artist}
                  </p>

                  <div className="flex flex-col md:flex-row gap-8 mb-6">
                    {selectedSong.album && (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Album</span>
                        <p className="text-lg text-gray-700 font-semibold">{selectedSong.album}</p>
                      </div>
                    )}

                    {selectedSong.releaseDate && (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Released</span>
                        <p className="text-lg text-gray-700 font-semibold">{selectedSong.releaseDate}</p>
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Battle Score</span>
                      <p className="text-4xl font-bold text-blue-600">
                        {Math.round(selectedSong.elo)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resource Links */}
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">📚 Learning Resources</h3>
                                    <div className="mb-6">
                                      <Link href="/add-resource" className="inline-block bg-green-100 hover:bg-green-200 text-green-900 font-bold py-2 px-4 rounded-lg border-2 border-green-300 hover:border-green-500 transition-all text-sm mb-2">
                                        Add Song / Resource Manually
                                      </Link>
                                    </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedSong.songsterrGuitarUrl && (
                      <a
                        href={selectedSong.songsterrGuitarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-6 px-5 rounded-lg text-center transition-all text-sm cursor-pointer border-2 border-blue-300 hover:border-blue-500 hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="text-3xl mb-2">🎸</div>
                        Guitar Tabs
                      </a>
                    )}

                    {selectedSong.songsterrBassUrl && (
                      <a
                        href={selectedSong.songsterrBassUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold py-6 px-5 rounded-lg text-center transition-all text-sm cursor-pointer border-2 border-purple-300 hover:border-purple-500 hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="text-3xl mb-2">🎜</div>
                        Bass Tabs
                      </a>
                    )}

                    {selectedSong.lyricsUrl && (
                      <a
                        href={selectedSong.lyricsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-bold py-6 px-5 rounded-lg text-center transition-all text-sm cursor-pointer border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="text-3xl mb-2">📝</div>
                        Lyrics
                      </a>
                    )}

                    {selectedSong.youtubeUrl && (
                      <a
                        href={selectedSong.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-red-100 hover:bg-red-200 text-red-700 font-bold py-6 px-5 rounded-lg text-center transition-all text-sm cursor-pointer border-2 border-red-300 hover:border-red-500 hover:shadow-lg transform hover:scale-105"
                      >
                        <div className="text-3xl mb-2">▶️</div>
                        Video
                      </a>
                    )}
                  </div>

                  {!selectedSong.songsterrGuitarUrl &&
                    !selectedSong.songsterrBassUrl &&
                    !selectedSong.lyricsUrl &&
                    !selectedSong.youtubeUrl && (
                      <p className="text-gray-500 italic mt-8 text-lg">
                        No resources available for this song yet.
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-20 pt-12 border-t-3 border-gray-300">
          <Link
            href="/battle"
            className="inline-block bg-gray-900 text-white font-bold py-4 px-10 rounded-lg hover:bg-gray-800 transition-colors text-lg border-2 border-gray-900 hover:shadow-xl"
          >
            Start Battling ⚔️
          </Link>
        </div>
      </div>
    </div>
  );
}
