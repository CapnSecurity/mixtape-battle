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
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">Battle</h1>
          <p className="text-xl text-gray-600 mb-4">
            Which song wins?
          </p>
          {voteCount > 0 && (
            <p className="text-lg text-gray-500">
              {voteCount} vote{voteCount !== 1 ? 's' : ''} cast
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-32">
            <div className="animate-pulse text-6xl mb-4">🎵</div>
            <p className="text-gray-600 text-lg font-medium">
              Loading next battle...
            </p>
          </div>
        )}

        {/* Battle Cards */}
        {pair && !loading && (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Song A */}
              <button
                onClick={() => vote(pair.a, pair.b)}
                className="text-left"
              >
                <div className="bg-white border-4 border-gray-300 rounded-xl p-12 hover:border-gray-400 hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between cursor-pointer">
                  <div className="mb-8">
                    <div className="text-7xl mb-6">🎸</div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">
                      {pair.a.title}
                    </h2>
                    <p className="text-2xl text-gray-600">
                      {pair.a.artist}
                    </p>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-6 mb-6">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      BATTLE SCORE
                    </p>
                    <p className="text-6xl font-bold text-gray-900">
                      {Math.round(pair.a.elo)}
                    </p>
                  </div>

                  <button className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-lg">
                    Vote for This Track
                  </button>
                </div>
              </button>

              {/* Song B */}
              <button
                onClick={() => vote(pair.b, pair.a)}
                className="text-left"
              >
                <div className="bg-white border-4 border-gray-300 rounded-xl p-12 hover:border-gray-400 hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between cursor-pointer">
                  <div className="mb-8">
                    <div className="text-7xl mb-6">🎵</div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">
                      {pair.b.title}
                    </h2>
                    <p className="text-2xl text-gray-600">
                      {pair.b.artist}
                    </p>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-6 mb-6">
                    <p className="text-sm text-gray-600 font-semibold mb-2">
                      BATTLE SCORE
                    </p>
                    <p className="text-6xl font-bold text-gray-900">
                      {Math.round(pair.b.elo)}
                    </p>
                  </div>

                  <button className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors text-lg">
                    Vote for This Track
                  </button>
                </div>
              </button>
            </div>

            {/* Next Battle Button */}
            <div className="text-center">
              <button
                onClick={() => fetchPair()}
                className="bg-gray-900 text-white font-bold py-4 px-10 rounded-lg hover:bg-gray-800 transition-colors text-lg"
              >
                Next Battle
              </button>
            </div>
          </>
        )}

        {/* Footer Links */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-gray-600">
            Need to learn the parts? Browse the song library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/songs"
              className="text-gray-900 hover:text-gray-700 font-semibold transition"
            >
              📖 Song Library
            </Link>
            <Link
              href="/add-resource"
              className="text-green-900 hover:text-green-700 font-semibold transition"
            >
              ➕ Add Song/Resource
            </Link>
            <Link
              href="/results"
              className="text-gray-900 hover:text-gray-700 font-semibold transition"
            >
              🏆 Rankings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
