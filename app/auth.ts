import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import prisma from './lib/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        userName: {},
        password: {},
      },
      async authorize(credentials) {
        const rawUserName = credentials?.userName as string | undefined;
        const rawEmail = credentials?.email as string | undefined;

        let user = null;

        if (rawUserName) {
          const userName = rawUserName.trim().toLowerCase();
          user = await prisma.user.findUnique({
            where: { userName },
          });

          if (!user) {
            user = await prisma.user.findUnique({
              where: { userName: rawUserName.trim() },
            });
          }
        } else if (rawEmail) {
          const email = rawEmail.trim().toLowerCase();
          user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.findUnique({
              where: { email: rawEmail.trim() },
            });
          }
        }

        if (!user) return null;
        const valid = await bcrypt.compare(credentials?.password as string, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: { strategy: 'jwt' },
});
