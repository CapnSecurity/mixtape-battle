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
              <span className="text-xl font-bold text-[var(--text)] hidden sm:inline font-serif">
                Mixtape
              </span>
              <div className="text-xs text-[var(--muted)] hidden sm:inline ml-2">
                Band Management
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/battle"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2"
            >
              <span>⚔️</span> Battle
            </Link>
            <Link
              href="/results"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2"
            >
              <span>🏆</span> Rankings
            </Link>
            <Link
              href="/admin"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2"
            >
              <span>⚙️</span> Admin
            </Link>
            <Link
              href="/songs/browser"
              className="text-[var(--muted)] hover:text-[var(--text)] transition font-medium flex items-center gap-2"
            >
              <span>🎸</span> Songs
            </Link>
            {/* End of Nav Links */}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="text-[var(--muted)] text-sm">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-[var(--muted)] hidden sm:inline">
                  {session.user?.email}
                </div>
                <Button
                  variant="surface"
                  onClick={async () => {
                    await signOut({ callbackUrl: "/login" });
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-4 pb-4 text-[var(--muted)] text-sm border-t border-[var(--ring)]/20 mt-4 pt-4">
          <Link href="/battle" className="hover:text-[var(--text)] flex items-center gap-1">
            ⚔️ Battle
          </Link>
          <Link href="/results" className="hover:text-[var(--text)] flex items-center gap-1">
            🏆 Rankings
          </Link>
          <Link href="/songs/browser" className="hover:text-[var(--text)] flex items-center gap-1">
            🎸 Songs
          </Link>
        </div>
        </div>
      </div>
    </nav>
  );
}
