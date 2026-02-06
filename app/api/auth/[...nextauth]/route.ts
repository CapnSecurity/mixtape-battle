import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth-with-credentials";
import { rateLimiters } from "@/lib/rate-limit";

async function handler(req: NextRequest, context: any) {
  // Apply rate limiting to authentication requests
  if (req.method === 'POST') {
    const rateLimitResult = await rateLimiters.auth(req);
    if (!rateLimitResult.success) {
      console.log("[NEXTAUTH] Rate limit exceeded for auth request");
      return rateLimitResult.response;
    }
  }
  
  return NextAuth(authOptions as any)(req, context);
}

export { handler as GET, handler as POST };
