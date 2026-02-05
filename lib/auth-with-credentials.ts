import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import EmailProvider from "next-auth/providers/email";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
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
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          console.log("[AUTH] User not found:", credentials.email);
          return null;
        }
        if (!user.password) {
          console.log("[AUTH] User has no password:", credentials.email);
          return null;
        }
        console.log("[AUTH] Comparing passwords for:", credentials.email);
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) {
          console.log("[AUTH] Invalid password for:", credentials.email);
          return null;
        }
        console.log("[AUTH] Login successful for:", credentials.email);
        return { id: user.id, email: user.email, isAdmin: user.isAdmin };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
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
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = (user as any).isAdmin || false;
      }
      // Track if this was an email provider login
      if (account?.provider === "email") {
        token.isEmailProvider = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        (session.user as any).isAdmin = token.isAdmin || false;
      }
      return session;
    },
  },
};
