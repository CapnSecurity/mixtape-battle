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
              Collaborate. Battle. Choose.
            </p>
            <p className="text-lg text-[var(--muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
              Vote on submitted songs and help the band decide which tracks make the setlist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/songs/browser">Browse Songs</Link>
              </Button>
              <Button asChild>
                <Link href="/battle">Start Battling</Link>
              </Button>
              <Button asChild variant="surface">
                <Link href="/results">View Rankings</Link>
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
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Battle</h3>
              <p className="text-[var(--muted)]">
                Vote on pairs of songs. Simple head-to-head matchups.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[var(--ring)]/15 bg-[var(--surface)]/70">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Learn</h3>
              <p className="text-[var(--muted)]">
                Guitar tabs, bass tabs, lyrics, and videos for every song.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-[var(--ring)]/15 bg-[var(--surface)]/70">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">Rank</h3>
              <p className="text-[var(--muted)]">
                Watch songs climb the rankings based on votes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
