import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/signup", "/settings", "/battle", "/results", "/songs"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;


  // Allow public paths
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/invite") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Special: /invite is admin-only
  if (pathname.startsWith("/invite")) {
    console.log("[MIDDLEWARE] All cookies:", req.cookies.getAll());
    console.log("[MIDDLEWARE] Cookie header:", req.headers.get('cookie'));
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET
    });
    console.log("[MIDDLEWARE] /invite access attempt. Token:", JSON.stringify(token));
    if (!token || !token.email) {
      console.log("[MIDDLEWARE] No token or email, redirecting to login");
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    // Check if user is admin using token.isAdmin or email whitelist
    const adminEmails = ["tim@levesques.net"];
    const isAdmin = token.isAdmin === true || adminEmails.includes(token.email as string);
    console.log("[MIDDLEWARE] isAdmin:", isAdmin, "email:", token.email);
    if (!isAdmin) {
      console.log("[MIDDLEWARE] User not admin, redirecting to login");
      const deniedUrl = req.nextUrl.clone();
      deniedUrl.pathname = "/login";
      return NextResponse.redirect(deniedUrl);
    }
    return NextResponse.next();
  }

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET
  });
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
