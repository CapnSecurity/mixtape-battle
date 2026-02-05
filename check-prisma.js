const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const users = await p.user.count();
    console.log('db ok, users:', users);
  } catch (e) {
    console.error('db err', e && e.message ? e.message : e);
  } finally {
    await p.$disconnect();
  }
})();
