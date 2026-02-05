"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Link from 'next/link';

export default function AddSongPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    artist: '',
    title: '',
    album: '',
    releaseDate: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    try {
      const res = await fetch('/api/songs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setForm({ artist: '', title: '', album: '', releaseDate: '' });
        setTimeout(() => {
          router.push(`/songs/browser?songId=${data.song.id}`);
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to add song');
      }
    } catch (error) {
      console.error('Error adding song:', error);
      setStatus('error');
      setErrorMsg('An error occurred while adding the song');
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/songs/browser"
          className="inline-block text-[var(--muted)] hover:text-[var(--text)] transition mb-8"
        >
          ← Back to Song Library
        </Link>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--ring)]/20 shadow-[var(--shadow)] p-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text)]">Add New Song</h1>
          <p className="text-[var(--muted)] mb-8">
            Enter the artist and song title. We'll automatically fetch album and release year from MusicBrainz, and generate resource links for tabs, lyrics, and videos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Artist */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Artist <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                name="artist"
                required
                placeholder="e.g., Tom Petty and the Heartbreakers"
                value={form.artist}
                onChange={handleChange}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Song Title <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                name="title"
                required
                placeholder="e.g., Breakdown"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* Album (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Album <span className="text-[var(--muted)] text-xs">(auto-filled if found)</span>
              </label>
              <Input
                type="text"
                name="album"
                placeholder="Leave blank to auto-fetch from MusicBrainz"
                value={form.album}
                onChange={handleChange}
              />
            </div>

            {/* Release Date (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Release Year <span className="text-[var(--muted)] text-xs">(auto-filled if found)</span>
              </label>
              <Input
                type="number"
                name="releaseDate"
                placeholder="Leave blank to auto-fetch from MusicBrainz"
                min="1900"
                max="2100"
                value={form.releaseDate}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={status === 'saving'}
              >
                {status === 'saving' ? 'Adding Song...' : 'Add Song'}
              </Button>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-center">
                ✅ Song added successfully! Redirecting to song page...
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
                ❌ {errorMsg}
              </div>
            )}
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-lg bg-[var(--surface2)] border border-[var(--ring)]/10">
            <h3 className="text-sm font-bold text-[var(--text)] mb-2">🎵 What Gets Auto-Generated</h3>
            <div className="text-xs text-[var(--muted)] space-y-3">
              <div>
                <strong className="text-[var(--text)]">Metadata (from MusicBrainz):</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Album name</li>
                  <li>• Release year</li>
                </ul>
              </div>
              <div>
                <strong className="text-[var(--text)]">Resource Links:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Guitar tabs (Ultimate Guitar)</li>
                  <li>• Bass tabs (Songsterr)</li>
                  <li>• Lyrics (Google search)</li>
                  <li>• YouTube Music videos</li>
                </ul>
              </div>
              <p className="text-[var(--muted)] italic">
                You can manually override any field or update links later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
