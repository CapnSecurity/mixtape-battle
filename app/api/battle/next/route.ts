import { prisma } from "../../../../lib/prisma";

export async function GET() {
  // Return two random songs biased by similar elo (simple approach)
  const songs = await prisma.song.findMany({ take: 50, orderBy: { elo: "desc" } });
  if (songs.length < 2) return new Response(null, { status: 204 });

  // pick a random pivot then find nearest by elo
  const pivot = songs[Math.floor(Math.random() * songs.length)];
  let candidate = songs
    .filter((s) => s.id !== pivot.id)
    .sort((a, b) => Math.abs(a.elo - pivot.elo) - Math.abs(b.elo - pivot.elo))[0];

  if (!candidate) candidate = songs.find((s) => s.id !== pivot.id)!;

  return new Response(JSON.stringify({ a: pivot, b: candidate }), {
    headers: { "Content-Type": "application/json" },
  });
}
