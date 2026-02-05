import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { songsterrBass, ultimateGuitarGuitar, youtube, lyrics } from "../../../../lib/links";
import { fetchSongMetadata } from "../../../../lib/musicbrainz";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { artist, title, album, releaseDate } = await req.json();
    
    if (!artist || !title) {
      return NextResponse.json({ error: "Artist and title are required" }, { status: 400 });
    }

    // Check if song already exists
    const existingSong = await prisma.song.findFirst({
      where: {
        artist: artist.trim(),
        title: title.trim(),
      },
    });

    if (existingSong) {
      return NextResponse.json({ error: "Song already exists" }, { status: 409 });
    }

    // Fetch metadata from MusicBrainz if album/release date not provided
    let finalAlbum = album?.trim() || null;
    let finalReleaseDate = releaseDate ? parseInt(releaseDate) : null;
    
    if (!finalAlbum || !finalReleaseDate) {
      console.log(`[ADD SONG] Fetching metadata from MusicBrainz for: ${artist} - ${title}`);
      const metadata = await fetchSongMetadata(artist, title);
      
      if (metadata) {
        console.log(`[ADD SONG] MusicBrainz found: album="${metadata.album}", year=${metadata.releaseDate}, confidence=${metadata.confidence}`);
        if (!finalAlbum && metadata.album) {
          finalAlbum = metadata.album;
        }
        if (!finalReleaseDate && metadata.releaseDate) {
          finalReleaseDate = metadata.releaseDate;
        }
      } else {
        console.log(`[ADD SONG] No metadata found on MusicBrainz`);
      }
    }

    // Generate resource URLs using our search functions
    const generatedUrls = {
      songsterr: songsterrBass(artist, title),
      ultimateGuitar: ultimateGuitarGuitar(artist, title),
      youtube: youtube(artist, title),
      lyrics: lyrics(artist, title),
    };

    // Create the song with default ELO of 1500
    const song = await prisma.song.create({
      data: {
        artist: artist.trim(),
        title: title.trim(),
        album: finalAlbum,
        releaseDate: finalReleaseDate,
        elo: 1500,
        // Store the generated resource URLs
        songsterr: generatedUrls.songsterr,
        ultimateGuitar: generatedUrls.ultimateGuitar,
        youtube: generatedUrls.youtube,
        lyrics: generatedUrls.lyrics,
      },
    });

    return NextResponse.json({ 
      success: true, 
      song,
      message: `Successfully added "${title}" by ${artist}`,
      metadata: {
        album: finalAlbum,
        releaseDate: finalReleaseDate,
        source: (album || releaseDate) ? 'user' : 'musicbrainz',
      }
    });
  } catch (error) {
    console.error("[ADD SONG ERROR]", error);
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}
