import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (in seconds)
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing email or password");
          return null;
        }
        console.log("[AUTH] Attempting to find user:", credentials.email);
        console.log("[AUTH] Password provided length:", credentials.password?.length);
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          console.log("[AUTH] User not found:", credentials.email);
          return null;
        }
        if (!user.password) {
          console.log("[AUTH] User has no password:", credentials.email);
          return null;
        }
        console.log("[AUTH] User found, password hash exists (length:", user.password?.length, ")");
        console.log("[AUTH] Password hash starts with:", user.password?.substring(0, 7));
        console.log("[AUTH] Comparing passwords for:", credentials.email);
        
        const valid = await bcrypt.compare(credentials.password, user.password);
        console.log("[AUTH] Password comparison result:", valid);
        
        if (!valid) {
          console.log("[AUTH] Invalid password for:", credentials.email);
          return null;
        }
        console.log("[AUTH] Login successful for:", credentials.email);
        return { id: user.id, email: user.email, isAdmin: user.isAdmin };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("[SIGNIN] User signed in:", user.email);
      return true;
    },
    async redirect({ url, baseUrl, account }) {
      const urlObj = new URL(url.startsWith('http') ? url : `${baseUrl}${url}`);
      const callbackUrl = urlObj.searchParams.get('callbackUrl');
      
      // If the callback is /login (which magic links use), redirect to settings instead
      if (callbackUrl && (callbackUrl === '/login' || callbackUrl === `${baseUrl}/login`)) {
        return `${baseUrl}/settings`;
      }
      
      // If URL is just baseUrl or baseUrl/login, go to settings
      if (url === baseUrl || url === `${baseUrl}/` || url === `${baseUrl}/login`) {
        return `${baseUrl}/settings`;
      }
      
      // For other callbacks (credentials with /dashboard)
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/settings`;
    },
    async jwt({ token, user, account, trigger }) {
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 7 * 24 * 60 * 60;
      const updateAge = 24 * 60 * 60;

      if (user) {
        console.log("[JWT] Creating token for user:", user.email, "isAdmin:", (user as any).isAdmin);
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = (user as any).isAdmin || false;
        // Set token expiration (7 days from now)
        token.iat = now;
        token.exp = now + maxAge;
      } else {
        const tokenIat = typeof token.iat === "number" ? token.iat : undefined;
        if (!tokenIat || now - tokenIat > updateAge) {
          token.iat = now;
          token.exp = now + maxAge;
        }
      }
      console.log("[JWT] Final token:", JSON.stringify({ id: token.id, email: token.email, isAdmin: token.isAdmin, exp: token.exp }));
      // Track if this was an email provider login
      if (account?.provider === "email") {
        token.isEmailProvider = true;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[SESSION] Building session. Token:", JSON.stringify(token));
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).isAdmin = token.isAdmin || false;
      }
      console.log("[SESSION] Final session:", JSON.stringify(session));
      return session;
    },
  },
};
