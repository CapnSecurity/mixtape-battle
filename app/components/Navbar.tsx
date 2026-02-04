"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3">
            <div className="text-2xl font-bold gradient-text">🎵</div>
            <div>
              <span className="text-xl font-bold text-white hidden sm:inline font-serif">
                Mixtape
              </span>
              <div className="text-xs text-slate-400 hidden sm:inline ml-2">
                Band Management
              </div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/battle"
              className="text-slate-300 hover:text-white transition font-medium flex items-center gap-2"
            >
              <span>⚔️</span> Battle
            </Link>
            <Link
              href="/results"
              className="text-slate-300 hover:text-white transition font-medium flex items-center gap-2"
            >
              <span>🏆</span> Rankings
            </Link>
            <Link
              href="/invite"
              className="text-slate-300 hover:text-white transition font-medium flex items-center gap-2"
            >
              <span>✉️</span> Invite
            </Link>
            <Link
              href="/songs/browser"
              className="text-slate-300 hover:text-white transition font-medium flex items-center gap-2"
            >
              <span>🎸</span> Songs
            </Link>
            {/* End of Nav Links */}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="text-slate-400 text-sm">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-300 hidden sm:inline">
                  {session.user?.email}
                </div>
                <button
                  onClick={async () => {
                    await signOut({ callbackUrl: "/login" });
                    // Optionally show a toast or feedback here
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
                >
                  Sign In
                </Link>
                {/* Library link removed as requested */}
              </>
            )}
          </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-4 pb-4 text-slate-300 text-sm border-t border-slate-700 mt-4 pt-4">
          <Link href="/battle" className="hover:text-white flex items-center gap-1">
            ⚔️ Battle
          </Link>
          <Link href="/results" className="hover:text-white flex items-center gap-1">
            🏆 Rankings
          </Link>
          <Link href="/songs/browser" className="hover:text-white flex items-center gap-1">
            🎸 Songs
          </Link>
        </div>
        </div>
      </div>
    </nav>
  );
}
