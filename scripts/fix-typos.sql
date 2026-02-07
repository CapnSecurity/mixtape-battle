-- Fix typos in song database
UPDATE "Song" SET artist = 'Bruce Springsteen' WHERE artist = 'Bruce Springstein';
UPDATE "Song" SET title = 'Parachute' WHERE artist = 'Chris Stapleton' AND title = 'Parachutte';
UPDATE "Song" SET title = 'The World I Know' WHERE artist = 'Collective Soul' AND title = 'World i Know';
UPDATE "Song" SET artist = 'Pam Tillis' WHERE artist = 'Pam tillis';
UPDATE "Song" SET title = 'Old Time Rock and Roll' WHERE artist = 'Bob Seger' AND title = 'Old Time Rock n Roll';
UPDATE "Song" SET title = 'For What It''s Worth' WHERE artist = 'Buffalo Springfield' AND title = 'For What its Worth';
UPDATE "Song" SET title = 'Nothin'' ''Bout Love' WHERE artist = 'Brooks & Dunn' AND title = 'Nuthin ''bout You';
