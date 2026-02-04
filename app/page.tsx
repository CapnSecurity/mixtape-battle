import Link from "next/link";
import { prisma } from "../lib/prisma";
import { songsterr, ultimateGuitar, youtube, lyrics } from "../lib/links";

export default async function Home() {
  const potentialSongs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-7xl md:text-8xl mb-6 drop-shadow-lg">🎵</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
              Mixtape
            </h1>
            <p className="text-2xl gradient-text mb-2">
              Band Music Management & Review
            </p>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Collaboratively rank your band's music, discover perfect arrangements,
              and build your ultimate setlist through head-to-head battles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/battle" className="btn-primary">
                ⚔️ Start Battling
              </Link>
              <Link href="/results" className="btn-secondary">
                🏆 View Rankings
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="card-base p-8 text-center hover-lift">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold mb-3">Battle Songs</h3>
              <p className="text-slate-400">
                Head-to-head voting to rank your band's best material.
              </p>
            </div>

            <div className="card-base p-8 text-center hover-lift">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">ELO Ratings</h3>
              <p className="text-slate-400">
                Fair, mathematical rankings based on community votes.
              </p>
            </div>

            <div className="card-base p-8 text-center hover-lift">
              <div className="text-5xl mb-4">🎸</div>
              <h3 className="text-xl font-bold mb-3">Learning Resources</h3>
              <p className="text-slate-400">
                Guitar, bass tabs, lyrics, and video references built-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Potential Song List Section */}
      <section className="py-20 px-4 md:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Potential Song List</h2>
            <p className="text-slate-400">
              Available songs ready to battle, learn, and master.
            </p>
          </div>

          {potentialSongs.length > 0 ? (
            <div className="space-y-4">
              {potentialSongs.map((song) => (
                <div
                  key={song.id}
                  className="card-base p-6 hover-lift transition-all"
                >
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    {/* Song Info */}
                    <div className="md:col-span-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {song.title}
                      </h3>
                      <p className="text-slate-400 mb-2">{song.artist}</p>
                      <div className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm font-semibold">
                        Rating: {Math.round(song.elo)}
                      </div>
                    </div>

                    {/* Resource Links */}
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      <a
                        href={songsterr(song.artist, song.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        title="Interactive guitar tabs"
                      >
                        <span>🎸</span> Guitar
                      </a>

                      <a
                        href={`https://www.songsterr.com/a/wa/bestMatchDocument?artistName=${encodeURIComponent(
                          song.artist
                        )}&songName=${encodeURIComponent(song.title)}&attempt=2`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        title="Bass tabs"
                      >
                        <span>🎜</span> Bass
                      </a>

                      <a
                        href={lyrics(song.artist, song.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        title="Lyrics and song information"
                      >
                        <span>📝</span> Lyrics
                      </a>

                      <a
                        href={youtube(song.artist, song.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        title="Watch performance video"
                      >
                        <span>▶️</span> Video
                      </a>

                      <Link
                        href={`/songs/${song.id}`}
                        className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-auto md:ml-0"
                        title="View full song details"
                      >
                        <span>📖</span> Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-base p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold mb-3">No Songs Yet</h3>
              <p className="text-slate-400 mb-6">
                Add songs to get started with battling and learning!
              </p>
              <Link href="/songs" className="btn-primary inline-block">
                Manage Songs
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect p-12 text-center border-white/30">
            <h2 className="text-3xl font-bold mb-4">
              Ready to rank your music?
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              Start battling today and discover which songs your band loves most.
            </p>
            <Link href="/battle" className="btn-primary inline-block">
              Battle Now ⚔️
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
