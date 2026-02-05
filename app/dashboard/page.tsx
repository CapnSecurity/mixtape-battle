"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/src/components/ui/Button";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6">🎵</div>
          <h1 className="text-6xl font-bold text-[var(--text)] mb-4">Mixtape Battle</h1>
          <p className="text-[var(--muted)] text-xl">
            Welcome back, {session?.user?.email}
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Battle */}
          <Link href="/battle" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">⚔️</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Battle</h2>
              <p className="text-[var(--muted)]">
                Vote on head-to-head song matchups to determine rankings
              </p>
            </div>
          </Link>

          {/* Rankings */}
          <Link href="/results" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Rankings</h2>
              <p className="text-[var(--muted)]">
                View current song rankings and statistics
              </p>
            </div>
          </Link>

          {/* Songs */}
          <Link href="/songs/browser" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">🎸</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Songs</h2>
              <p className="text-[var(--muted)]">
                Browse and manage your song library
              </p>
            </div>
          </Link>

          {/* Invite */}
          <Link href="/invite" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Invite</h2>
              <p className="text-[var(--muted)]">
                Invite band members to participate
              </p>
            </div>
          </Link>
        </div>

        {/* Account Settings Link */}
        <div className="text-center">
          <Link href="/settings">
            <Button variant="ghost">⚙️ Account Settings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
