import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { songsterr, ultimateGuitar, youtube, lyrics } from "../../lib/links";
import Button from "@/src/components/ui/Button";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="min-h-screen bg-[var(--bg)] py-16 px-4 text-[var(--text)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-6xl font-bold text-[var(--text)] mb-4">Song Library</h1>
          <p className="text-xl text-[var(--muted)]">
            {songs.length} songs to learn and battle
          </p>
        </div>

        {/* Songs Grid - Large Tiles */}
        {songs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {songs.map((song) => (
              <div key={song.id} className="flex flex-col">
                {/* Main Song Tile */}
                <div className="bg-[var(--surface)] border border-[var(--ring)]/20 rounded-2xl p-8 mb-4 hover:bg-[var(--surface2)] transition-all duration-300 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                      {song.title}
                    </h3>
                    <p className="text-lg text-[var(--muted)] mb-6">
                      {song.artist}
                    </p>
                  </div>
                  
                  <div className="bg-[var(--surface2)] rounded-xl p-4">
                    <p className="text-sm text-[var(--muted)] mb-1">Battle Score</p>
                    <p className="text-4xl font-bold text-[var(--text)]">
                      {Math.round(song.elo)}
                    </p>
                  </div>
                </div>

                {/* Resource Buttons Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={songsterr(song.artist, song.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-4 px-4 rounded-xl text-center transition-colors text-sm border border-[var(--ring)]/20"
                  >
                    🎸<br />Guitar
                  </a>

                  <a
                    href={`https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(song.artist + " " + song.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-4 px-4 rounded-xl text-center transition-colors text-sm border border-[var(--ring)]/20"
                  >
                    🎜<br />Bass
                  </a>

                  <a
                    href={lyrics(song.artist, song.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-4 px-4 rounded-xl text-center transition-colors text-sm border border-[var(--ring)]/20"
                  >
                    📝<br />Lyrics
                  </a>
                  <a
                    href={youtube(song.artist, song.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] font-bold py-4 px-4 rounded-xl text-center transition-colors text-sm border border-[var(--ring)]/20"
                  >
                    ▶️<br />Video
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[var(--ring)]/20 rounded-2xl p-12 text-center bg-[var(--surface)]/70">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
              No Songs Yet
            </h2>
            <p className="text-[var(--muted)] text-lg">
              Add your first songs to get started with battling!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <Button asChild>
            <Link href="/battle">Start Battle ⚔️</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
