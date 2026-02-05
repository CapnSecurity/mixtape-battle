const fs = require('fs');
const songs = JSON.parse(fs.readFileSync('./songs-backup.json', 'utf8'));

console.log('-- Restore Songs with ELO ratings');
console.log('DELETE FROM "BattleVote";');
console.log('DELETE FROM "Song";');
console.log('');

songs.forEach(song => {
  const title = (song.title || '').replace(/'/g, "''");
  const artist = (song.artist || '').replace(/'/g, "''");
  const album = (song.album || '').replace(/'/g, "''");
  const elo = song.elo || 1200;
  const releaseDate = song.releaseDate || null;
  
  // Map old column names to new
  const songsterr = (song.songsterrGuitarUrl || song.songsterr || '').replace(/'/g, "''");
  const ultimateGuitar = (song.songsterrBassUrl || song.ultimateGuitar || '').replace(/'/g, "''");
  const lyrics = (song.lyricsUrl || song.lyrics || '').replace(/'/g, "''");
  const youtube = (song.youtubeUrl || song.youtube || '').replace(/'/g, "''");
  const spotify = (song.spotify || '').replace(/'/g, "''");
  const apple = (song.apple || '').replace(/'/g, "''");
  const bandcamp = (song.bandcamp || '').replace(/'/g, "''");
  const soundcloud = (song.soundcloud || '').replace(/'/g, "''");
  
  console.log(`INSERT INTO "Song" (title, artist, album, "releaseDate", elo, songsterr, "ultimateGuitar", lyrics, youtube, spotify, apple, bandcamp, soundcloud) VALUES ('${title}', '${artist}', ${album ? `'${album}'` : 'NULL'}, ${releaseDate}, ${elo}, ${songsterr ? `'${songsterr}'` : 'NULL'}, ${ultimateGuitar ? `'${ultimateGuitar}'` : 'NULL'}, ${lyrics ? `'${lyrics}'` : 'NULL'}, ${youtube ? `'${youtube}'` : 'NULL'}, ${spotify ? `'${spotify}'` : 'NULL'}, ${apple ? `'${apple}'` : 'NULL'}, ${bandcamp ? `'${bandcamp}'` : 'NULL'}, ${soundcloud ? `'${soundcloud}'` : 'NULL'});`);
});
