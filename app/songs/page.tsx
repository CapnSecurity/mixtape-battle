import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">🎵 Songs</h1>
          <p className="text-gray-300">
            {songs.length} songs in your mixtape
          </p>
        </div>

        {/* Songs Grid */}
        {songs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className="group"
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 shadow-lg transform transition hover:scale-105 hover:shadow-2xl h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-4">🎶</div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {song.title}
                    </h3>
                    <p className="text-purple-100 mb-4 line-clamp-1">
                      {song.artist}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-purple-100">Rating</div>
                    <div className="text-2xl font-bold text-white">
                      {Math.round(song.elo)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Songs Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add your first songs to start battling!
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition">
              Add Song
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/battle"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Start Battle ⚔️
          </Link>
        </div>
      </div>
    </div>
  );
}
