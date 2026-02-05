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
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email };
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth:
          process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
            ? {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              }
            : undefined,
      },
      from: process.env.EMAIL_FROM,
      // Magic link users should go to settings to set password
      maxAge: 24 * 60 * 60, // 24 hours
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // Track if this was an email provider login
      if (account?.provider === "email") {
        token.isEmailProvider = true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};
