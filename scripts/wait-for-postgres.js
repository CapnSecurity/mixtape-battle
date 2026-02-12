// Cross-platform wait-for-postgres script
const { execSync } = require('child_process');
const { Client } = require('pg');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5433;  // Dev uses port 5433
const DB_USER = process.env.POSTGRES_USER || 'postgres';
const DB_PASS = process.env.POSTGRES_PASSWORD || 'postgres';
const DB_NAME = process.env.POSTGRES_DB || 'mixtape_battle_dev';  // Dev database name

const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;

async function waitForPostgres() {
  let attempts = 0;
  while (attempts < MAX_ATTEMPTS) {
    try {
      const client = new Client({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
      });
      await client.connect();
      await client.end();
      console.log('Postgres is up!');
      return true;
    } catch (err) {
      attempts++;
      console.log(`Waiting for Postgres... (${attempts}/${MAX_ATTEMPTS})`);
      await new Promise(res => setTimeout(res, DELAY_MS));
    }
  }
  throw new Error('Postgres did not become available in time.');
}

waitForPostgres().catch(err => {
  console.error(err);
  process.exit(1);
});
