// Server-side session utilities (backend-driven; NextAuth removed).
// Reads the httpOnly access_token cookie from the incoming request and asks
// the NestJS backend who the user is.

import { cookies } from 'next/headers';
import { backendUrl } from '@/lib/api/backend';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  createdAt?: string;
}

/**
 * Get current authenticated user (server components / route handlers).
 * Returns null when signed out or the backend is unreachable.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;

  try {
    const res = await fetch(backendUrl('/api/auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: CurrentUser };
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
