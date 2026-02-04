"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Song = { id: number; title: string; artist: string; elo: number };

export default function BattlePage() {
  const { status } = useSession();
  const [pair, setPair] = useState<{ a: Song; b: Song } | null>(null);
  const [loading, setLoading] = useState(false);

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
    await fetch("/api/battle/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
    });
    fetchPair();
  }

  if (status === "unauthenticated") {
    return (
      <main style={{ padding: 20 }}>
        <p>
          Please <a href="/login">sign in</a> to participate in battles.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Battle</h1>
      {loading && <p>Loading...</p>}
      {pair && (
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <h3>{pair.a.title}</h3>
            <p>{pair.a.artist}</p>
            <p>Elo: {Math.round(pair.a.elo)}</p>
            <button onClick={() => vote(pair.a, pair.b)}>I prefer this</button>
          </div>
          <div>
            <h3>{pair.b.title}</h3>
            <p>{pair.b.artist}</p>
            <p>Elo: {Math.round(pair.b.elo)}</p>
            <button onClick={() => vote(pair.b, pair.a)}>I prefer this</button>
          </div>
        </div>
      )}
    </main>
  );
}
