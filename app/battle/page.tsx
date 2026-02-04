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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign in to Battle
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in to participate in song battles.
          </p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
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
          <h1 className="text-4xl font-bold text-white mb-2">⚔️ Battle</h1>
          <p className="text-gray-300">
            Which song do you prefer? {voteCount > 0 && `(${voteCount} votes)`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <div className="inline-block">
              <div className="animate-spin text-5xl mb-4">🎵</div>
              <p className="text-white">Loading next battle...</p>
            </div>
          </div>
        )}

        {/* Battle Cards */}
        {pair && !loading && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Song A */}
            <div className="group cursor-pointer">
              <div
                onClick={() => vote(pair.a, pair.b)}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-2xl p-8 transform transition hover:scale-105 hover:shadow-3xl min-h-96 flex flex-col justify-between"
              >
                <div>
                  <div className="text-6xl mb-6 text-center">🎶</div>
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">
                    {pair.a.title}
                  </h2>
                  <p className="text-xl text-blue-100 text-center mb-6">
                    {pair.a.artist}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm text-blue-100 mb-1">Rating</div>
                    <div className="text-4xl font-bold text-white">
                      {Math.round(pair.a.elo)}
                    </div>
                  </div>

                  <button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105">
                    I Prefer This 👍
                  </button>
                </div>
              </div>
            </div>

            {/* Song B */}
            <div className="group cursor-pointer">
              <div
                onClick={() => vote(pair.b, pair.a)}
                className="bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl shadow-2xl p-8 transform transition hover:scale-105 hover:shadow-3xl min-h-96 flex flex-col justify-between"
              >
                <div>
                  <div className="text-6xl mb-6 text-center">🎵</div>
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">
                    {pair.b.title}
                  </h2>
                  <p className="text-xl text-pink-100 text-center mb-6">
                    {pair.b.artist}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm text-pink-100 mb-1">Rating</div>
                    <div className="text-4xl font-bold text-white">
                      {Math.round(pair.b.elo)}
                    </div>
                  </div>

                  <button className="w-full bg-white text-pink-600 hover:bg-pink-50 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105">
                    I Prefer This 👍
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <Link
            href="/results"
            className="text-gray-300 hover:text-white transition"
          >
            View Rankings →
          </Link>
        </div>
      </div>
    </div>
  );
}
