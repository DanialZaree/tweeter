import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as bcrypt from 'bcrypt';
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
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email as string },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials?.password as string, user.password);

        if (!valid) return null;
        
        const safeImage = user.avatar && !user.avatar.startsWith('data:') && user.avatar.length < 500 ? user.avatar : null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: safeImage, 
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const picture = user.image;
        token.picture = picture && !picture.startsWith('data:') && picture.length < 500 ? picture : null; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.image = (token.picture as string) || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: { strategy: 'jwt' },
});