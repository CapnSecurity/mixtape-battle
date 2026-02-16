import Link from "next/link";
import { prisma } from "../../lib/prisma";
import Button from "@/src/components/ui/Button";
import ReadinessIcon from "@/src/components/ReadinessIcon";

export const dynamic = 'force-dynamic';

type AggregateStatus = "SOLID" | "NEEDS_WORK" | "NOT_READY" | "NONE";

function calculateAggregateStatus(readiness: { status: string }[]): AggregateStatus {
  if (readiness.length === 0) return "NONE";
  
  const hasNotReady = readiness.some((r) => r.status === "NOT_READY");
  const hasNeedsWork = readiness.some((r) => r.status === "NEEDS_WORK");
  const hasSolid = readiness.some((r) => r.status === "SOLID");
  
  if (hasNotReady) return "NOT_READY";
  if (hasNeedsWork) return "NEEDS_WORK";
  if (hasSolid) return "SOLID";
  return "NONE";
}

export default async function ResultsPage() {
  // Get ALL songs ordered by ELO (descending) with readiness data
  const allSongs = await prisma.song.findMany({
    orderBy: { elo: "desc" },
    include: {
      readiness: {
        select: {
          status: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1"></div>
            <h1 className="text-5xl md:text-6xl font-bold">🏆 Rankings</h1>
            <div className="flex-1 flex justify-end">
              <Link 
                href="/add-song"
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
              >
                <span>➕</span> Add Song
              </Link>
            </div>
          </div>
          <p className="text-xl text-[var(--muted)]">
            {allSongs.length} {allSongs.length === 1 ? 'song' : 'songs'} ranked by battle score
          </p>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {allSongs.map((song, index) => {
            const medalEmoji =
              index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
            const isTopTen = index < 10;
            const aggregateStatus = calculateAggregateStatus(song.readiness);

            return (
              <div
                key={song.id}
                className={`rounded-xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-sm p-4 ${
                  isTopTen ? 'ring-2 ring-[var(--gold)]/30' : ''
                }`}
              >
                {/* Rank and Score Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {medalEmoji && <span className="text-3xl">{medalEmoji}</span>}
                    <span className="text-2xl font-bold text-[var(--gold)]">#{index + 1}</span>
                    {isTopTen && !medalEmoji && (
                      <span className="bg-gradient-to-r from-[var(--gold)] to-[var(--pink)] text-white text-xs font-bold px-2 py-1 rounded-full">
                        TOP 10
                      </span>
                    )}
                  </div>
                  <span className={`inline-block ${
                    isTopTen 
                      ? 'bg-[linear-gradient(135deg,var(--gold),var(--pink))]' 
                      : 'bg-[var(--surface2)]'
                  } text-[var(--bg)] font-bold px-4 py-2 rounded-lg text-lg`}>
                    {Math.round(song.elo)}
                  </span>
                </div>

                {/* Song Info */}
                <Link href={`/songs/${song.id}`} className="block mb-3">
                  <div className="font-semibold text-lg text-[var(--gold)] hover:text-[var(--pink)] transition">
                    {song.title}
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {song.artist}
                  </div>
                </Link>

                {/* Readiness */}
                <div className="flex items-center gap-2">
                  <ReadinessIcon status={aggregateStatus} size="sm" />
                  {song.readiness.length > 0 && (
                    <span className="text-xs text-[var(--muted)]">
                      {song.readiness.length} {song.readiness.length === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        {allSongs.length > 0 ? (
          <div className="hidden md:block rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] overflow-hidden">
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
                    <th className="px-6 py-4 text-left text-[var(--bg)] font-bold text-lg">
                      Artist
                    </th>
                    <th className="px-6 py-4 text-left text-[var(--bg)] font-bold text-lg">
                      Readiness
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

                    // Calculate aggregate readiness
                    const aggregateStatus = calculateAggregateStatus(song.readiness);

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
                        <td className="px-6 py-4 text-[var(--muted)]">
                          {song.artist}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ReadinessIcon status={aggregateStatus} size="sm" />
                            {song.readiness.length > 0 && (
                              <span className="text-xs text-[var(--muted)]">
                                {song.readiness.length} {song.readiness.length === 1 ? 'vote' : 'votes'}
                              </span>
                            )}
                          </div>
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
              <Link href="/songs">Manage Songs</Link>
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
