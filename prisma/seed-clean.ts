import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const songs = [
  { title: "Honey Bee", artist: "Tom Petty" },
  { title: "Death Valley Queen", artist: "Flogging Molly" },
  { title: "All for You (AI)", artist: "Sister Hazel" }
];

async function main() {
  const count = await prisma.song.count();
  if (count > 0) {
    console.log(`Songs already exist (${count}). Skipping seed.`);
    return;
  }

  for (const s of songs) {
    await prisma.song.create({ data: s });
  }
  console.log(`Seeded ${songs.length} songs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
