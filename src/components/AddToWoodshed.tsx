"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCsrfToken } from "@/lib/use-csrf";

type AddToWoodshedProps = {
  songId: number;
  variant?: "icon" | "button" | "compact";
  className?: string;
  onSuccess?: () => void;
};

export default function AddToWoodshed({ 
  songId, 
  variant = "button",
  className = "", 
  onSuccess 
}: AddToWoodshedProps) {
  const { data: session } = useSession();
  const { token: csrfToken } = useCsrfToken();
  const [isInWoodshed, setIsInWoodshed] = useState(false);
  const [practiceItemId, setPracticeItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (session) {
      checkIfInWoodshed();
    } else {
      setLoading(false);
    }
  }, [session, songId]);

  async function checkIfInWoodshed() {
    try {
      const res = await fetch("/api/practice");
      if (res.ok) {
        const practiceList = await res.json();
        const item = practiceList.find((p: any) => p.song.id === songId);
        if (item) {
          setIsInWoodshed(true);
          setPracticeItemId(item.id);
        } else {
          setIsInWoodshed(false);
          setPracticeItemId(null);
        }
      }
    } catch (error) {
      console.error("Error checking woodshed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addToWoodshed() {
    if (!csrfToken || actionLoading) return;
    
    setActionLoading(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, csrfToken }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setIsInWoodshed(true);
        setPracticeItemId(newItem.id);
        onSuccess?.();
      } else if (res.status === 409) {
        // Already in woodshed
        await checkIfInWoodshed();
      }
    } catch (error) {
      console.error("Error adding to woodshed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  async function removeFromWoodshed() {
    if (!csrfToken || !practiceItemId || actionLoading) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/practice/${practiceItemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csrfToken }),
      });

      if (res.ok) {
        setIsInWoodshed(false);
        setPracticeItemId(null);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error removing from woodshed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  // Don't show if not authenticated
  if (!session) return null;

  // Loading state
  if (loading) {
    return (
      <div className={className}>
        {variant === "icon" ? (
          <button className="text-2xl opacity-50" disabled>
            🪵
          </button>
        ) : variant === "compact" ? (
          <button 
            className="px-2 py-1 bg-[var(--surface2)] text-[var(--muted)] rounded-lg text-xs font-semibold cursor-not-allowed"
            disabled
          >
            ...
          </button>
        ) : (
          <button 
            className="px-4 py-2 bg-[var(--surface2)] text-[var(--muted)] rounded-lg font-semibold cursor-not-allowed"
            disabled
          >
            Loading...
          </button>
        )}
      </div>
    );
  }

  // Icon variant (just the emoji button)
  if (variant === "icon") {
    return (
      <button
        onClick={isInWoodshed ? removeFromWoodshed : addToWoodshed}
        disabled={actionLoading}
        className={`text-2xl transition hover:scale-110 ${
          isInWoodshed ? "opacity-100" : "opacity-50 hover:opacity-100"
        } ${actionLoading ? "cursor-not-allowed animate-pulse" : ""} ${className}`}
        title={isInWoodshed ? "Remove from Woodshed" : "Add to Woodshed"}
      >
        🪵
      </button>
    );
  }

  // Compact variant (small button)
  if (variant === "compact") {
    return (
      <button
        onClick={isInWoodshed ? removeFromWoodshed : addToWoodshed}
        disabled={actionLoading}
        className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
          isInWoodshed
            ? "bg-[var(--gold)]/20 text-[var(--gold)] hover:bg-[var(--gold)]/30"
            : "bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface)]"
        } ${actionLoading ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      >
        {actionLoading ? "..." : isInWoodshed ? "🪵 In Woodshed" : "🪵 Add"}
      </button>
    );
  }

  // Full button variant
  return (
    <button
      onClick={isInWoodshed ? removeFromWoodshed : addToWoodshed}
      disabled={actionLoading}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        isInWoodshed
          ? "bg-[var(--gold)]/20 text-[var(--gold)] hover:bg-[var(--gold)]/30 border border-[var(--gold)]/40"
          : "bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--ring)]/20"
      } ${actionLoading ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      {actionLoading ? (
        "Loading..."
      ) : isInWoodshed ? (
        <>✓ In Woodshed</>
      ) : (
        <>🪵 Add to Woodshed</>
      )}
    </button>
  );
}
