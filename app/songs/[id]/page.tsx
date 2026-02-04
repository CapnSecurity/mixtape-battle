import { prisma } from "../../../../lib/prisma";
import { songsterr, ultimateGuitar, youtube, lyrics } from "../../../../lib/links";

type Params = { params: { id: string } };

export default async function SongPage({ params }: Params) {
  const id = Number(params.id);
  const song = await prisma.song.findUnique({ where: { id } });
  if (!song) return <main style={{ padding: 20 }}>Song not found</main>;

  return (
    <main style={{ padding: 20 }}>
      <h1>{song.title}</h1>
      <p>{song.artist}</p>
      <p>Elo: {Math.round(song.elo)}</p>
      <ul>
        <li>
          <a href={songsterr(song.artist, song.title)} target="_blank" rel="noreferrer">Songsterr</a>
        </li>
        <li>
          <a href={ultimateGuitar(song.artist, song.title)} target="_blank" rel="noreferrer">Ultimate Guitar</a>
        </li>
        <li>
          <a href={lyrics(song.artist, song.title)} target="_blank" rel="noreferrer">Lyrics / Search</a>
        </li>
        <li>
          <a href={youtube(song.artist, song.title)} target="_blank" rel="noreferrer">YouTube</a>
        </li>
      </ul>
    </main>
  );
}
