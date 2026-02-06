"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { FaLock, FaCheck } from "react-icons/fa";

function SettingsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState("");

  useEffect(() => {
    if (resetToken) {
      verifyResetToken();
    }
  }, [resetToken]);

  async function verifyResetToken() {
    setVerifyingToken(true);
    try {
      const res = await fetch(`/api/auth/verify-reset-token?token=${resetToken}`);
      if (res.ok) {
        const data = await res.json();
        setTokenValid(true);
        setTokenEmail(data.email);
      } else {
        setError("Invalid or expired password reset link");
      }
    } catch (err) {
      setError("Failed to verify password reset link");
    } finally {
      setVerifyingToken(false);
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const body: any = { password };
      if (resetToken) {
        body.resetToken = resetToken;
      }

      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to set password");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login if using reset token, otherwise dashboard
      setTimeout(() => {
        router.push(resetToken ? "/login" : "/dashboard");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h1 className="text-5xl font-bold text-[var(--text)] mb-3">
            {resetToken ? "Reset Your Password" : "Account Settings"}
          </h1>
          <p className="text-[var(--muted)] text-lg">
            {resetToken ? (verifyingToken ? "Verifying link..." : tokenEmail || session?.user?.email) : session?.user?.email}
          </p>
        </div>

        {verifyingToken && (
          <div className="p-10 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl mb-8 text-center">
            <p className="text-[var(--muted)]">Verifying password reset link...</p>
          </div>
        )}

        {resetToken && !verifyingToken && !tokenValid && (
          <div className="p-10 rounded-3xl border border-[var(--pink)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl mb-8 text-center">
            <p className="text-[var(--pink)] font-semibold mb-4">Invalid or Expired Link</p>
            <p className="text-[var(--muted)] mb-6">This password reset link is invalid or has expired.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        )}

        {(!resetToken || (resetToken && tokenValid)) && !
          verifyingToken && (
        <div className="p-10 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl mb-8">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
            <FaLock className="text-[var(--gold)] text-2xl" />
            {resetToken ? "Set New Password" : "Set Password"}
          </h2>
          <p className="text-[var(--muted)] mb-8 leading-relaxed">
            {resetToken 
              ? "Choose a new password for your account." 
              : "Set a password to enable sign-in without magic links."}
          </p>

          <form onSubmit={handleSetPassword} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text)]">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--text)]">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--pink)]/70 text-[var(--pink)] rounded-xl text-sm font-medium leading-relaxed">
                {error}
              </div>
            )}

            {success && (
              <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--gold)]/70 text-[var(--gold)] rounded-xl text-sm font-medium leading-relaxed flex items-center gap-2">
                <FaCheck /> Password set successfully! {resetToken ? "Redirecting to login..." : "Redirecting to dashboard..."}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full text-lg font-bold"
            >
              {loading ? "Setting Password..." : "Set Password"}
            </Button>
          </form>
        </div>
        )}

        {/* Back to Dashboard */}
        {!resetToken && (
          <div className="text-center">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)] flex items-center justify-center"><div className="text-[var(--muted)]">Loading...</div></div>}>
      <SettingsContent />
    </Suspense>
  );
}
