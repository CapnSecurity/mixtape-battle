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

// New resource link generators
export const spotify = (artist: string, title: string) =>
  `https://open.spotify.com/search/${encodeURIComponent(artist + " " + title)}`;

export const genius = (artist: string, title: string) =>
  `https://genius.com/search?q=${encodeURIComponent(artist + " " + title)}`;

export const wikipedia = (artist: string, title: string) =>
  `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(artist + " " + title)}`;

export const allMusic = (artist: string, album?: string) => {
  const query = album ? `${artist} ${album}` : artist;
  return `https://www.allmusic.com/search/all/${encodeURIComponent(query)}`;
};
