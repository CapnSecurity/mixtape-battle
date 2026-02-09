-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('SOLID', 'NEEDS_WORK', 'NOT_READY');

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "keyNotes" TEXT,
ADD COLUMN     "lastPracticedAt" TIMESTAMP(3),
ADD COLUMN     "tuningNotes" TEXT;

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
CREATE INDEX "SongReadiness_songId_idx" ON "SongReadiness"("songId");

-- CreateIndex
CREATE INDEX "SongReadiness_userId_idx" ON "SongReadiness"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SongReadiness_songId_userId_key" ON "SongReadiness"("songId", "userId");

-- AddForeignKey
ALTER TABLE "SongReadiness" ADD CONSTRAINT "SongReadiness_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongReadiness" ADD CONSTRAINT "SongReadiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
