"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/src/components/ui/Button";

type Song = { id: number; title: string; artist: string; elo: number };

export default function BattlePage() {
  const { status } = useSession();
  const [pair, setPair] = useState<{ a: Song; b: Song } | null>(null);
  const [loading, setLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    fetchPair();
  }, []);

  async function fetchPair() {
    setLoading(true);
    const res = await fetch("/api/battle/next");
    if (res.ok) setPair(await res.json());
    setLoading(false);
  }

  async function vote(winner: Song, loser: Song) {
    setLoading(true);
    await fetch("/api/battle/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
    });
    setVoteCount(voteCount + 1);
    await fetchPair();
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="p-8 text-center max-w-md rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)]">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
            Sign in to Battle
          </h2>
          <p className="text-[var(--muted)] mb-6">
            You need to be signed in to participate in song battles and help
            rank your band's music.
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4 text-[var(--text)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text)] mb-3">Battle</h1>
          <p className="text-xl text-[var(--muted)] mb-4">
            Which song wins?
          </p>
          {voteCount > 0 && (
            <p className="text-lg text-[var(--muted)]">
              {voteCount} vote{voteCount !== 1 ? 's' : ''} cast
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-32">
            <div className="animate-pulse text-6xl mb-4">🎵</div>
            <p className="text-[var(--muted)] text-lg font-medium">
              Loading next battle...
            </p>
          </div>
        )}

        {/* Battle Cards */}
        {pair && !loading && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Song A */}
              <Button
                variant="ghost"
                className="w-full text-left p-0 border-0 bg-transparent"
                onClick={() => vote(pair.a, pair.b)}
              >
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-10 hover:bg-[var(--surface2)] transition-all duration-300 h-full flex flex-col justify-between">
                  <div className="mb-8">
                    <div className="text-7xl mb-6">🎸</div>
                    <h2 className="text-4xl font-bold text-[var(--text)] mb-3">
                      {pair.a.title}
                    </h2>
                    <p className="text-2xl text-[var(--muted)]">
                      {pair.a.artist}
                    </p>
                  </div>

                  <div className="bg-[var(--surface2)] rounded-xl p-6 mb-6">
                    <p className="text-sm text-[var(--muted)] font-semibold mb-2">
                      BATTLE SCORE
                    </p>
                    <p className="text-6xl font-bold text-[var(--text)]">
                      {Math.round(pair.a.elo)}
                    </p>
                  </div>

                  <div className="w-full text-center bg-[linear-gradient(135deg,var(--gold),var(--pink))] text-[var(--bg)] font-bold py-3.5 px-6 rounded-xl text-lg">
                    Vote for This Track
                  </div>
                </div>
              </Button>

              {/* Song B */}
              <Button
                variant="ghost"
                className="w-full text-left p-0 border-0 bg-transparent"
                onClick={() => vote(pair.b, pair.a)}
              >
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-10 hover:bg-[var(--surface2)] transition-all duration-300 h-full flex flex-col justify-between">
                  <div className="mb-8">
                    <div className="text-7xl mb-6">🎵</div>
                    <h2 className="text-4xl font-bold text-[var(--text)] mb-3">
                      {pair.b.title}
                    </h2>
                    <p className="text-2xl text-[var(--muted)]">
                      {pair.b.artist}
                    </p>
                  </div>

                  <div className="bg-[var(--surface2)] rounded-xl p-6 mb-6">
                    <p className="text-sm text-[var(--muted)] font-semibold mb-2">
                      BATTLE SCORE
                    </p>
                    <p className="text-6xl font-bold text-[var(--text)]">
                      {Math.round(pair.b.elo)}
                    </p>
                  </div>

                  <div className="w-full text-center bg-[linear-gradient(135deg,var(--gold),var(--pink))] text-[var(--bg)] font-bold py-3.5 px-6 rounded-xl text-lg">
                    Vote for This Track
                  </div>
                </div>
              </Button>
            </div>

            {/* Next Battle Button */}
            <div className="text-center">
              <Button size="lg" onClick={() => fetchPair()}>
                Next Battle
              </Button>
            </div>
          </>
        )}

        {/* Footer Links */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-[var(--muted)]">
            Need to learn the parts? Browse the song library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/songs/browser"
              className="text-[var(--text)] hover:text-[var(--muted)] font-semibold transition"
            >
              📖 Song Library
            </Link>
            <Link
              href="/add-resource"
              className="text-[var(--gold)] hover:text-[var(--pink)] font-semibold transition"
            >
              ➕ Add Song/Resource
            </Link>
            <Link
              href="/results"
              className="text-[var(--text)] hover:text-[var(--muted)] font-semibold transition"
            >
              🏆 Rankings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
