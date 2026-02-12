'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text)] mb-4">Oops!</h1>
        <p className="text-xl text-[var(--muted)] mb-8">Something went wrong</p>
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
