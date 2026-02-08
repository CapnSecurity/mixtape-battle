import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("[MIDDLEWARE] Request to:", pathname);

  // Allow public paths
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/invite") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    console.log("[MIDDLEWARE] Public path, allowing:", pathname);
    return NextResponse.next();
  }

  // /admin page handles its own admin check and shows friendly message
  // Just ensure user is authenticated
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token || !token.email) {
      console.log("[MIDDLEWARE] /admin - not authenticated, redirecting to login");
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
    // Let the page handle admin check and show friendly message
    return NextResponse.next();
  }

  console.log("[MIDDLEWARE] Protected path, checking auth:", pathname);
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET
  });
  console.log("[MIDDLEWARE] Token:", token ? "exists" : "null");
  if (!token) {
    console.log("[MIDDLEWARE] No token, redirecting to login");
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  console.log("[MIDDLEWARE] Authenticated, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
