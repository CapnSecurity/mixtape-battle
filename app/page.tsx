import Link from "next/link";
import Button from "@/src/components/ui/Button";

export default async function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Hero Section */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-[var(--text)] mb-4">
              Mixtape
            </h1>
            <p className="text-2xl text-[var(--muted)] mb-2">
              Collaborate. Learn. Perform.
            </p>
            <p className="text-lg text-[var(--muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
              Everything your band needs in one place: the song library, setlists and practice tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/songs">Browse Songs</Link>
              </Button>
              <Button asChild variant="surface">
                <Link href="/setlist">View Setlist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-24 px-4 md:px-8 bg-[var(--surface)]/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-[var(--ring)]/15 bg-[var(--surface)]/70">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Learn</h3>
              <p className="text-[var(--muted)]">
                Guitar tabs, bass tabs, lyrics, and videos for every song.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[var(--ring)]/15 bg-[var(--surface)]/70">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Setlist</h3>
              <p className="text-[var(--muted)]">
                Build and order the setlist, with notes for each song.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[var(--ring)]/15 bg-[var(--surface)]/70">
              <div className="text-4xl mb-4">🪵</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Practice</h3>
              <p className="text-[var(--muted)]">
                Track readiness and practice progress for every member.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
