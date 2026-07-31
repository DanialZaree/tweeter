import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import * as bcrypt from 'bcryptjs';
import prisma from './lib/prisma';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
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

        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials?.password as string, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar || user.image,
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

      if (token.id) {
        let dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (dbUser) {
          if (!dbUser.userName) {
            const baseName = (dbUser.name || dbUser.email?.split('@')[0] || 'user')
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .slice(0, 15);

            let candidate = baseName || 'user';
            let count = 0;
            while (true) {
              const existing = await prisma.user.findUnique({ where: { userName: candidate } });
              if (!existing) break;
              count++;
              candidate = `${baseName}${count}`;
            }

            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                userName: candidate,
                avatar: dbUser.avatar || dbUser.image,
              },
            });
          }

          token.userName = dbUser.userName;
          token.picture = dbUser.avatar || dbUser.image || token.picture;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.userName = token.userName as string;
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
