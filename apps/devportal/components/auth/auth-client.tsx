// Client-side auth against the quran.co.in NestJS backend (apps/api).
//
// The backend owns the tokens: the Google OAuth redirect flow sets httpOnly
// cookies on the `.quran.co.in` domain, so on this subdomain
// (developers.quran.co.in) the cookie is sent automatically — no token
// handling here. Every check is a credentials-included call to
// GET /api/auth/me, with one silent refresh attempt on 401.

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

  const value = useMemo(
    () => ({ user, status, refresh }),
    [user, status, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/** Redirect to Google OAuth, returning to `callbackUrl` when done. */
export function signIn(options?: { callbackUrl?: string }) {
  const callbackUrl =
    options?.callbackUrl ?? window.location.pathname + window.location.search;
  window.location.href = backendUrl(
    `/api/auth/google?redirect=${encodeURIComponent(
      new URL(callbackUrl, window.location.origin).toString(),
    )}`,
  );
}

/** Clear the session cookies on the backend, then navigate away. */
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
