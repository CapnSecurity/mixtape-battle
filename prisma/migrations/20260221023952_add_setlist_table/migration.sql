-- CreateEnum
CREATE TYPE "PracticeStatus" AS ENUM ('NOT_STARTED', 'LEARNING', 'CONFIDENT');

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('SOLID', 'NEEDS_WORK', 'NOT_READY');

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "elo" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "album" TEXT,
    "releaseDate" INTEGER,
    "decade" INTEGER,
    "albumArtUrl" TEXT,
    "durationMs" INTEGER,
    "genre" TEXT,
    "energyMood" TEXT,
    "spotify" TEXT,
    "apple" TEXT,
    "youtube" TEXT,
    "bandcamp" TEXT,
    "soundcloud" TEXT,
    "lyrics" TEXT,
    "songsterr" TEXT,
    "ultimateGuitar" TEXT,
    "lastPracticedAt" TIMESTAMP(3),
    "keyNotes" TEXT,
    "tuningNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetlistEntry" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT NOT NULL,

    CONSTRAINT "SetlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleVote" (
    "id" SERIAL NOT NULL,
    "songA" INTEGER NOT NULL,
    "songB" INTEGER NOT NULL,
    "winner" INTEGER,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "decades" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "artists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "energyMoods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedSongIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattlePairingHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songAId" INTEGER NOT NULL,
    "songBId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattlePairingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleSkip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,
    "lastSkippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleSkip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeListItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,
    "status" "PracticeStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "songId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongReadiness" (
    "id" SERIAL NOT NULL,
    "songId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReadinessStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongReadiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SetlistEntry_position_idx" ON "SetlistEntry"("position");

-- CreateIndex
CREATE UNIQUE INDEX "SetlistEntry_songId_key" ON "SetlistEntry"("songId");

-- CreateIndex
CREATE INDEX "BattleVote_userId_createdAt_idx" ON "BattleVote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BattleVote_userId_songA_songB_createdAt_idx" ON "BattleVote"("userId", "songA", "songB", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "BattlePairingHistory_userId_createdAt_idx" ON "BattlePairingHistory"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BattlePairingHistory_userId_songAId_songBId_key" ON "BattlePairingHistory"("userId", "songAId", "songBId");

-- CreateIndex
CREATE INDEX "BattleSkip_userId_lastSkippedAt_idx" ON "BattleSkip"("userId", "lastSkippedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BattleSkip_userId_songId_key" ON "BattleSkip"("userId", "songId");

-- CreateIndex
CREATE INDEX "PracticeListItem_userId_status_idx" ON "PracticeListItem"("userId", "status");

-- CreateIndex
CREATE INDEX "PracticeListItem_userId_priority_idx" ON "PracticeListItem"("userId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeListItem_userId_songId_key" ON "PracticeListItem"("userId", "songId");

-- CreateIndex
CREATE INDEX "Comment_songId_createdAt_idx" ON "Comment"("songId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "SongReadiness_songId_idx" ON "SongReadiness"("songId");

-- CreateIndex
CREATE INDEX "SongReadiness_userId_idx" ON "SongReadiness"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SongReadiness_songId_userId_key" ON "SongReadiness"("songId", "userId");

-- AddForeignKey
ALTER TABLE "SetlistEntry" ADD CONSTRAINT "SetlistEntry_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleVote" ADD CONSTRAINT "BattleVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattlePairingHistory" ADD CONSTRAINT "BattlePairingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleSkip" ADD CONSTRAINT "BattleSkip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeListItem" ADD CONSTRAINT "PracticeListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeListItem" ADD CONSTRAINT "PracticeListItem_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongReadiness" ADD CONSTRAINT "SongReadiness_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongReadiness" ADD CONSTRAINT "SongReadiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
