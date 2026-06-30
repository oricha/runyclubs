import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "noreply@runclubs.es",
    }),
  ],
  pages: {
    signIn: "/acceso",
    verifyRequest: "/acceso/verificar",
    error: "/acceso",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
        session.user.isSuperAdmin =
          (user as { isSuperAdmin?: boolean }).isSuperAdmin ?? false;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
