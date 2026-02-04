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
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Rankings</h1>
          <p className="text-gray-300">
            Top {top.length} songs by rating
          </p>
        </div>

        {/* Rankings Table */}
        {top.length > 0 ? (
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Song
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Artist
                    </th>
                    <th className="px-6 py-4 text-right text-white font-semibold">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {top.map((song, index) => {
                    const medalEmoji =
                      index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : "  ";
                    return (
                      <tr
                        key={song.id}
                        className="hover:bg-purple-50 transition"
                      >
                        <td className="px-6 py-4 text-lg font-bold text-gray-900">
                          {medalEmoji} #{index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/songs/${song.id}`}
                            className="text-purple-600 hover:text-purple-700 font-semibold transition"
                          >
                            {song.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {song.artist}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-4 py-2 rounded-lg">
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
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="text-5xl mb-4">🎵</div>
            <p className="text-gray-600 text-lg mb-6">
              No songs yet. Add some to get started!
            </p>
            <Link
              href="/songs"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Add Songs
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
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
