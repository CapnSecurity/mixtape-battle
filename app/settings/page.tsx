"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { FaLock, FaCheck, FaCog, FaMusic } from "react-icons/fa";
import { useCsrfToken, withCsrfToken } from "@/lib/use-csrf";

type Preferences = {
  genres: string[];
  decades: number[];
  artists: string[];
};

function SettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  // Redirect to login if not authenticated and no reset token
  useEffect(() => {
    if (status !== "loading" && !session && !resetToken) {
      router.push("/login");
    }
  }, [status, session, resetToken, router]);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState("");
  const { token: csrfToken } = useCsrfToken();

  // Username state
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  // Battle preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    genres: [],
    decades: [],
    artists: [],
  });
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefError, setPrefError] = useState("");
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableArtists, setAvailableArtists] = useState<string[]>([]);

  useEffect(() => {
    if (resetToken) {
      verifyResetToken();
    }
  }, [resetToken]);

  useEffect(() => {
    if (session && !resetToken) {
      loadPreferences();
      loadAvailableOptions();
      setUsername(session.user?.name || "");
    }
  }, [session, resetToken]);

  async function loadPreferences() {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }

  async function loadAvailableOptions() {
    try {
      const res = await fetch('/api/songs');
      if (res.ok) {
        const songs = await res.json();
        const genres = [...new Set(songs.filter((s: any) => s.genre).map((s: any) => s.genre))].sort() as string[];
        const artists = [...new Set(songs.map((s: any) => s.artist))].sort() as string[];
        
        setAvailableGenres(genres);
        setAvailableArtists(artists);
      }
    } catch (err) {
      console.error('Failed to load available options:', err);
    }
  }

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

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      };

      const res = await fetch(
        "/api/auth/set-password",
        csrfToken ? withCsrfToken(csrfToken, options) : options
      );

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

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    setUsernameSuccess(false);

    if (username.length > 8) {
      setUsernameError("Username must be 8 characters or less");
      return;
    }

    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError("Username can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    setUsernameLoading(true);
    try {
      const res = await fetch(
        "/api/auth/update-username",
        withCsrfToken(csrfToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim() }),
        })
      );

      if (!res.ok) {
        const data = await res.json();
        setUsernameError(data.error || "Failed to update username");
        return;
      }

      setUsernameSuccess(true);
      setTimeout(() => setUsernameSuccess(false), 3000);
      
      // Refresh session to update displayed name
      window.location.reload();
    } catch (err) {
      setUsernameError("An unexpected error occurred");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefError("");
    setPrefSuccess(false);
    setPrefLoading(true);

    try {
      const res = await fetch(
        "/api/preferences",
        withCsrfToken(csrfToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        })
      );

      if (!res.ok) {
        const data = await res.json();
        setPrefError(data.error || "Failed to save preferences");
        return;
      }

      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (err) {
      setPrefError("An unexpected error occurred");
    } finally {
      setPrefLoading(false);
    }
  };

  const updatePreferences = (key: keyof Preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (array: any[], item: any) => {
    return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
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

        {/* Username - Only show when logged in and not resetting password */}
        {!resetToken && session && (
          <div className="p-10 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl mb-8">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
              <FaCog className="text-[var(--gold)] text-2xl" />
              Display Name
            </h2>
            <p className="text-[var(--muted)] mb-8 leading-relaxed">
              Set a custom username to display instead of your email. Maximum 8 characters.
            </p>

            <form onSubmit={handleUpdateUsername} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="username" className="block text-sm font-semibold text-[var(--text)]">
                  Username (max 8 characters)
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., rocker42"
                  maxLength={8}
                />
                <p className="text-xs text-[var(--muted)]">
                  {username.length}/8 characters • Letters, numbers, hyphens, and underscores only
                </p>
              </div>

              {usernameError && (
                <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--pink)]/70 text-[var(--pink)] rounded-xl text-sm font-medium leading-relaxed">
                  {usernameError}
                </div>
              )}

              {usernameSuccess && (
                <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--gold)]/70 text-[var(--gold)] rounded-xl text-sm font-medium leading-relaxed flex items-center gap-2">
                  <FaCheck /> Username updated successfully!
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={usernameLoading}
                className="w-full text-lg font-bold"
              >
                {usernameLoading ? "Updating..." : "Update Username"}
              </Button>
            </form>
          </div>
        )}

        {/* Battle Preferences - Only show when logged in and not resetting password */}
        {!resetToken && session && (
          <div className="p-10 rounded-3xl border border-[var(--ring)]/30 bg-[var(--surface)]/90 shadow-[var(--shadow)] backdrop-blur-xl mb-8">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4 flex items-center gap-3">
              <FaMusic className="text-[var(--gold)] text-2xl" />
              Battle Preferences
            </h2>
            <p className="text-[var(--muted)] mb-8 leading-relaxed">
              Customize your battle experience by selecting your preferred genres, decades, and artists.
              Songs matching your preferences will appear more often in battles.
            </p>

            <form onSubmit={handleSavePreferences} className="space-y-8">
              {/* Genres */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--text)]">
                  Preferred Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => updatePreferences('genres', toggleArrayItem(preferences.genres, genre))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        preferences.genres.includes(genre)
                          ? 'bg-[var(--gold)] text-[var(--bg)]'
                          : 'bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decades */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--text)]">
                  Preferred Decades
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1960, 1970, 1980, 1990, 2000, 2010, 2020].map(decade => (
                    <button
                      key={decade}
                      type="button"
                      onClick={() => updatePreferences('decades', toggleArrayItem(preferences.decades, decade))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        preferences.decades.includes(decade)
                          ? 'bg-[var(--gold)] text-[var(--bg)]'
                          : 'bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {decade}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Artists */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--text)]">
                  Preferred Artists
                </label>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border border-[var(--ring)]/20 rounded-lg p-3">
                  {availableArtists.map(artist => (
                    <button
                      key={artist}
                      type="button"
                      onClick={() => updatePreferences('artists', toggleArrayItem(preferences.artists, artist))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        preferences.artists.includes(artist)
                          ? 'bg-[var(--gold)] text-[var(--bg)]'
                          : 'bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              </div>

              {prefError && (
                <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--pink)]/70 text-[var(--pink)] rounded-xl text-sm font-medium leading-relaxed">
                  {prefError}
                </div>
              )}

              {prefSuccess && (
                <div className="p-5 bg-[var(--surface2)] border-2 border-[var(--gold)]/70 text-[var(--gold)] rounded-xl text-sm font-medium leading-relaxed flex items-center gap-2">
                  <FaCheck /> Preferences saved successfully!
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={prefLoading}
                className="w-full text-lg font-bold"
              >
                {prefLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </form>
          </div>
        )}

        {/* Set Password - Show for reset token OR logged in users */}
        {(!resetToken || (resetToken && tokenValid)) && !verifyingToken && (
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
