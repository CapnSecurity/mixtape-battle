import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { songsterr, ultimateGuitar, youtube, lyrics } from "../../lib/links";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">Song Library</h1>
          <p className="text-xl text-gray-600">
            {songs.length} songs to learn and battle
          </p>
        </div>

        {/* Songs Grid - Large Tiles */}
        {songs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {songs.map((song) => (
              <div key={song.id} className="flex flex-col">
                {/* Main Song Tile */}
                <div className="bg-white border-2 border-gray-300 rounded-xl p-8 mb-4 hover:border-gray-400 hover:shadow-xl transition-all duration-300 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {song.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {song.artist}
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Battle Score</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {Math.round(song.elo)}
                    </p>
                  </div>
                </div>

                {/* Resource Buttons Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={songsterr(song.artist, song.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    🎸<br />Guitar
                  </a>

                  <a
                    href={`https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(song.artist + " " + song.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    🎜<br />Bass
                  </a>

                  <a
                    href={lyrics(song.artist, song.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    📝<br />Lyrics
                  </a>

                  <a
                    href={youtube(song.artist, song.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-4 px-4 rounded-lg text-center transition-colors text-sm"
                  >
                    ▶️<br />Video
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-gray-300 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              No Songs Yet
            </h2>
            <p className="text-gray-600 text-lg">
              Add your first songs to get started with battling!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <Link href="/battle" className="bg-gray-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors text-lg inline-block">
            Start Battle ⚔️
          </Link>
        </div>
      </div>
    </div>
  );
}
