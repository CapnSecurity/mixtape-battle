'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/src/components/ui/Button';
import { useCsrfToken, withCsrfToken } from '@/lib/use-csrf';
import ReadinessIcon from '@/src/components/ReadinessIcon';

type Song = {
  id: number;
  title: string;
  artist: string;
  albumArtUrl?: string | null;
  readiness?: Array<{ status: string }>;
};

type SetlistEntry = {
  id: number;
  songId: number;
  position: number;
  notes: string | null;
  addedAt: string;
  addedBy: string;
  song: Song;
};

export default function SetlistPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.isAdmin;
  const { token: csrfToken } = useCsrfToken();

  const [entries, setEntries] = useState<SetlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetchSetlist();
  }, []);

  async function fetchSetlist() {
    try {
      const res = await fetch('/api/setlist');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Failed to fetch setlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromSetlist(songId: number) {
    if (!confirm('Remove this song from the setlist?')) return;
    if (!csrfToken) return;

    try {
      const res = await fetch(
        '/api/setlist/remove',
        withCsrfToken(csrfToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId }),
        })
      );

      if (res.ok) {
        fetchSetlist();
      } else {
        alert('Failed to remove from setlist');
      }
    } catch (error) {
      console.error('Failed to remove:', error);
      alert('Failed to remove from setlist');
    }
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newEntries = [...entries];
    const draggedEntry = newEntries[draggedIndex];
    newEntries.splice(draggedIndex, 1);
    newEntries.splice(index, 0, draggedEntry);

    setEntries(newEntries);
    setDraggedIndex(index);
  }

  async function handleDragEnd() {
    if (!csrfToken) return;
    
    // Update positions on server
    const order = entries.map((entry, index) => ({
      songId: entry.songId,
      position: index + 1,
    }));

    try {
      const res = await fetch(
        '/api/setlist/reorder',
        withCsrfToken(csrfToken, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order }),
        })
      );

      if (res.ok) {
        fetchSetlist(); // Refresh to get updated positions
      } else {
        alert('Failed to reorder');
        fetchSetlist(); // Reset to server state
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
      fetchSetlist(); // Reset to server state
    }

    setDraggedIndex(null);
  }

  async function saveNotes(entryId: number, notes: string) {
    if (!csrfToken) return;

    try {
      const res = await fetch(
        `/api/setlist/${entryId}`,
        withCsrfToken(csrfToken, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: notes.trim() || null }),
        })
      );

      if (res.ok) {
        // Update local state
        setEntries(prev => prev.map(e => 
          e.id === entryId ? { ...e, notes: notes.trim() || null } : e
        ));
        // Clear editing state
        setEditingNotes(prev => {
          const next = { ...prev };
          delete next[entryId];
          return next;
        });
      } else {
        alert('Failed to save notes');
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes');
    }
  }

  function getAggregateReadiness(readiness: Array<{ status: string }>) {
    if (!readiness || readiness.length === 0) return 'NONE';
    
    const hasNotReady = readiness.some(r => r.status === 'NOT_READY');
    const hasNeedsWork = readiness.some(r => r.status === 'NEEDS_WORK');
    const hasSolid = readiness.some(r => r.status === 'SOLID');
    
    if (hasNotReady) return 'NOT_READY';
    if (hasNeedsWork) return 'NEEDS_WORK';
    if (hasSolid) return 'SOLID';
    return 'NONE';
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-[var(--muted)]">Loading setlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-2">Setlist</h1>
        <p className="text-[var(--muted)]">
          {entries.length === 0
            ? 'No songs in the setlist yet.'
            : `${entries.length} ${entries.length === 1 ? 'song' : 'songs'} in the setlist`}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">The setlist is empty</p>
          {isAdmin && (
            <p className="text-sm text-[var(--muted)]">
              Visit any song page and click "Add to Setlist" to get started
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              draggable={isAdmin}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                flex items-center gap-4 p-4 rounded-xl
                border border-[var(--ring)]/20 bg-[var(--surface)]/80
                ${isAdmin ? 'cursor-move hover:bg-[var(--surface)]' : ''}
                ${draggedIndex === index ? 'opacity-50' : ''}
              `}
            >
              {/* Position Number */}
              <div className="flex-shrink-0 w-8 text-center">
                <span className="text-xl font-bold text-[var(--gold)]">
                  {entry.position}
                </span>
              </div>

              {/* Album Art */}
              {entry.song.albumArtUrl && (
                <img
                  src={entry.song.albumArtUrl}
                  alt={`${entry.song.title} album art`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}

              {/* Song Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/songs/${entry.songId}`}
                    className="text-lg font-semibold text-[var(--text)] hover:text-[var(--gold)] transition-colors"
                  >
                    {entry.song.title}
                  </Link>
                  {entry.song.readiness && entry.song.readiness.length > 0 && (
                    <ReadinessIcon status={getAggregateReadiness(entry.song.readiness)} size="sm" />
                  )}
                </div>
                <p className="text-sm text-[var(--muted)]">{entry.song.artist}</p>
                
                {/* Notes Section */}
                {editingNotes[entry.id] !== undefined ? (
                  // Editing mode
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={editingNotes[entry.id]}
                      onChange={(e) => setEditingNotes(prev => ({ ...prev, [entry.id]: e.target.value }))}
                      placeholder="e.g., Opening song, Encore, Guitar solo..."
                      className="w-full px-3 py-1.5 text-sm bg-[var(--bg)] border border-[var(--ring)]/20 rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveNotes(entry.id, editingNotes[entry.id])}
                        className="px-3 py-1 text-xs bg-[var(--gold)] text-[var(--bg)] rounded-lg hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotes(prev => {
                          const next = { ...prev };
                          delete next[entry.id];
                          return next;
                        })}
                        className="px-3 py-1 text-xs bg-[var(--surface2)] text-[var(--text)] rounded-lg hover:bg-[var(--surface)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="mt-1">
                    {entry.notes ? (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[var(--muted)] italic">
                          💭 {entry.notes}
                        </p>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingNotes(prev => ({ ...prev, [entry.id]: entry.notes || '' }))}
                            className="text-xs text-[var(--muted)] hover:text-[var(--text)]"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    ) : isAdmin ? (
                      <button
                        onClick={() => setEditingNotes(prev => ({ ...prev, [entry.id]: '' }))}
                        className="text-xs text-[var(--muted)] hover:text-[var(--text)] italic"
                      >
                        + Add notes
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => removeFromSetlist(entry.songId)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Back Link */}
      <div className="mt-8 text-center">
        <Link
          href="/songs"
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Back to Song Library
        </Link>
      </div>
    </div>
  );
}
