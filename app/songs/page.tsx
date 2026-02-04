import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({ orderBy: { title: "asc" } });

  return (
    <main style={{ padding: 20 }}>
      <h1>Songs</h1>
      <ul>
        {songs.map((s) => (
          <li key={s.id}>
            <Link href={`/songs/${s.id}`}>{s.title} — {s.artist}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
