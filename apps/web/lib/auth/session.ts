// Session utilities
// Helper functions for getting current session and user

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { UserRepository } from '@/lib/repositories';
import type { User } from '@/types/user';

/**
 * Get current session on server side
 */
export async function getCurrentSession() {
  return auth();
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  
  if (!session?.user?.email) {
    return null;
  }

  const userRepo = new UserRepository();
  return userRepo.findByEmail(session.user.email);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}
