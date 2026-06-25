import Credentials from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import AuthService from '@/services/auth.service';
import z from 'zod';
import { loginUserSchema } from '@/validationSchemas/auth';
import UserService from './services/user.service';

const config: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },

  providers: [
    Credentials({
      credentials: {},

      authorize: async (credentials) => {
        const user = await AuthService.localLogin(credentials as z.infer<typeof loginUserSchema>);
        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.address = user.address;
        token.phone = user.phone;
      }

      if (trigger && trigger === 'update') {
        const user = await UserService.getProfile()
        if (user) {
          token.id = user.id!;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;
          token.address = user.address;
          token.phone = user.phone;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as never;
        session.user.email = token.email!;
        session.user.name = token.name!;
        session.user.role = token.role;
        session.user.address = token.address;
        session.user.phone = token.phone;
      }

      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
