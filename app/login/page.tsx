"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("email", { email, redirect: false });
      if (result?.error) {
        setError("Failed to send email. Please try again.");
      } else {
        setSent(true);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
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
        <div className="card-base p-8">
          {!sent ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-2">
                Sign In
              </h2>
              <p className="text-slate-400 mb-8">
                Enter your email to access Mixtape
              </p>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-white mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-white placeholder-slate-500"
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
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending Magic Link..." : "Send Magic Link"}
                </button>
              </form>

              <p className="text-center text-slate-400 text-sm mt-6">
                No account needed.{" "}
                <span className="text-blue-400 font-medium">
                  Sign in to create one
                </span>
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Check Your Email
                </h2>
                <p className="text-slate-300 mb-6">
                  We've sent a magic link to{" "}
                  <strong className="text-white">{email}</strong>. Click it to
                  sign in.
                </p>

                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5 mb-8 text-left">
                  <p className="text-blue-300 text-sm">
                    <strong>⚙️ Development Mode:</strong> Check MailHog at{" "}
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
