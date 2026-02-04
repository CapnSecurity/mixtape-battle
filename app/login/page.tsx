"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'signin'|'signup'>('signin');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === 'signin') {
        // Try password sign in first
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError("Invalid email or password. Try again or use magic link.");
        } else {
          // Success, redirect handled by next-auth
        }
      } else {
        // For now, fallback to magic link for signup
        const result = await signIn("email", { email, redirect: false });
        if (result?.error) {
          setError("Failed to send email. Please try again.");
        } else {
          setSent(true);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSent(false);
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold text-white mb-2">Mixtape</h1>
          <p className="text-slate-400 text-lg">
            Band Music Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="card-base p-10 bg-slate-900/80 rounded-2xl shadow-2xl border border-slate-800">
          {!sent ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                {mode === 'signin' ? <FaSignInAlt className="inline text-blue-400" /> : <FaUserPlus className="inline text-green-400" />}
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </h2>
              <p className="text-slate-400 mb-8 text-base">
                {mode === 'signin'
                  ? 'Sign in with your email and password below, or use a magic link if you prefer passwordless login.'
                  : 'Sign up with your email and password below, or use a magic link for passwordless signup.'}
              </p>

              <form onSubmit={submit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <FaEnvelope className="inline text-blue-300" /> Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-slate-500 text-base"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <FaLock className="inline text-blue-300" /> Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 8 chars)"
                    required={mode === 'signup'}
                    minLength={8}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-slate-500 text-base"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-lg transition shadow-lg ${mode === 'signin' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <span>
                      {mode === 'signin' ? 'Signing In...' : 'Signing Up...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === 'signin' ? <FaSignInAlt /> : <FaUserPlus />}
                      {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </span>
                  )}
                </button>
              </form>

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
                <button
                  className="text-blue-400 font-medium hover:underline text-base"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                </button>
                <button
                  className="text-blue-400 font-medium hover:underline text-base"
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const result = await signIn("email", { email, redirect: false });
                      if (result?.error) {
                        setError("Failed to send magic link. Please try again.");
                      } else {
                        setSent(true);
                      }
                    } catch (err) {
                      setError("An unexpected error occurred.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <FaEnvelope className="inline mr-1" /> Use Magic Link
                </button>
              </div>
              <div className="mt-8 text-slate-400 text-xs text-center">
                <span className="block mb-1">• Passwords are securely encrypted and never shared.</span>
                <span className="block">• Magic link sign-in is instant in development (see MailHog below).</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-slate-300 mb-6">
                  We've sent a magic link to{' '}
                  <strong className="text-white">{email}</strong>. Click it to
                  sign in.
                </p>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5 mb-8 text-left">
                  <p className="text-blue-300 text-sm">
                    <strong>⚙️ Development Mode:</strong> Check MailHog at{' '}
                    <a
                      href="http://localhost:8025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:text-blue-200 transition"
                    >
                      localhost:8025
                    </a>
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Try Different Email
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <Link href="/" className="hover:text-white transition font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
