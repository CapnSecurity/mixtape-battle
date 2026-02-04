"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
        <div className="card-base p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Sign in to Battle
          </h2>
          <p className="text-slate-300 mb-6">
            You need to be signed in to participate in song battles and help
            rank your band's music.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3">⚔️ Battle</h1>
          <p className="text-xl text-slate-300">
            Which song wins? {voteCount > 0 && `(${voteCount} votes cast)`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin text-6xl mb-4">🎵</div>
              <p className="text-slate-300 text-lg font-semibold">
                Loading next battle...
              </p>
            </div>
          </div>
        )}

        {/* Battle Cards */}
        {pair && !loading && (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Song A */}
            <button
              onClick={() => vote(pair.a, pair.b)}
              className="group text-left hover-lift"
            >
              <div className="card-base bg-gradient-to-br from-blue-600 to-blue-800 p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-7xl mb-6">🎸</div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {pair.a.title}
                  </h2>
                  <p className="text-2xl text-blue-100 mb-6">
                    {pair.a.artist}
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-blue-400/30">
                  <div className="bg-blue-900/50 rounded-lg p-4">
                    <div className="text-sm text-blue-200 mb-1">
                      Current Rating
                    </div>
                    <div className="text-5xl font-bold text-white">
                      {Math.round(pair.a.elo)}
                    </div>
                  </div>

                  <div className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition text-lg text-center group-hover:shadow-lg">
                    Vote for This Track 👍
                  </div>
                </div>
              </div>
            </button>

            {/* Song B */}
            <button
              onClick={() => vote(pair.b, pair.a)}
              className="group text-left hover-lift"
            >
              <div className="card-base bg-gradient-to-br from-pink-600 to-purple-800 p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-7xl mb-6">🎵</div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {pair.b.title}
                  </h2>
                  <p className="text-2xl text-pink-100 mb-6">
                    {pair.b.artist}
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-pink-400/30">
                  <div className="bg-purple-900/50 rounded-lg p-4">
                    <div className="text-sm text-pink-200 mb-1">
                      Current Rating
                    </div>
                    <div className="text-5xl font-bold text-white">
                      {Math.round(pair.b.elo)}
                    </div>
                  </div>

                  <div className="bg-white text-pink-700 hover:bg-pink-50 font-bold py-3 px-6 rounded-lg transition text-lg text-center group-hover:shadow-lg">
                    Vote for This Track 👍
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">
            Not sure which one? Check out the songs to learn the parts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/songs"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              📖 View Song Details
            </Link>
            <Link
              href="/results"
              className="text-slate-300 hover:text-white transition font-medium"
            >
              🏆 See Rankings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
