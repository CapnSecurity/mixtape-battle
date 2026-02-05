import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[DELETE SONG] Session:', JSON.stringify(session, null, 2));
    console.log('[DELETE SONG] isAdmin:', (session.user as any)?.isAdmin);
    
    if (!session || !(session.user as any)?.isAdmin) {
      console.log('[DELETE SONG] Unauthorized - session or not admin');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { songId } = await req.json();
    
    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
    }

    // Delete the song
    const deletedSong = await prisma.song.delete({
      where: { id: parseInt(songId) },
    });

    console.log(`[DELETE SONG] Admin deleted: "${deletedSong.title}" by ${deletedSong.artist}`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted "${deletedSong.title}" by ${deletedSong.artist}` 
    });
  } catch (error) {
    console.error("[DELETE SONG ERROR]", error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
