"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="text-2xl font-bold text-white">🎵</div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              Mixtape Battle
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/battle"
              className="text-white hover:text-purple-100 transition font-medium"
            >
              Battle
            </Link>
            <Link
              href="/results"
              className="text-white hover:text-purple-100 transition font-medium"
            >
              Rankings
            </Link>
            <Link
              href="/songs"
              className="text-white hover:text-purple-100 transition font-medium"
            >
              Songs
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="text-white">Loading...</div>
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-white text-sm">{session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white hover:bg-gray-100 text-purple-700 px-4 py-2 rounded font-medium transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-4 pb-4 text-white text-sm">
          <Link href="/battle" className="hover:text-purple-100">
            Battle
          </Link>
          <Link href="/results" className="hover:text-purple-100">
            Rankings
          </Link>
          <Link href="/songs" className="hover:text-purple-100">
            Songs
          </Link>
        </div>
      </div>
    </nav>
  );
}
