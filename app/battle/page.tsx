"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/src/components/ui/Button";
import { eloToStars } from "../../lib/elo";
import { useCsrfToken, withCsrfToken } from "@/lib/use-csrf";
import { spotify, allMusic } from "../../lib/links";

type Song = { 
  id: number; 
  title: string; 
  artist: string; 
  elo: number;
  album?: string | null;
  albumArtUrl?: string | null;
  genre?: string | null;
  releaseDate?: number | null;
};

export default function BattlePage() {
  const { status } = useSession();
  const [pair, setPair] = useState<{ a: Song; b: Song } | null>(null);
  const [loading, setLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken();

  useEffect(() => {
    if (status === "authenticated") {
      fetchPair();
    }
  }, [status]);

  async function fetchPair() {
    setLoading(true);
    try {
      const res = await fetch("/api/battle/next");
      if (res.ok && res.status !== 204) {
        setPair(await res.json());
      } else if (res.status === 204) {
        console.log("No battles available");
        setPair(null);
      }
    } catch (error) {
      console.error("Error fetching battle:", error);
    } finally {
      setLoading(false);
    }
  }

  async function vote(winner: Song, loser: Song) {
    setLoading(true);
    if (!csrfToken) {
      setLoading(false);
      alert("Security token not ready. Please try again.");
      return;
    }

    const res = await fetch(
      "/api/battle/submit",
      withCsrfToken(csrfToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
      })
    );
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Unknown error" }));
      alert(error.error || "Failed to submit vote");
      setLoading(false);
      return;
    }
    
    setVoteCount(voteCount + 1);
    await fetchPair();
  }

  async function skip(a: Song, b: Song) {
    setLoading(true);
    if (!csrfToken) {
      setLoading(false);
      alert("Security token not ready. Please try again.");
      return;
    }

    const res = await fetch(
      "/api/battle/submit",
      withCsrfToken(csrfToken, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: a.id, loserId: b.id, skipped: true }),
      })
    );
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Unknown error" }));
      alert(error.error || "Failed to skip");
      setLoading(false);
      return;
    }
    
    await fetchPair();
  }

  function Stars({ value }: { value: number }) {
    const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
    return (
      <div className="inline-block text-2xl leading-none">
        <div className="text-[var(--muted)]">★★★★★</div>
        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${pct}%`, color: 'gold' }}>
          <div style={{ position: 'relative' }}>★★★★★</div>
        </div>
      </div>
    );
  }

  if (status === "loading" || csrfLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="p-8 text-center max-w-md rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80 shadow-[var(--shadow)]">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Loading Battle</h2>
          <p className="text-[var(--muted)]">Preparing your session...</p>
        </div>
      </div>
    );
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

        {/* No Battles Available */}
        {!loading && !pair && (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              No battles available
            </h2>
            <p className="text-[var(--muted)] text-lg mb-8">
              You've completed all available battles for now!<br/>
              Check back later or add more songs to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/add-song">Add New Song</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/results">View Rankings</Link>
              </Button>
            </div>
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
                    {pair.a.albumArtUrl ? (
                      <div className="mb-6 flex justify-center">
                        <img 
                          src={pair.a.albumArtUrl} 
                          alt={`${pair.a.album || pair.a.title} album art`}
                          className="w-48 h-48 object-cover rounded-xl shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-7xl mb-6">🎸</div>
                    )}
                    <h2 className="text-4xl font-bold text-[var(--text)] mb-3">
                      {pair.a.title}
                    </h2>
                    <p className="text-2xl text-[var(--muted)] mb-4">
                      {pair.a.artist}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <a
                        href={spotify(pair.a.artist, pair.a.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition flex items-center gap-1.5"
                      >
                        🎧 Spotify
                      </a>
                      <a
                        href={allMusic(pair.a.artist, pair.a.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition flex items-center gap-1.5"
                      >
                        💿 AllMusic
                      </a>
                    </div>
                  </div>

                  <div className="bg-[var(--surface2)] rounded-xl p-6 mb-6">
                    <p className="text-sm text-[var(--muted)] font-semibold mb-2">
                      BATTLE SCORE
                    </p>
                    <p className="text-6xl font-bold text-[var(--text)]">
                      {Math.round(pair.a.elo)}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <Stars value={eloToStars(pair.a.elo)} />
                      <span className="text-sm text-[var(--muted)]">
                        {eloToStars(pair.a.elo).toFixed(1)} / 5
                      </span>
                    </div>
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
                    {pair.b.albumArtUrl ? (
                      <div className="mb-6 flex justify-center">
                        <img 
                          src={pair.b.albumArtUrl} 
                          alt={`${pair.b.album || pair.b.title} album art`}
                          className="w-48 h-48 object-cover rounded-xl shadow-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-7xl mb-6">🎵</div>
                    )}
                    <h2 className="text-4xl font-bold text-[var(--text)] mb-3">
                      {pair.b.title}
                    </h2>
                    <p className="text-2xl text-[var(--muted)] mb-4">
                      {pair.b.artist}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <a
                        href={spotify(pair.b.artist, pair.b.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition flex items-center gap-1.5"
                      >
                        🎧 Spotify
                      </a>
                      <a
                        href={allMusic(pair.b.artist, pair.b.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition flex items-center gap-1.5"
                      >
                        💿 AllMusic
                      </a>
                    </div>
                  </div>

                  <div className="bg-[var(--surface2)] rounded-xl p-6 mb-6">
                    <p className="text-sm text-[var(--muted)] font-semibold mb-2">
                      BATTLE SCORE
                    </p>
                    <p className="text-6xl font-bold text-[var(--text)]">
                      {Math.round(pair.b.elo)}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <Stars value={eloToStars(pair.b.elo)} />
                      <span className="text-sm text-[var(--muted)]">
                        {eloToStars(pair.b.elo).toFixed(1)} / 5
                      </span>
                    </div>
                  </div>

                  <div className="w-full text-center bg-[linear-gradient(135deg,var(--gold),var(--pink))] text-[var(--bg)] font-bold py-3.5 px-6 rounded-xl text-lg">
                    Vote for This Track
                  </div>
                </div>
              </Button>
            </div>

            {/* Next Battle Button */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/results">View Rankings</Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => pair && skip(pair.a, pair.b)}
                >
                  Skip This Pair
                </Button>
              </div>
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
              href="/add-song"
              className="text-[var(--gold)] hover:text-[var(--pink)] font-semibold transition"
            >
              ➕ Add New Song
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
