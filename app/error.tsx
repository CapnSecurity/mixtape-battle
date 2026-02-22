'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details for debugging
    console.error('Application error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.digest) {
      console.error('Error digest:', error.digest);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-[var(--text)] mb-4">Oops!</h1>
        <p className="text-xl text-[var(--muted)] mb-8">Something went wrong</p>
        
        {/* Show error details for debugging */}
        {error.message && (
          <div className="mb-6 p-4 bg-[var(--surface)] rounded-lg text-left">
            <div className="text-sm font-mono text-red-400 mb-2">Error Message:</div>
            <div className="text-xs font-mono text-[var(--muted)] whitespace-pre-wrap break-all">
              {error.message}
            </div>
          </div>
        )}
        
        <button
          onClick={reset}
          className="px-6 py-3 bg-[var(--gold)] text-[var(--bg)] rounded-lg font-semibold hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
