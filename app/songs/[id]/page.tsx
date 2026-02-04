import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { songsterr, ultimateGuitar, youtube, lyrics } from "../../../lib/links";

type Params = Promise<{ id: string }>;

export default async function SongPage({ params }: { params: Params }) {
  const { id } = await params;
  const songId = Number(id);
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Song Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find this song. Please go back and try again.
          </p>
          <Link
            href="/songs"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Back to Songs
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/songs"
          className="inline-block text-gray-300 hover:text-white transition mb-8"
        >
          ← Back to Songs
        </Link>

        {/* Song Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl p-8 mb-8">
          <div className="text-7xl mb-6 text-center">🎶</div>
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            {song.title}
          </h1>
          <p className="text-xl text-purple-100 text-center mb-6">
            {song.artist}
          </p>

          <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
            <div className="text-sm text-purple-100 mb-2">Battle Score</div>
            <div className="text-5xl font-bold text-white">
              {Math.round(song.elo)}
            </div>
          </div>
        </div>

        {/* Resource Links */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Learn This Song
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={songsterr(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition"
            >
              <span className="text-2xl">🎸</span>
              <div>
                <div className="font-bold text-gray-900">Songsterr</div>
                <div className="text-sm text-gray-600">Interactive tabs</div>
              </div>
            </a>

            <a
              href={ultimateGuitar(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border-2 border-pink-200 rounded-lg hover:bg-pink-50 transition"
            >
              <span className="text-2xl">🎼</span>
              <div>
                <div className="font-bold text-gray-900">Ultimate Guitar</div>
                <div className="text-sm text-gray-600">Tabs & chords</div>
              </div>
            </a>

            <a
              href={lyrics(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition"
            >
              <span className="text-2xl">📝</span>
              <div>
                <div className="font-bold text-gray-900">Lyrics</div>
                <div className="text-sm text-gray-600">Song lyrics & meanings</div>
              </div>
            </a>

            <a
              href={youtube(song.artist, song.title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <span className="text-2xl">▶️</span>
              <div>
                <div className="font-bold text-gray-900">YouTube</div>
                <div className="text-sm text-gray-600">Watch performances</div>
              </div>
            </a>
          </div>
        </div>

        {/* Battle Button */}
        <div className="mt-8 text-center">
          <Link
            href="/battle"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Battle This Song ⚔️
          </Link>
        </div>
      </div>
    </div>
  );
}
