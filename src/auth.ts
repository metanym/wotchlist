import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Resend as ResendClient } from "resend";
import { db } from "@/lib/db";
import { magicLinkEmailHtml, magicLinkEmailText } from "@/lib/auth-email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db()),
  trustHost: true,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    newUser: "/auth/onboarding",
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: to, url }) {
        const resend = new ResendClient(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to,
          subject: "Sign in to Wotchlist",
          html: magicLinkEmailHtml(url),
          text: magicLinkEmailText(url),
        });
        if (error) {
          throw new Error(`Resend error: ${error.message}`);
        }
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.id,
          email: profile.email,
          displayName: profile.name ?? null,
          emailVerified: null,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.displayName = user.displayName ?? null;
      return session;
    },
  },
});
