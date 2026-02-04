import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">🎸 Song Library</h1>
          <p className="text-xl text-slate-300">
            {songs.length} songs available for battling
          </p>
        </div>

        {/* Songs Grid */}
        {songs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Link key={song.id} href={`/songs/${song.id}`} className="group">
                <div className="card-base bg-gradient-to-br from-blue-600 to-purple-700 p-6 h-full hover-lift">
                  <div className="text-5xl mb-4">🎵</div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-100 transition">
                    {song.title}
                  </h3>
                  <p className="text-slate-200 mb-4 line-clamp-1">
                    {song.artist}
                  </p>

                  <div className="flex justify-between items-end pt-4 border-t border-blue-400/30">
                    <div>
                      <div className="text-xs text-blue-200 mb-1">Rating</div>
                      <div className="text-2xl font-bold text-white">
                        {Math.round(song.elo)}
                      </div>
                    </div>
                    <div className="text-sm text-blue-200 group-hover:text-white transition">
                      View Details →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-base p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              No Songs Yet
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Add your first songs to get started with battling!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-slate-400 text-lg">
            Ready to battle?
          </p>
          <Link href="/battle" className="btn-primary inline-block">
            Start Battle ⚔️
          </Link>
        </div>
      </div>
    </div>
  );
}
