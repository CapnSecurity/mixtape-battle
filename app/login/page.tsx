"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaLock } from "react-icons/fa";
import AuthShell from "@/src/components/AuthShell";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
        const result = await signIn("credentials", { 
          email, 
          password, 
          redirect: false, 
          callbackUrl: "/dashboard" 
        });
        if (!result || result?.error) {
          setError("Invalid email or password. Try again or use magic link.");
        } else {
          router.push(result.url || "/dashboard");
        }
      } else {
        if (!password || password.length < 8) {
          setError("Please use a password with at least 8 characters.");
          return;
        }
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.status === 409) {
          setError("An account with that email already exists. Please sign in.");
          setMode("signin");
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error || "Sign up failed. Please try again.");
          return;
        }
        // Add delay to avoid race conditions in dev
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = await signIn("credentials", { 
          email, 
          password, 
          redirect: false, 
          callbackUrl: "/dashboard" 
        });
        if (!result || result?.error) {
          setError("Sign up succeeded, but sign in failed. Please sign in.");
          setMode("signin");
          return;
        }
        router.push(result.url || "/dashboard");
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
    <AuthShell>
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-4">🎵</div>
          <h1 className="text-6xl font-bold text-[var(--text)] mb-3">Mixtape</h1>
          <p className="text-[var(--muted)] text-xl">
            Band Music Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="p-10 sm:p-12 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl">
          {!sent ? (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
                  {mode === 'signin' ? <FaSignInAlt className="text-[var(--gold)] text-2xl" /> : <FaUserPlus className="text-[var(--pink)] text-2xl" />}
                  {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                </h2>
                <p className="text-[var(--muted)] text-base leading-relaxed">
                  {mode === 'signin'
                    ? 'Sign in with your email and password below. If you have never signed in before, please enter your email and click "Send Magic Link".'
                    : 'Sign up with your email and password below, or use a magic link for passwordless signup.'}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="block text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                    <FaEnvelope className="text-[var(--gold)]" /> Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                    <FaLock className="text-[var(--gold)]" /> Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 8 chars)"
                    required={mode === 'signup'}
                    minLength={8}
                  />
                </div>

                {error && (
                  <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--pink)]/70 text-[var(--pink)] rounded-xl text-sm font-medium leading-relaxed">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full text-lg font-bold mt-2"
                >
                  {loading ? (
                    <span>
                      {mode === 'signin' ? 'Signing In...' : 'Signing Up...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {mode === 'signin' ? <FaSignInAlt className="text-lg" /> : <FaUserPlus className="text-lg" />}
                      {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-10 space-y-4">
                <Button
                  variant="surface"
                  type="button"
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
                  className="w-full"
                >
                  <FaEnvelope /> Send Magic Link
                </Button>
              </div>
              <div className="mt-8 text-[var(--muted)] text-xs text-center space-y-1">
                <p>🔒 Passwords are securely encrypted and never shared.</p>
                <p>⚡ Magic link sign-in is instant in development (see MailHog below).</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-7xl mb-6">📧</div>
                <h2 className="text-4xl font-bold text-[var(--text)] mb-4">
                  Check Your Email
                </h2>
                <p className="text-[var(--muted)] mb-8 text-lg leading-relaxed">
                  We've sent a magic link to{' '}
                  <strong className="text-[var(--text)]">{email}</strong>. Click it to
                  sign in.
                </p>

                <div className="bg-[var(--surface2)] border border-[var(--ring)]/30 rounded-xl p-6 mb-8 text-left">
                  <p className="text-[var(--muted)] text-sm leading-relaxed">
                    <strong className="text-[var(--text)]">⚙️ Development Mode:</strong> Check MailHog at{' '}
                    <a
                      href="http://localhost:8025"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold)] underline font-semibold hover:text-[var(--pink)] transition"
                    >
                      localhost:8025
                    </a>
                  </p>
                </div>

                <Button type="button" variant="surface" size="lg" onClick={handleReset} className="w-full">
                  Try Different Email
                </Button>
              </div>
            </>
            )}
          </div>

          {/* Footer */}
        <div className="mt-12 text-center text-[var(--muted)] text-sm">
          <Link href="/" className="inline-flex items-center gap-2 hover:text-[var(--text)] transition font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
