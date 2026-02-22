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
  const { token: csrfToken, loading: csrfLoading } = useCsrfToken();
  const [isInSetlist, setIsInSetlist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('[SetlistButton] CSRF token status:', { 
      hasToken: !!csrfToken, 
      loading: csrfLoading,
      isAdmin: !!(session?.user as any)?.isAdmin 
    });
  }, [csrfToken, csrfLoading, session]);

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
    if (!csrfToken) {
      console.error('No CSRF token available');
      alert('Security token not available. Please refresh the page and try again.');
      return;
    }
    
    setIsLoading(true);
    try {
      const endpoint = isInSetlist ? '/api/setlist/remove' : '/api/setlist/add';
      console.log(`[SetlistButton] ${isInSetlist ? 'Removing' : 'Adding'} song ${songId}`);
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ songId }),
      });

      if (res.ok) {
        console.log(`[SetlistButton] Successfully ${isInSetlist ? 'removed' : 'added'} song ${songId}`);
        setIsInSetlist(!isInSetlist);
      } else {
        const data = await res.json();
        console.error('[SetlistButton] Error response:', data);
        alert(data.error || 'Failed to update setlist');
      }
    } catch (error) {
      console.error('[SetlistButton] Error updating setlist:', error);
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
        disabled={isLoading || csrfLoading || !csrfToken}
        className={`text-2xl transition ${
          isInSetlist ? 'opacity-100' : 'opacity-30 hover:opacity-60'
        } ${(isLoading || csrfLoading || !csrfToken) ? 'cursor-not-allowed opacity-50' : ''}`}
        title={
          csrfLoading ? 'Loading...' : 
          !csrfToken ? 'Security token unavailable' :
          isInSetlist ? 'Remove from setlist' : 'Add to setlist'
        }
      >
        {isLoading ? '⏳' : '📋'}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggleSetlist}
      disabled={isLoading || csrfLoading || !csrfToken}
      variant={isInSetlist ? 'surface' : 'primary'}
      size="md"
    >
      {csrfLoading ? 'Loading...' : 
       isLoading ? '...' : 
       isInSetlist ? 'Remove from Setlist' : 'Add to Setlist'}
    </Button>
  );
}
