# The Mixtape

A band management system: song library, setlists, practice tracking and readiness.

**🌐 Live Production:** https://themixtape.me

## Production Deployment

The app is hosted on [Render](https://render.com) with:
- PostgreSQL database (Render managed)
- Auto-deploy on push to `main` branch
- SSL certificates via Let's Encrypt
- Email via Zoho Mail (admin@themixtape.me)

---

## Local Development

## Features

### 🎸 Song Library
- Browse, search and edit songs with automatic album, year, genre and art lookup
- Tabs, lyrics and video links for every song

### 🎯 Song Readiness Tracking
- Personal readiness status (Solid ✅ / Needs Work ⚠️ / Not Ready ❌)
- Band-wide readiness aggregation
- Individual voting on song preparedness
- Real-time readiness indicators on song pages

### 📋 Setlist Confidence View
- Top 20 songs by band readiness
- Band readiness status at-a-glance
- Last practice date tracking
- Key signature and tuning notes
- Visual indicators for songs needing practice

### 🎸 Practice Management (Admin Only)
- Mark songs as practiced with timestamps
- Key signature and tuning notes documentation
- Practice history tracking
- Admin-controlled shared band data

### 🔐 Authentication & Security
- Secure email-based authentication
- Admin role management
- CSRF protection on all mutations
- Read-only practice data for non-admins

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

## API Endpoints

### Song Readiness
- `GET /api/songs/[id]/readiness` — Get user and aggregate readiness for a song
- `POST /api/songs/[id]/readiness` — Set personal readiness status (requires auth)

### Practice Tracking (Admin Only)
- `POST /api/songs/[id]/practice` — Update practice date and notes (requires admin)

## Pages

- `/` — Public home page
- `/songs` — Song library
- `/songs/[id]` — Song detail with readiness controls and practice info
- `/setlist` — Band setlist
- `/woodshed` — Personal practice list
- `/setlist-confidence` — Top 20 songs by band readiness
- `/login` — Authentication

The former battle system (`/battle`, `/results`, ELO scores, voting) was removed. `/battle` and `/results`
redirect to `/songs`. The `BattleVote`, `BattlePairingHistory`, `BattleSkip` and `UserPreference` tables and
`Song.elo` remain in the database, unused, so the removal is reversible without a migration.

Notes
- This repo intentionally excludes local secrets and build artifacts via `.gitignore`.
- If you want me to push a release branch to a remote Git provider, provide the remote URL or I can create a GitHub repo for you.
