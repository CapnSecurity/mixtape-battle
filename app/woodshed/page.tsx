"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/src/components/ui/Button";
import { useCsrfToken } from "@/lib/use-csrf";
import { spotify, allMusic } from "@/lib/links";

type PracticeStatus = "NOT_STARTED" | "LEARNING" | "CONFIDENT";

type PracticeItem = {
  id: string;
  status: PracticeStatus;
  priority: number;
  notes: string | null;
  addedAt: string;
  song: {
    id: number;
    title: string;
    artist: string;
    album: string | null;
    albumArtUrl: string | null;
    elo: number;
    spotify: string | null;
    youtube: string | null;
    songsterr: string | null;
    ultimateGuitar: string | null;
    lyrics: string | null;
    keyNotes: string | null;
    tuningNotes: string | null;
  };
};

export default function WoodshedPage() {
  const { data: session, status } = useSession();
  const [practiceList, setPracticeList] = useState<PracticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const { token: csrfToken } = useCsrfToken();

  useEffect(() => {
    if (status === "authenticated") {
      fetchPracticeList();
    }
  }, [status]);

  async function fetchPracticeList() {
    setLoading(true);
    try {
      const res = await fetch("/api/practice");
      if (res.ok) {
        setPracticeList(await res.json());
      }
    } catch (error) {
      console.error("Error fetching practice list:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: PracticeStatus) {
    if (!csrfToken) return;

    try {
      const res = await fetch(`/api/practice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, csrfToken }),
      });

      if (res.ok) {
        await fetchPracticeList();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async function updatePriority(id: string, newPriority: number) {
    if (!csrfToken) return;

    try {
      const res = await fetch(`/api/practice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority, csrfToken }),
      });

      if (res.ok) {
        await fetchPracticeList();
      }
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  }

  async function saveNotes(id: string) {
    if (!csrfToken) return;

    try {
      const res = await fetch(`/api/practice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes, csrfToken }),
      });

      if (res.ok) {
        await fetchPracticeList();
        setEditingId(null);
        setEditNotes("");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  }

  async function removeFromList(id: string) {
    if (!confirm("Remove this song from your woodshed?")) return;
    if (!csrfToken) return;

    try {
      const res = await fetch(`/api/practice/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csrfToken }),
      });

      if (res.ok) {
        await fetchPracticeList();
      }
    } catch (error) {
      console.error("Error removing from list:", error);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="p-8 text-center max-w-md rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Loading</h2>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="p-8 text-center max-w-md rounded-2xl border border-[var(--ring)]/20 bg-[var(--surface)]/80">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">Sign In Required</h2>
          <p className="text-[var(--muted)] mb-6">
            Sign in to track your practice progress and access learning resources.
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const groupedByStatus = {
    LEARNING: practiceList.filter((item) => item.status === "LEARNING"),
    NOT_STARTED: practiceList.filter((item) => item.status === "NOT_STARTED"),
    CONFIDENT: practiceList.filter((item) => item.status === "CONFIDENT"),
  };

  const statusConfig = {
    LEARNING: { emoji: "📚", color: "var(--gold)", label: "Currently Learning" },
    NOT_STARTED: { emoji: "🎯", color: "var(--muted)", label: "Not Started" },
    CONFIDENT: { emoji: "✅", color: "var(--green)", label: "Feeling Confident" },
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[var(--text)]">
            🪵 The Woodshed
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto">
            Your personal practice tracker. Master your craft, one song at a time.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-[var(--muted)]">Loading your practice list...</p>
          </div>
        ) : practiceList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🪵</div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
              Your woodshed is empty
            </h2>
            <p className="text-[var(--muted)] mb-6">
              Add songs from the song library to start tracking your practice.
            </p>
            <Button asChild>
              <Link href="/songs">Browse Songs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {(["LEARNING", "NOT_STARTED", "CONFIDENT"] as PracticeStatus[]).map((status) => {
              const items = groupedByStatus[status];
              if (items.length === 0) return null;

              const config = statusConfig[status];

              return (
                <div key={status}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                    <span>{config.emoji}</span>
                    <span style={{ color: config.color }}>{config.label}</span>
                    <span className="text-[var(--muted)] text-lg">({items.length})</span>
                  </h2>

                  <div className="flex flex-col items-center gap-4 md:gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-xl p-4 md:p-6 w-full max-w-2xl"
                      >
                        {/* Song Header */}
                        <div className="flex items-start gap-4 mb-4">
                          {item.song.albumArtUrl ? (
                            <img
                              src={item.song.albumArtUrl}
                              alt={item.song.album || item.song.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-[var(--surface2)] flex items-center justify-center text-2xl flex-shrink-0">
                              🎵
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/songs/${item.song.id}`}
                              className="text-lg md:text-xl font-bold text-[var(--text)] hover:text-[var(--gold)] transition block truncate"
                            >
                              {item.song.title}
                            </Link>
                            <p className="text-[var(--muted)] truncate">{item.song.artist}</p>
                            {/* Priority Stars */}
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => updatePriority(item.id, star)}
                                  className="text-lg hover:scale-110 transition"
                                  title={`Priority ${star}`}
                                >
                                  {star <= item.priority ? "⭐" : "☆"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Status Selector */}
                        <div className="mb-4">
                          <div className="flex gap-2">
                            {(["NOT_STARTED", "LEARNING", "CONFIDENT"] as PracticeStatus[]).map(
                              (s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(item.id, s)}
                                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                                    item.status === s
                                      ? "bg-[var(--gold)] text-[var(--bg)]"
                                      : "bg-[var(--surface2)] text-[var(--muted)] hover:bg-[var(--surface)]"
                                  }`}
                                  title={`${statusConfig[s].label}`}
                                >
                                  {statusConfig[s].emoji} {s.replace("_", " ")}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                          <label className="text-xs font-semibold text-[var(--muted)] block mb-2">
                            NOTES
                          </label>
                          {editingId === item.id ? (
                            <div>
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full bg-[var(--surface2)] border border-[var(--ring)]/20 rounded-lg p-2 text-[var(--text)] text-sm resize-none"
                                rows={3}
                                placeholder="Add practice notes..."
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => saveNotes(item.id)}
                                  className="px-3 py-1 bg-[var(--gold)] text-[var(--bg)] rounded-lg text-sm font-semibold hover:opacity-90"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditNotes("");
                                  }}
                                  className="px-3 py-1 bg-[var(--surface2)] text-[var(--text)] rounded-lg text-sm font-semibold hover:bg-[var(--surface)]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingId(item.id);
                                setEditNotes(item.notes || "");
                              }}
                              className="bg-[var(--surface2)] rounded-lg p-3 text-sm text-[var(--text)] cursor-pointer hover:bg-[var(--surface)] transition min-h-[60px]"
                            >
                              {item.notes || (
                                <span className="text-[var(--muted)] italic">
                                  Click to add notes...
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Song Details */}
                        {(item.song.keyNotes || item.song.tuningNotes) && (
                          <div className="mb-4 space-y-1">
                            {item.song.keyNotes && (
                              <p className="text-xs text-[var(--muted)]">
                                <span className="font-semibold">Key:</span> {item.song.keyNotes}
                              </p>
                            )}
                            {item.song.tuningNotes && (
                              <p className="text-xs text-[var(--muted)]">
                                <span className="font-semibold">Tuning:</span>{" "}
                                {item.song.tuningNotes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Resource Links */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Link
                            href={`/songs/${item.song.id}`}
                            className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition"
                          >
                            📖 Song Page
                          </Link>
                          {item.song.songsterr && (
                            <a
                              href={item.song.songsterr}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition"
                            >
                              🎸 Tabs
                            </a>
                          )}
                          {item.song.lyrics && (
                            <a
                              href={item.song.lyrics}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition"
                            >
                              📝 Lyrics
                            </a>
                          )}
                          {item.song.youtube && (
                            <a
                              href={item.song.youtube}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition"
                            >
                              📹 Video
                            </a>
                          )}
                          {item.song.spotify && (
                            <a
                              href={item.song.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--ring)]/20 rounded-lg text-xs font-semibold text-[var(--text)] transition"
                            >
                              🎧 Spotify
                            </a>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromList(item.id)}
                          className="w-full py-2 bg-[var(--surface2)] hover:bg-red-900/20 border border-[var(--ring)]/20 hover:border-red-500/50 rounded-lg text-sm font-semibold text-[var(--muted)] hover:text-red-400 transition"
                        >
                          Remove from Woodshed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
