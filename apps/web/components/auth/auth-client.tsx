// Client-side auth against the dedicated NestJS backend (replaces NextAuth).
//
// The backend owns the tokens: Google OAuth redirect flow sets httpOnly
// cookies, and every check here is a credentials-included call to
// GET /api/auth/me (with one silent refresh attempt on 401).
//
// Exports a NextAuth-COMPATIBLE surface — useSession / signIn / signOut with
// the same shapes — so existing call sites only changed their import path.

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { backendUrl } from '@/lib/api/backend';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string | null;
  createdAt?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: 'loading',
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refresh = useCallback(async () => {
    try {
      let res = await fetch(backendUrl('/api/auth/me'), {
        credentials: 'include',
        cache: 'no-store',
      });

      // Access token expired → try one silent refresh, then re-check.
      if (res.status === 401) {
        const refreshed = await fetch(backendUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshed.ok) {
          res = await fetch(backendUrl('/api/auth/me'), {
            credentials: 'include',
            cache: 'no-store',
          });
        }
      }

      if (res.ok) {
        const data = (await res.json()) as { user: AuthUser };
        setUser(data.user);
        setStatus('authenticated');
        return;
      }
    } catch {
      // network error → treat as signed out
    }
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ user, status, refresh }), [user, status, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

// ── NextAuth-compatible surface ───────────────────────────────────────────────

export interface CompatSession {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

/** Drop-in replacement for next-auth/react's useSession(). */
export function useSession(): { data: CompatSession | null; status: AuthStatus } {
  const { user, status } = useAuth();
  const data = useMemo<CompatSession | null>(
    () =>
      user
        ? {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.imageUrl ?? null,
            },
          }
        : null,
    [user],
  );
  return { data, status };
}

/** Drop-in replacement for next-auth/react's signIn('google', { callbackUrl }). */
export function signIn(_provider?: string, options?: { callbackUrl?: string }) {
  const callbackUrl =
    options?.callbackUrl ?? window.location.pathname + window.location.search;
  window.location.href = backendUrl(
    `/api/auth/google?redirect=${encodeURIComponent(callbackUrl)}`,
  );
}

/** Drop-in replacement for next-auth/react's signOut({ callbackUrl }). */
export async function signOut(options?: { callbackUrl?: string }) {
  try {
    await fetch(backendUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // clearing cookies failed (offline?) — still navigate away
  }
  window.location.href = options?.callbackUrl ?? '/';
}
