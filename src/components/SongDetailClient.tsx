"use client";

import { useState, useEffect } from "react";
import ReadinessControl from "./ReadinessControl";
import ReadinessIcon from "./ReadinessIcon";
import PracticeTracker from "./PracticeTracker";

type ReadinessStatus = "SOLID" | "NEEDS_WORK" | "NOT_READY" | null;
type AggregateStatus = "SOLID" | "NEEDS_WORK" | "NOT_READY" | "NONE";

interface ReadinessData {
  userReadiness: ReadinessStatus;
  aggregate: {
    status: AggregateStatus;
    counts: {
      SOLID: number;
      NEEDS_WORK: number;
      NOT_READY: number;
    };
    avgScore: number;
    totalVotes: number;
  };
}

interface SongDetailClientProps {
  songId: number;
  lastPracticedAt: string | null;
  keyNotes: string | null;
  tuningNotes: string | null;
}

export default function SongDetailClient({
  songId,
  lastPracticedAt,
  keyNotes,
  tuningNotes,
}: SongDetailClientProps) {
  const [readinessData, setReadinessData] = useState<ReadinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReadiness = async () => {
    try {
      const response = await fetch(`/api/songs/${songId}/readiness`);
      if (response.ok) {
        const data = await response.json();
        setReadinessData(data);
      }
    } catch (error) {
      console.error("Error fetching readiness:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, [songId]);

  if (isLoading) {
    return <div className="text-[var(--muted)]">Loading readiness...</div>;
  }

  if (!readinessData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Readiness Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Readiness Control */}
        <ReadinessControl
          songId={songId}
          initialStatus={readinessData.userReadiness}
          onUpdate={fetchReadiness}
        />

        {/* Aggregate Readiness Display */}
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--ring)]/20">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-3">
            Band Readiness
          </div>
          {readinessData.aggregate.totalVotes > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ReadinessIcon status={readinessData.aggregate.status} size="lg" />
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-lg">🟢</span>
                  <span className="text-[var(--text)]">{readinessData.aggregate.counts.SOLID}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🟡</span>
                  <span className="text-[var(--text)]">
                    {readinessData.aggregate.counts.NEEDS_WORK}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🔴</span>
                  <span className="text-[var(--text)]">
                    {readinessData.aggregate.counts.NOT_READY}
                  </span>
                </div>
              </div>
              <div className="text-xs text-[var(--muted)]">
                {readinessData.aggregate.totalVotes}{" "}
                {readinessData.aggregate.totalVotes === 1 ? "member" : "members"} voted
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ReadinessIcon status="NONE" size="lg" />
              <span className="text-sm text-[var(--muted)]">No readiness votes yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Practice Tracker */}
      <PracticeTracker
        songId={songId}
        initialLastPracticed={lastPracticedAt}
        initialKeyNotes={keyNotes}
        initialTuningNotes={tuningNotes}
        onUpdate={() => {}}
      />
    </div>
  );
}
