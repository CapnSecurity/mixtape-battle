export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text)] mb-4">404</h1>
        <p className="text-xl text-[var(--muted)] mb-8">Page not found</p>
        <a
          href="/"
          className="px-6 py-3 bg-[var(--gold)] text-[var(--bg)] rounded-lg font-semibold hover:opacity-90 transition inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
