const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const votes = await p.battleVote.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
    const songs = await p.song.findMany({ orderBy: { elo: 'desc' }, take: 10 });
    console.log(JSON.stringify({ votes, songs }, null, 2));
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await p.$disconnect();
  }
})();
