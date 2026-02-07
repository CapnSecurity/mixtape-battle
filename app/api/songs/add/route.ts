import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { songsterrBass, ultimateGuitarGuitar, youtube, lyrics } from "../../../../lib/links";
import { fetchSongMetadataWithFallbacks } from "../../../../lib/musicbrainz";
import { validateSongInput } from "../../../../lib/input-sanitization";
import { sanitizeError, logError } from "../../../../lib/error-handler";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      console.log("[ADD SONG] Invalid CSRF token");
      return csrfErrorResponse();
    }

    const { artist, title, album, releaseDate } = body;
    
    // Validate and sanitize all input
    const validation = validateSongInput({ title, artist, album, releaseDate });
    
    if (!validation.isValid) {
      console.log("[ADD SONG] Validation failed:", validation.errors);
      return NextResponse.json({ 
        error: 'Invalid song data',
        details: validation.errors 
      }, { status: 400 });
    }

    const { title: sanitizedTitle, artist: sanitizedArtist, album: sanitizedAlbum, releaseDate: sanitizedYear } = validation.sanitized;

    // Check if song already exists
    const existingSong = await prisma.song.findFirst({
      where: {
        artist: sanitizedArtist,
        title: sanitizedTitle,
      },
    });

    if (existingSong) {
      return NextResponse.json({ error: "Song already exists" }, { status: 409 });
    }

    // Fetch metadata from MusicBrainz if album/release date not provided
    let finalAlbum = sanitizedAlbum || null;
    let finalReleaseDate = sanitizedYear;
    let albumArtUrl = null;
    let genre = null;
    let durationMs = null;
    let decade = null;
    
    if (!finalAlbum || !finalReleaseDate) {
      console.log(`[ADD SONG] Fetching metadata (MusicBrainz → iTunes → Last.fm) for: ${sanitizedArtist} - ${sanitizedTitle}`);
      const metadata = await fetchSongMetadataWithFallbacks(sanitizedArtist, sanitizedTitle);
      
      if (metadata) {
        console.log(`[ADD SONG] Metadata found: album="${metadata.album}", year=${metadata.releaseDate}, genre=${metadata.genre}, albumArt=${!!metadata.albumArtUrl}, confidence=${metadata.confidence}`);
        if (!finalAlbum && metadata.album) {
          finalAlbum = metadata.album;
        }
        if (!finalReleaseDate && metadata.releaseDate) {
          finalReleaseDate = metadata.releaseDate;
        }
        // Always use MusicBrainz data for these fields
        albumArtUrl = metadata.albumArtUrl;
        genre = metadata.genre;
        durationMs = metadata.durationMs;
        decade = metadata.decade;
      } else {
        console.log(`[ADD SONG] No metadata found from any source`);
        // Calculate decade from user-provided year if available
        if (finalReleaseDate) {
          decade = Math.floor(finalReleaseDate / 10) * 10;
        }
      }
    } else {
      // User provided album/year, but still fetch additional metadata
      console.log(`[ADD SONG] Fetching additional metadata (MusicBrainz → iTunes → Last.fm) for: ${sanitizedArtist} - ${sanitizedTitle}`);
      const metadata = await fetchSongMetadataWithFallbacks(sanitizedArtist, sanitizedTitle);
      if (metadata) {
        albumArtUrl = metadata.albumArtUrl;
        genre = metadata.genre;
        durationMs = metadata.durationMs;
      }
      // Calculate decade from user-provided year
      if (finalReleaseDate) {
        decade = Math.floor(finalReleaseDate / 10) * 10;
      }
    }

    // Generate resource URLs using our search functions
    const generatedUrls = {
      songsterr: songsterrBass(sanitizedArtist, sanitizedTitle),
      ultimateGuitar: ultimateGuitarGuitar(sanitizedArtist, sanitizedTitle),
      youtube: youtube(sanitizedArtist, sanitizedTitle),
      lyrics: lyrics(sanitizedArtist, sanitizedTitle),
    };

    // Create the song with default ELO of 1500
    const song = await prisma.song.create({
      data: {
        artist: sanitizedArtist,
        title: sanitizedTitle,
        album: finalAlbum,
        releaseDate: finalReleaseDate,
        decade: decade,
        albumArtUrl: albumArtUrl,
        genre: genre,
        durationMs: durationMs,
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
      message: `Successfully added "${sanitizedTitle}" by ${sanitizedArtist}`,
      metadata: {
        album: finalAlbum,
        releaseDate: finalReleaseDate,
        decade: decade,
        albumArtUrl: albumArtUrl,
        genre: genre,
        durationMs: durationMs,
        source: (sanitizedAlbum || sanitizedYear) ? 'user' : 'auto',
      }
    });
  } catch (error) {
    logError('[ADD SONG]', error);
    return NextResponse.json({ 
      error: sanitizeError(error, 'Failed to add song') 
    }, { status: 500 });
  }
}
