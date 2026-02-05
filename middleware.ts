import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/settings", "/battle", "/results", "/songs"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;


  // Allow public paths
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Special: /invite is admin-only
  if (pathname.startsWith("/invite")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    // Fetch user from DB to check isAdmin (token may not have it)
    // Use a simple fetch to /api/me or similar, or (for now) allow only your email
    // TODO: Replace with DB lookup if needed
    const adminEmails = ["tim@levesques.net"];
    if (!adminEmails.includes(token.email)) {
      const deniedUrl = req.nextUrl.clone();
      deniedUrl.pathname = "/login";
      return NextResponse.redirect(deniedUrl);
    }
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
