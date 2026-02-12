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
            Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'friend'}
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
          <Link href="/songs" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">🎸</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Songs</h2>
              <p className="text-[var(--muted)]">
                Browse and manage your song library
              </p>
            </div>
          </Link>

          {/* Invite */}
          <Link href="/admin" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Admin</h2>
              <p className="text-[var(--muted)]">
                Invite band members and manage users
              </p>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/settings" className="group">
            <div className="p-8 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] hover:bg-[var(--surface)] transition">
              <div className="text-5xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Settings</h2>
              <p className="text-[var(--muted)]">
                Manage your account and battle preferences
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Stats or Info */}
        <div className="text-center text-[var(--muted)] text-sm">
          <p>Customize your battle experience in Settings</p>
        </div>
      </div>
    </div>
  );
}
