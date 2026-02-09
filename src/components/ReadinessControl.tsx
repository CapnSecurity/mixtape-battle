"use client";

import { useState } from "react";
import { useCsrfToken, withCsrfToken } from "@/lib/use-csrf";

type ReadinessStatus = "SOLID" | "NEEDS_WORK" | "NOT_READY" | null;

interface ReadinessControlProps {
  songId: number;
  initialStatus: ReadinessStatus;
  onUpdate?: () => void;
}

const statusConfig = {
  SOLID: { icon: "🟢", label: "Solid", color: "var(--success, #22c55e)" },
  NEEDS_WORK: { icon: "🟡", label: "Needs Work", color: "var(--warning, #eab308)" },
  NOT_READY: { icon: "🔴", label: "Not Ready", color: "var(--danger, #ef4444)" },
};

export default function ReadinessControl({
  songId,
  initialStatus,
  onUpdate,
}: ReadinessControlProps) {
  const [status, setStatus] = useState<ReadinessStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { token: csrfToken } = useCsrfToken();

  const handleSetReadiness = async (newStatus: keyof typeof statusConfig) => {
    if (!csrfToken) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/songs/${songId}/readiness`, 
        withCsrfToken(csrfToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      if (response.ok) {
        setStatus(newStatus);
        onUpdate?.();
      } else {
        console.error("Failed to update readiness");
      }
    } catch (error) {
      console.error("Error updating readiness:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--ring)]/20">
      <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-3">
        Your Readiness
      </div>
      <div className="flex gap-2">
        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
          const config = statusConfig[key];
          const isActive = status === key;
          return (
            <button
              key={key}
              onClick={() => handleSetReadiness(key)}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition font-medium text-sm ${
                isActive
                  ? "border-current bg-current/10"
                  : "border-[var(--ring)]/20 hover:border-[var(--ring)]/40"
              }`}
              style={isActive ? { color: config.color, borderColor: config.color } : {}}
            >
              <div className="text-2xl mb-1">{config.icon}</div>
              <div className="text-xs">{config.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
