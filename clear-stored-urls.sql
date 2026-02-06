-- Clear all stored resource URLs to use dynamic search URLs instead
UPDATE "Song" 
SET "ultimateGuitar" = NULL, 
    "songsterr" = NULL, 
    "youtube" = NULL, 
    "lyrics" = NULL
WHERE id > 0;

SELECT COUNT(*) as "Updated Songs" FROM "Song";
