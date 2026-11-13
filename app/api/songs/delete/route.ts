import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { verifyCsrfToken, csrfErrorResponse } from "@/lib/csrf";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.email !== 'tim@levesques.net') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Verify CSRF token
    if (!verifyCsrfToken(req, body)) {
      return csrfErrorResponse();
    }

    const { songId } = body;
    
    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
    }

    // Delete the song
    const deletedSong = await prisma.song.delete({
      where: { id: parseInt(songId) },
    });

    console.log(`[DELETE SONG] Song ${deletedSong.id} deleted by root account`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted "${deletedSong.title}" by ${deletedSong.artist}` 
    });
  } catch (error) {
    console.error("[DELETE SONG ERROR]", error);
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
  }
}
