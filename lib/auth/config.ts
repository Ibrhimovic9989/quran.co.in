// NextAuth Configuration
// Google OAuth authentication setup

import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { UserRepository } from '@/lib/repositories';

export const authOptions: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === 'google' && user.email) {
          // Sync user to our custom User table
          const userRepo = new UserRepository();
          const existingUser = await userRepo.findByEmail(user.email);
          
          if (!existingUser) {
            // Create user in our database
            await userRepo.create({
              clerkId: user.id || '', // Using NextAuth ID as identifier
              email: user.email,
              name: user.name || user.email.split('@')[0],
              imageUrl: user.image || undefined,
            });
          } else {
            // Update user if exists - try by clerkId first, then by id
            try {
              if (user.id) {
                await userRepo.updateByClerkId(user.id, {
                  name: user.name || existingUser.name,
                  imageUrl: user.image || existingUser.imageUrl,
                });
              }
            } catch (error) {
              // If update fails, try by id
              await userRepo.update(existingUser.id, {
                name: user.name || existingUser.name,
                imageUrl: user.image || existingUser.imageUrl,
              });
            }
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return true; // Allow sign-in even if sync fails
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || undefined;
        token.email = user.email || undefined;
        // Try to get user from database and store in token
        try {
          if (user.email) {
            const userRepo = new UserRepository();
            const dbUser = await userRepo.findByEmail(user.email);
            if (dbUser) {
              token.dbUserId = dbUser.id;
              token.dbUserClerkId = dbUser.clerkId;
            }
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add database user IDs from token (no DB query needed)
      if (session.user && token.dbUserId) {
        (session.user as any).id = token.dbUserId;
        (session.user as any).clerkId = token.dbUserClerkId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};
