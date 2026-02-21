'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCsrfToken } from '@/lib/use-csrf';
import Button from '@/src/components/ui/Button';

interface EditSongButtonProps {
  song: {
    id: number;
    title: string;
    artist: string;
    album?: string | null;
    releaseDate?: number | null;
    genre?: string | null;
  };
  onUpdate?: () => void;
}

export function EditSongButton({ song, onUpdate }: EditSongButtonProps) {
  const { data: session } = useSession();
  const { token: csrfToken } = useCsrfToken();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: song.title,
    artist: song.artist,
    album: song.album || '',
    releaseDate: song.releaseDate?.toString() || '',
    genre: song.genre || '',
  });

  // Only show for admins
  if (!(session?.user as any)?.isAdmin) {
    return null;
  }

  const handleSave = async () => {
    if (!csrfToken) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/songs/${song.id}/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist,
          album: formData.album || null,
          releaseDate: formData.releaseDate || null,
          genre: formData.genre || null,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        if (onUpdate) {
          onUpdate();
        } else {
          // Refresh the page if no callback provided
          window.location.reload();
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update song');
      }
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Button
        onClick={() => setIsEditing(true)}
        variant="surface"
        size="md"
      >
        ✏️ Edit Song
      </Button>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl shadow-[var(--shadow)] p-6 border border-[var(--ring)]/20">
      <h3 className="text-lg font-bold text-[var(--text)] mb-4">Edit Song Details</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Artist *
          </label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1">
            Album
          </label>
          <input
            type="text"
            value={formData.album}
            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Year
            </label>
            <input
              type="number"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="e.g. 1985"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1">
              Genre
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="e.g. Rock"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.title || !formData.artist}
            variant="primary"
            size="md"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                title: song.title,
                artist: song.artist,
                album: song.album || '',
                releaseDate: song.releaseDate?.toString() || '',
                genre: song.genre || '',
              });
            }}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
