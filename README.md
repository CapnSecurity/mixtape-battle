# Mixtape Battle — Local Development

Minimal instructions to run this project locally.

Prerequisites
- Node.js (18+)
- npm
- Docker (for Postgres + MailHog)

Setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` in the project root with values similar to:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-me-with-a-random-secret
EMAIL_SERVER=smtp://localhost:1025
EMAIL_FROM=no-reply@example.com
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mixtape_battle
```

3. Start Postgres + MailHog

```bash
docker compose up -d
# MailHog UI: http://localhost:8025
```

4. Prepare the database (Prisma + Postgres)

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed || npx prisma db seed
```

5. Run the app

```bash
npm run dev
```

API endpoints
- `GET /api/battle/next` — returns two songs to vote on
- `POST /api/battle/submit` — body `{ "winnerId": <id>, "loserId": <id> }`

Notes
- This repo intentionally excludes local secrets and build artifacts via `.gitignore`.
- If you want me to push a release branch to a remote Git provider, provide the remote URL or I can create a GitHub repo for you.
