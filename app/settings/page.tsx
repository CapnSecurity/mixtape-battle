"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { FaLock, FaCheck } from "react-icons/fa";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to set password");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
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
          <h1 className="text-5xl font-bold text-[var(--text)] mb-3">Account Settings</h1>
          <p className="text-[var(--muted)] text-lg">
            {session?.user?.email}
          </p>
        </div>

        {/* Set Password Card */}
        <div className="p-10 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl mb-8">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
            <FaLock className="text-[var(--gold)] text-2xl" />
            Set Password
          </h2>
          <p className="text-[var(--muted)] mb-8 leading-relaxed">
            Set a password to enable sign-in without magic links.
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
                <FaCheck /> Password set successfully! Redirecting to dashboard...
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

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
