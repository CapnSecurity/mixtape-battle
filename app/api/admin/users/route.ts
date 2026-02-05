import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
      orderBy: {
        email: 'asc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[GET USERS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
