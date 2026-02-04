import Link from "next/link";
import { prisma } from "../../lib/prisma";

export default async function ResultsPage() {
  const top = await prisma.song.findMany({ orderBy: { elo: "desc" }, take: 20 });

  return (
    <main style={{ padding: 20 }}>
      <h1>Results</h1>
      <ol>
        {top.map((s) => (
          <li key={s.id}>
            <Link href={`/songs/${s.id}`}>{s.title} — {s.artist}</Link> (Elo {Math.round(s.elo)})
          </li>
        ))}
      </ol>
    </main>
  );
}
