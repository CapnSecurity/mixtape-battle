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
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const songs = [{ title: "Honey Bee", artist: "Tom Petty" }];

async function main() {
  const count = await prisma.song.count();
  if (count > 0) {
    console.log(`Songs already exist (${count}). Skipping seed.`);
    return;
  }

  await prisma.song.createMany({ data: songs });
  console.log(`Seeded ${songs.length} songs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const songs = [
  { title: "Honey Bee", artist: "Tom Petty" }
];

async function main() {
  const count = await prisma.song.count();
  if (count > 0) {
    console.log(`Songs already exist (${count}). Skipping seed.`);
    return;
  }

  await prisma.song.createMany({ data: songs });
  console.log(`Seeded ${songs.length} songs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const songs = [
  { title: "Honey Bee", artist: "Tom Petty" },
  { title: "Death Valley Queen", artist: "Flogging Molly" },
  { title: "All for You (AI)", artist: "Sister Hazel" },
  { title: "Dust on the Bottle", artist: "David Lee Murphy" },
  { title: "Blues Run the Game", artist: "Jackson C. Frank" },
  { title: "Born Under a Bad Sign", artist: "Albert King" },
  { title: "Proud Mary", artist: "Creedence Clearwater Revival" },
  { title: "Tulsa Time", artist: "Don Williams" },
  { title: "Chasing Cars", artist: "Snow Patrol" },
  { title: "Yellow", artist: "Coldplay" },
  { title: "Green River Bass", artist: "Creedence Clearwater Revival" },
  { title: "Something in the Orange (AI)", artist: "Zach Bryan" },
  { title: "Slide", artist: "Goo Goo Dolls" },
  { title: "Mountain Sound", artist: "Of Monsters and Men" },
  { title: "Holdin' Heaven", artist: "Tracy Byrd" },
  { title: "Oh Pretty Woman", artist: "Albert King" },
  { title: "Can't You See", artist: "Marshall Tucker Band" },
  { title: "That's Just About Right (AI)", artist: "Blackhawk" },
  { title: "Gild the Lily", artist: "Billy Strings" },
  { title: "Guys Do It All the Time", artist: "Mindy McCready" },
  { title: "Whiskey, Women & Wild Rides", artist: "Cody M Brooks" },
  { title: "Nobody to Blame", artist: "Chris Stapleton" },
  { title: "Seasons of Wither (AI)", artist: "Aerosmith" },
  { title: "Slow Dancing in a Burning Room", artist: "John Mayer" },
  { title: "Love Is a Battlefield", artist: "Pat Benatar" },
  { title: "Crimson and Clover", artist: "Joan Jett" },
  { title: "I Hate Myself for Loving You", artist: "Joan Jett & The Blackhearts" },
  { title: "Long Run", artist: "The Eagles" },
  { title: "Breakdown (AI)", artist: "Tom Petty and the Heartbreakers" },
  { title: "That's How Every Empire Falls", artist: "John Prine" },
  { title: "Dangerous", artist: "Roxette" },
  { title: "Sold", artist: "John Michael Montgomery" },
  { title: "Folsom Prison Blues (Rocksmith)", artist: "Johnny Cash" },
  { title: "Dirty Little Secret", artist: "The All-American Rejects" },
  { title: "Stacy's Mom", artist: "Fountains of Wayne" },
  { title: "Don't Stop Believin'", artist: "Journey" },
  { title: "The Ballad of Jayne", artist: "L.A. Guns" },
  { title: "Roadhouse Blues", artist: "The Black Moods" },
  { title: "Sugar Sweet", artist: "Jeff Healey" },
  { title: "Cold Shot", artist: "Stevie Ray Vaughan & Double Trouble" }
];

async function main() {
  const count = await prisma.song.count();
  if (count > 0) {
    console.log(`Songs already exist (${count}). Skipping seed.`);
    return;
  }

  await prisma.song.createMany({ data: songs });
  console.log(`Seeded ${songs.length} songs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
