'use client';

import { useSession } from 'next-auth/react';
import { useCsrfToken } from '@/lib/use-csrf';
import { useState, useEffect } from 'react';
import Button from '@/src/components/ui/Button';

interface SetlistButtonProps {
  songId: number;
  variant?: 'button' | 'icon';
}

export function SetlistButton({ songId, variant = 'button' }: SetlistButtonProps) {
  const { data: session } = useSession();
  const { token: csrfToken } = useCsrfToken();
  const [isInSetlist, setIsInSetlist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if song is in setlist on mount
  useEffect(() => {
    async function checkSetlist() {
      try {
        const res = await fetch('/api/setlist');
        if (res.ok) {
          const data = await res.json();
          const entries = data.entries || [];
          const inSetlist = entries.some((entry: any) => entry.songId === songId);
          setIsInSetlist(inSetlist);
        }
      } catch (error) {
        console.error('Error checking setlist:', error);
      } finally {
        setChecking(false);
      }
    }
    checkSetlist();
  }, [songId]);

  const handleToggleSetlist = async () => {
    if (!csrfToken) return;
    
    setIsLoading(true);
    try {
      const endpoint = isInSetlist ? '/api/setlist/remove' : '/api/setlist/add';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ songId }),
      });

      if (res.ok) {
        setIsInSetlist(!isInSetlist);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update setlist');
      }
    } catch (error) {
      console.error('Error updating setlist:', error);
      alert('Failed to update setlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for admins
  if (!(session?.user as any)?.isAdmin) {
    return null;
  }

  if (checking) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggleSetlist}
        disabled={isLoading}
        className={`text-2xl transition ${
          isInSetlist ? 'opacity-100' : 'opacity-30 hover:opacity-60'
        }`}
        title={isInSetlist ? 'Remove from setlist' : 'Add to setlist'}
      >
        {isLoading ? '⏳' : '📋'}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggleSetlist}
      disabled={isLoading}
      variant={isInSetlist ? 'surface' : 'primary'}
      size="md"
    >
      {isLoading ? '...' : isInSetlist ? 'Remove from Setlist' : 'Add to Setlist'}
    </Button>
  );
}
