"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Button from "@/src/components/ui/Button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur border-b border-[var(--ring)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <div className="text-2xl font-bold">🎵</div>
            <div>
              <span className="text-lg md:text-xl font-bold text-[var(--text)] font-serif">
                Mixtape
              </span>
              <div className="text-xs text-[var(--muted)] hidden sm:inline ml-2">
                Band Management
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/battle"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2 min-h-[44px]"
            >
              <span>⚔️</span> Battle
            </Link>
            <Link
              href="/results"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2 min-h-[44px]"
            >
              <span>🏆</span> Rankings
            </Link>
            <Link
              href="/setlist-confidence"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2 min-h-[44px]"
            >
              <span>🎯</span> Setlist
            </Link>
            <Link
              href="/admin"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2 min-h-[44px]"
            >
              <span>⚙️</span> Admin
            </Link>
            <Link
              href="/songs"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2 min-h-[44px]"
            >
              <span>🎸</span> Songs
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {status === "loading" ? (
              <div className="text-[var(--muted)] text-sm">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-xs md:text-sm text-[var(--muted)] hidden sm:inline truncate max-w-[120px] md:max-w-none">
                  {session.user?.email}
                </div>
                <Button
                  variant="surface"
                  size="md"
                  onClick={async () => {
                    await signOut({ callbackUrl: "/login" });
                  }}
                  className="min-h-[44px] md:min-h-0"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild size="md" className="min-h-[44px] md:min-h-0">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-2 pb-3 overflow-x-auto border-t border-[var(--ring)]/20 pt-3 -mx-4 px-4">
          <Link 
            href="/battle" 
            className="text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[var(--surface)] min-h-[44px] flex-shrink-0"
          >
            <span className="text-lg">⚔️</span> 
            <span className="text-sm font-medium">Battle</span>
          </Link>
          <Link 
            href="/results" 
            className="text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[var(--surface)] min-h-[44px] flex-shrink-0"
          >
            <span className="text-lg">🏆</span> 
            <span className="text-sm font-medium">Rankings</span>
          </Link>
          <Link 
            href="/setlist-confidence" 
            className="text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[var(--surface)] min-h-[44px] flex-shrink-0"
          >
            <span className="text-lg">🎯</span> 
            <span className="text-sm font-medium">Setlist</span>
          </Link>
          <Link 
            href="/songs" 
            className="text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[var(--surface)] min-h-[44px] flex-shrink-0"
          >
            <span className="text-lg">🎸</span> 
            <span className="text-sm font-medium">Songs</span>
          </Link>
          <Link 
            href="/admin" 
            className="text-[var(--muted)] hover:text-[var(--text)] transition flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-[var(--surface)] min-h-[44px] flex-shrink-0"
          >
            <span className="text-lg">⚙️</span> 
            <span className="text-sm font-medium">Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
