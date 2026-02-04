export const songsterr = (artist: string, title: string) =>
  `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(artist + " " + title)}`;

export const ultimateGuitar = (artist: string, title: string) =>
  `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(
    artist + " " + title
  )}`;

export const youtube = (artist: string, title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(
    artist + " " + title
  )}`;

export const lyrics = (artist: string, title: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(artist + " " + title + " lyrics")}`;
