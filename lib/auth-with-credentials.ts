import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { debug, userRef } from "./log";

// Real bcrypt hash of a random value, used to equalise timing when the account does not exist.
const DUMMY_HASH = bcrypt.hashSync(randomBytes(16).toString("hex"), 10);

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
          debug("[AUTH] Missing email or password");
          return null;
        }
        const ref = userRef(credentials.email);

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        // Always run a bcrypt comparison so response time does not reveal whether the account exists.
        const valid = await bcrypt.compare(credentials.password, user?.password ?? DUMMY_HASH);
        if (!user || !user.password || !valid) {
          console.warn("[AUTH] Login failed for", ref);
          return null;
        }
        console.log("[AUTH] Login successful for", ref);
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
      debug("[SIGNIN] User signed in:", userRef(user.email));
      return true;
    },
    async redirect({ url, baseUrl }) {
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
      // Track if this was an email provider login
      if (account?.provider === "email") {
        token.isEmailProvider = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const sessionUser = session.user as {
          id?: string;
          email?: string;
          isAdmin?: boolean;
        };
        sessionUser.id = token.id as string;
        sessionUser.email = token.email as string;
        sessionUser.isAdmin = (token as any).isAdmin || false;
      }
      return session;
    },
  },
};
