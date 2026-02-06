import Link from "next/link";
import { prisma } from "../../lib/prisma";
import Button from "@/src/components/ui/Button";

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  // Get ALL songs ordered by ELO (descending)
  const allSongs = await prisma.song.findMany({
    orderBy: { elo: "desc" },
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">🏆 Rankings</h1>
          <p className="text-xl text-[var(--muted)]">
            {allSongs.length} {allSongs.length === 1 ? 'song' : 'songs'} ranked by battle score
          </p>
        </div>

        {/* Rankings Table */}
        {allSongs.length > 0 ? (
          <div className="rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[linear-gradient(135deg,var(--gold),var(--pink))]">
                  <tr>
                    <th className="px-6 py-4 text-left text-[var(--bg)] font-bold text-lg">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-[var(--bg)] font-bold text-lg">
                      Song
                    </th>
                    <th className="px-6 py-4 text-left text-[var(--bg)] font-bold text-lg hidden md:table-cell">
                      Artist
                    </th>
                    <th className="px-6 py-4 text-right text-[var(--bg)] font-bold text-lg">
                      Battle Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ring)]/20">
                  {allSongs.map((song, index) => {
                    // Medal emojis for top 3
                    const medalEmoji =
                      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                    
                    // Badge for top 10
                    const isTopTen = index < 10;
                    const badgeColor = 
                      index === 0 ? "bg-[#FFD700]" :  // Gold
                      index === 1 ? "bg-[#C0C0C0]" :  // Silver
                      index === 2 ? "bg-[#CD7F32]" :  // Bronze
                      "bg-gradient-to-r from-[var(--gold)] to-[var(--pink)]"; // Top 10

                    return (
                      <tr
                        key={song.id}
                        className={`hover:bg-[var(--surface2)]/60 transition group ${isTopTen ? 'bg-[var(--surface2)]/30' : ''}`}
                      >
                        <td className="px-6 py-4 text-lg font-bold text-[var(--text)] group-hover:text-[var(--gold)]">
                          <div className="flex items-center gap-2">
                            {medalEmoji && <span className="text-2xl">{medalEmoji}</span>}
                            <span>#{index + 1}</span>
                            {isTopTen && !medalEmoji && (
                              <span className={`${badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                                TOP 10
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/songs/${song.id}`}
                            className="text-[var(--gold)] hover:text-[var(--pink)] font-semibold transition"
                          >
                            {song.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[var(--muted)] hidden md:table-cell">
                          {song.artist}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-block ${isTopTen ? 'bg-[linear-gradient(135deg,var(--gold),var(--pink))]' : 'bg-[var(--surface2)]'} text-[var(--bg)] font-bold px-4 py-2 rounded-lg`}>
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
          <div className="rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] p-12 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              No Songs Yet
            </h2>
            <p className="text-[var(--muted)] text-lg mb-8">
              Add some songs and start battling to see rankings!
            </p>
            <Button asChild>
              <Link href="/songs/browser">Manage Songs</Link>
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-[var(--muted)]">
            Want to help shape these rankings?
          </p>
          <Button asChild>
            <Link href="/battle">Start Battle ⚔️</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
