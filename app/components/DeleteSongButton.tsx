'use client';

import { useSession } from 'next-auth/react';
import { useCsrfToken } from '@/lib/use-csrf';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/src/components/ui/Button';

interface DeleteSongButtonProps {
  songId: number;
  songTitle: string;
  songArtist: string;
  variant?: 'button' | 'icon';
  redirectAfterDelete?: string;
}

export function DeleteSongButton({ 
  songId, 
  songTitle, 
  songArtist, 
  variant = 'button',
  redirectAfterDelete = '/songs'
}: DeleteSongButtonProps) {
  const { data: session } = useSession();
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${songTitle}" by ${songArtist}? This cannot be undone.`)) {
      return;
    }

    if (!csrfToken) {
      alert('Security token not available. Please refresh the page and try again.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/songs/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ songId }),
      });

      if (res.ok) {
        alert(`Successfully deleted "${songTitle}" by ${songArtist}`);
        router.push(redirectAfterDelete);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete song');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song');
      setIsDeleting(false);
    }
  };

  // Only show for root account
  if (session?.user?.email !== 'tim@levesques.net') {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting || csrfLoading || !csrfToken}
        className="text-2xl transition hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed"
        title={
          csrfLoading ? 'Loading...' : 
          !csrfToken ? 'Security token unavailable' :
          isDeleting ? 'Deleting...' :
          'Delete this song'
        }
      >
        {isDeleting ? '⏳' : '🗑️'}
      </button>
    );
  }

  return (
    <Button
      onClick={handleDelete}
      disabled={isDeleting || csrfLoading || !csrfToken}
      variant="destructive"
      size="sm"
    >
      {csrfLoading ? 'Loading...' : 
       isDeleting ? 'Deleting...' : 
       '🗑️ Delete Song'}
    </Button>
  );
}
