# Mixtape Battle

A collaborative band song voting and rehearsal management system.

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

### 🎵 Song Battle System
- Head-to-head song voting with ELO ranking
- Dynamic song recommendations based on voting history
- Comprehensive song rankings and statistics

### 🎯 Song Readiness Tracking
- Personal readiness status (Solid ✅ / Needs Work ⚠️ / Not Ready ❌)
- Band-wide readiness aggregation
- Individual voting on song preparedness
- Real-time readiness indicators on song pages

### 📋 Setlist Confidence View
- Top 20 songs by ELO ranking
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

### Battle System
- `GET /api/battle/next` — Returns two songs to vote on
- `POST /api/battle/submit` — Submit vote: `{ "winnerId": <id>, "loserId": <id> }`

### Song Readiness
- `GET /api/songs/[id]/readiness` — Get user and aggregate readiness for a song
- `POST /api/songs/[id]/readiness` — Set personal readiness status (requires auth)

### Practice Tracking (Admin Only)
- `POST /api/songs/[id]/practice` — Update practice date and notes (requires admin)

## Pages

- `/` — Home page with battle interface
- `/battle` — Song battle voting
- `/results` — Song rankings with readiness indicators
- `/songs/[id]` — Song detail with readiness controls and practice info
- `/setlist-confidence` — Top 20 songs with band readiness overview
- `/login` — Authentication

Notes
- This repo intentionally excludes local secrets and build artifacts via `.gitignore`.
- If you want me to push a release branch to a remote Git provider, provide the remote URL or I can create a GitHub repo for you.
