"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCsrfToken, withCsrfToken } from "@/lib/use-csrf";
import Button from "./ui/Button";

interface PracticeTrackerProps {
  songId: number;
  initialLastPracticed: string | null;
  initialKeyNotes: string | null;
  initialTuningNotes: string | null;
  onUpdate?: () => void;
}

export default function PracticeTracker({
  songId,
  initialLastPracticed,
  initialKeyNotes,
  initialTuningNotes,
  onUpdate,
}: PracticeTrackerProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin || false;
  
  const [lastPracticed, setLastPracticed] = useState(initialLastPracticed);
  const [keyNotes, setKeyNotes] = useState(initialKeyNotes || "");
  const [tuningNotes, setTuningNotes] = useState(initialTuningNotes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { token: csrfToken } = useCsrfToken();

  const handleMarkPracticed = async () => {
    if (!csrfToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/songs/${songId}/practice`,
        withCsrfToken(csrfToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markPracticed: true }),
        })
      );

      if (response.ok) {
        const data = await response.json();
        setLastPracticed(data.song.lastPracticedAt);
        onUpdate?.();
      } else {
        console.error("Failed to mark as practiced");
      }
    } catch (error) {
      console.error("Error marking as practiced:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!csrfToken) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/songs/${songId}/practice`,
        withCsrfToken(csrfToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyNotes: keyNotes || null,
            tuningNotes: tuningNotes || null,
          }),
        })
      );

      if (response.ok) {
        onUpdate?.();
      } else {
        console.error("Failed to save notes");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--ring)]/20 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
              Last Practiced
            </div>
            <div className="text-lg font-semibold text-[var(--text)]">
              {formatDate(lastPracticed)}
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleMarkPracticed} disabled={isLoading}>
              {isLoading ? "Saving..." : "Mark Practiced Today"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
            Key / Signature
          </label>
          {isAdmin ? (
            <input
              type="text"
              value={keyNotes}
              onChange={(e) => setKeyNotes(e.target.value)}
              placeholder="e.g., E minor, Drop D"
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--gold)] transition"
            />
          ) : (
            <div className="px-4 py-2 text-[var(--text)]">
              {keyNotes || <span className="text-[var(--muted)]">Not set</span>}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] uppercase tracking-wider mb-2">
            Tuning Notes
          </label>
          {isAdmin ? (
            <textarea
              value={tuningNotes}
              onChange={(e) => setTuningNotes(e.target.value)}
              placeholder="e.g., Standard tuning, capo 2nd fret"
              rows={2}
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--gold)] transition resize-none"
            />
          ) : (
            <div className="px-4 py-2 text-[var(--text)]">
              {tuningNotes || <span className="text-[var(--muted)]">Not set</span>}
            </div>
          )}
        </div>

        {isAdmin && (
          <Button onClick={handleSaveNotes} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        )}
      </div>
    </div>
  );
}
