export const songsterrBass = (artist: string, title: string) =>
  `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(artist + " " + title)}`;

export const ultimateGuitarGuitar = (artist: string, title: string) =>
  `https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(
    artist + " " + title
  )}&type=300`;

export const ultimateGuitarBass = (artist: string, title: string) =>
  `https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(
    artist + " " + title
  )}&type=400`;

export const youtube = (artist: string, title: string) =>
  `https://music.youtube.com/search?q=${encodeURIComponent(
    artist + " " + title
  )}`;

export const lyrics = (artist: string, title: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(artist + " " + title + " lyrics")}`;
