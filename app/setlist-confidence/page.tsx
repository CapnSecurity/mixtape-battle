/**
 * Setlist Confidence Page
 * 
 * Displays the top 20 songs by ELO ranking with comprehensive rehearsal readiness info.
 * 
 * Features:
 * - Top-ranked songs sorted by battle performance
 * - Aggregate band readiness for each song
 * - Last practice date with visual indicators (red if >30 days old)
 * - Key signature and tuning notes for quick reference
 * 
 * Helps bands prepare for gigs by showing which top songs need practice attention.
 * 
 * Requires authentication.
 */

import Link from "next/link";
import { prisma } from "../../lib/prisma";
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

function calculateAvgReadiness(readiness: { status: string }[]): number {
  if (readiness.length === 0) return 0;
  
  const totalScore = readiness.reduce((sum, r) => {
    const score = r.status === "SOLID" ? 2 : r.status === "NEEDS_WORK" ? 1 : 0;
    return sum + score;
  }, 0);
  
  return totalScore / readiness.length;
}

function formatPracticeDate(date: Date | null): string {
  if (!date) return "Never";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export default async function SetlistConfidencePage() {
  // Get top 20 songs by ELO with readiness and practice data
  const topSongs = await prisma.song.findMany({
    orderBy: { elo: "desc" },
    take: 20,
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">🎯 Setlist Confidence</h1>
          <p className="text-xl text-[var(--muted)]">
            Top 20 songs with readiness and practice tracking
          </p>
        </div>

        {/* Confidence Table */}
        {topSongs.length > 0 ? (
          <div className="rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[linear-gradient(135deg,var(--gold),var(--pink))]">
                  <tr>
                    <th className="px-4 py-4 text-left text-[var(--bg)] font-bold text-sm lg:text-base">
                      Rank
                    </th>
                    <th className="px-4 py-4 text-left text-[var(--bg)] font-bold text-sm lg:text-base">
                      Song
                    </th>
                    <th className="px-4 py-4 text-left text-[var(--bg)] font-bold text-sm lg:text-base hidden md:table-cell">
                      Readiness
                    </th>
                    <th className="px-4 py-4 text-left text-[var(--bg)] font-bold text-sm lg:text-base hidden lg:table-cell">
                      Last Practiced
                    </th>
                    <th className="px-4 py-4 text-left text-[var(--bg)] font-bold text-sm lg:text-base hidden xl:table-cell">
                      Key
                    </th>
                    <th className="px-4 py-4 text-right text-[var(--bg)] font-bold text-sm lg:text-base">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ring)]/20">
                  {topSongs.map((song, index) => {
                    const aggregateStatus = calculateAggregateStatus(song.readiness);
                    const avgScore = calculateAvgReadiness(song.readiness);
                    const practiceDate = formatPracticeDate(song.lastPracticedAt);
                    const isPracticeOld = song.lastPracticedAt && 
                      (new Date().getTime() - song.lastPracticedAt.getTime()) > (30 * 24 * 60 * 60 * 1000);

                    return (
                      <tr
                        key={song.id}
                        className="hover:bg-[var(--surface2)]/60 transition group"
                      >
                        <td className="px-4 py-4 text-sm lg:text-base font-bold text-[var(--text)]">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/songs/${song.id}`}
                            className="block"
                          >
                            <div className="font-semibold text-[var(--gold)] hover:text-[var(--pink)] transition text-sm lg:text-base">
                              {song.title}
                            </div>
                            <div className="text-xs lg:text-sm text-[var(--muted)]">
                              {song.artist}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="space-y-1">
                            <ReadinessIcon status={aggregateStatus} size="sm" />
                            {song.readiness.length > 0 && (
                              <div className="text-xs text-[var(--muted)]">
                                {song.readiness.length} {song.readiness.length === 1 ? 'vote' : 'votes'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className={`text-sm ${isPracticeOld ? 'text-[var(--danger,#ef4444)]' : 'text-[var(--text)]'}`}>
                            {practiceDate}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden xl:table-cell">
                          <div className="space-y-1 max-w-xs">
                            {song.keyNotes && (
                              <div className="text-xs text-[var(--text)] truncate" title={song.keyNotes}>
                                🎹 {song.keyNotes}
                              </div>
                            )}
                            {song.tuningNotes && (
                              <div className="text-xs text-[var(--muted)] truncate" title={song.tuningNotes}>
                                🎸 {song.tuningNotes}
                              </div>
                            )}
                            {!song.keyNotes && !song.tuningNotes && (
                              <div className="text-xs text-[var(--muted)]">—</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="inline-block bg-[var(--surface2)] text-[var(--text)] font-bold px-3 py-1 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base">
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
            <p className="text-[var(--muted)] text-lg">
              Add some songs and start battling to build your setlist!
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-6 rounded-xl bg-[var(--surface)]/60 border border-[var(--ring)]/20">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4 uppercase tracking-wider">
            Readiness Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🟢</span>
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">Solid</div>
                <div className="text-xs text-[var(--muted)]">Ready to perform</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🟡</span>
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">Needs Work</div>
                <div className="text-xs text-[var(--muted)]">Practice more</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🔴</span>
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">Not Ready</div>
                <div className="text-xs text-[var(--muted)]">Needs rehearsal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/results"
            className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface2)] border border-[var(--ring)]/20 rounded-xl text-[var(--text)] font-semibold transition"
          >
            🏆 Full Rankings
          </Link>
          <Link
            href="/songs"
            className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface2)] border border-[var(--ring)]/20 rounded-xl text-[var(--text)] font-semibold transition"
          >
            🎵 Browse Songs
          </Link>
          <Link
            href="/battle"
            className="px-6 py-3 bg-[linear-gradient(135deg,var(--gold),var(--pink))] hover:opacity-90 rounded-xl text-[var(--bg)] font-semibold transition"
          >
            ⚔️ Battle Songs
          </Link>
        </div>
      </div>
    </div>
  );
}
