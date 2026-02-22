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

-- CreateIndex
CREATE UNIQUE INDEX "SetlistEntry_songId_key" ON "SetlistEntry"("songId");

-- CreateIndex
CREATE INDEX "SetlistEntry_position_idx" ON "SetlistEntry"("position");

-- AddForeignKey
ALTER TABLE "SetlistEntry" ADD CONSTRAINT "SetlistEntry_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
