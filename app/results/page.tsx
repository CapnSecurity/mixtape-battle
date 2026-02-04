import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function ResultsPage() {
  const top = await prisma.song.findMany({
    orderBy: { elo: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">🏆 Rankings</h1>
          <p className="text-xl text-slate-300">
            Top {top.length} songs by battle score
          </p>
        </div>

        {/* Rankings Table */}
        {top.length > 0 ? (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">
                      Song
                    </th>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg hidden md:table-cell">
                      Artist
                    </th>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg">
                      Battle Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {top.map((song, index) => {
                    const medalEmoji =
                      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
                    return (
                      <tr
                        key={song.id}
                        className="hover:bg-slate-700/50 transition group"
                      >
                        <td className="px-6 py-4 text-lg font-bold text-white group-hover:text-yellow-400">
                          {medalEmoji} #{index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/songs/${song.id}`}
                            className="text-blue-400 hover:text-blue-300 font-semibold transition"
                          >
                            {song.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-400 hidden md:table-cell">
                          {song.artist}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-4 py-2 rounded-lg">
                            {Math.round(song.elo)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card-base p-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              No Songs Yet
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Add some songs and start battling to see rankings!
            </p>
            <Link href="/songs" className="btn-primary inline-block">
              Manage Songs
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-slate-400">
            Want to help shape these rankings?
          </p>
          <Link href="/battle" className="btn-primary inline-block">
            Start Battle ⚔️
          </Link>
        </div>
      </div>
    </div>
  );
}
