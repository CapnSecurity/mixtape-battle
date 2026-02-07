import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { songsterrBass, ultimateGuitarGuitar, ultimateGuitarBass, youtube, lyrics, spotify, genius, wikipedia, allMusic } from "../../../lib/links";
import Button from "@/src/components/ui/Button";

type Params = Promise<{ id: string }>;

export default async function SongPage({ params }: { params: Params }) {
  const { id } = await params;
  const songId = Number(id);
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song)
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)] text-[var(--text)]">
        <div className="bg-[var(--surface)] rounded-2xl shadow-[var(--shadow)] p-8 text-center max-w-md border border-[var(--ring)]/20">
          <div className="text-5xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
            Song Not Found
          </h1>
          <p className="text-[var(--muted)] mb-6">
            We couldn't find this song. Please go back and try again.
          </p>
          <Button asChild>
            <Link href="/songs/browser">Back to Songs</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/songs/browser"
          className="inline-block text-[var(--muted)] hover:text-[var(--text)] transition mb-8"
        >
          ← Back to Songs
        </Link>

        {/* Song Card */}
        <div className="bg-[linear-gradient(135deg,var(--gold),var(--pink))] rounded-2xl shadow-[var(--shadow)] p-8 mb-8">
          <div className="text-7xl mb-6 text-center">🎶</div>
          <h1 className="text-4xl font-bold text-[var(--bg)] mb-2 text-center">
            {song.title}
          </h1>
          <p className="text-xl text-[var(--bg)]/80 text-center mb-6">
            {song.artist}
          </p>

          <div className="bg-[var(--bg)]/20 rounded-xl p-6 text-center">
            <div className="text-sm text-[var(--bg)]/80 mb-2">Battle Score</div>
            <div className="text-5xl font-bold text-[var(--bg)]">
              {Math.round(song.elo)}
            </div>
          </div>
        </div>

        {/* Resource Links */}
        <div className="bg-[var(--surface)] rounded-2xl shadow-[var(--shadow)] p-8 border border-[var(--ring)]/20">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
            Learn This Song
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Guitar Tabs */}
            <a
              href={song.ultimateGuitar || ultimateGuitarGuitar(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">🎸</span>
              <div>
                <div className="font-bold text-[var(--text)]">Guitar Tabs</div>
                <div className="text-sm text-[var(--muted)]">Ultimate Guitar</div>
              </div>
            </a>

            {/* Bass Tabs */}
            <a
              href={song.songsterr || songsterrBass(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">🎸</span>
              <div>
                <div className="font-bold text-[var(--text)]">Bass Tabs</div>
                <div className="text-sm text-[var(--muted)]">Songsterr</div>
              </div>
            </a>

            {/* Lyrics (Genius) */}
            <a
              href={song.lyrics || genius(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-bold text-[var(--text)]">Lyrics</div>
                <div className="text-sm text-[var(--muted)]">Genius Lyrics</div>
              </div>
            </a>

            {/* YouTube */}
            <a
              href={song.youtube || youtube(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">▶️</span>
              <div>
                <div className="font-bold text-[var(--text)]">YouTube</div>
                <div className="text-sm text-[var(--muted)]">Watch performances</div>
              </div>
            </a>

            {/* Spotify */}
            <a
              href={spotify(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">🎧</span>
              <div>
                <div className="font-bold text-[var(--text)]">Spotify</div>
                <div className="text-sm text-[var(--muted)]">Listen on Spotify</div>
              </div>
            </a>

            {/* Wikipedia */}
            <a
              href={wikipedia(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-bold text-[var(--text)]">Wikipedia</div>
                <div className="text-sm text-[var(--muted)]">Artist or Song Info</div>
              </div>
            </a>

            {/* AllMusic */}
            <a
              href={allMusic(song.artist, song.album)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border border-[var(--ring)]/20 rounded-xl hover:bg-[var(--surface2)] transition min-h-[84px]"
            >
              <span className="text-2xl">💿</span>
              <div>
                <div className="font-bold text-[var(--text)]">AllMusic</div>
                <div className="text-sm text-[var(--muted)]">Album & Artist Info</div>
              </div>
            </a>
          </div>
        </div>

        {/* Battle Button */}
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/battle">Battle This Song ⚔️</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
