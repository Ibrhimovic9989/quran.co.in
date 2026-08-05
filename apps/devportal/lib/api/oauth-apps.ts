// OAuth2 app registration against apps/api.
// Every call is cookie-authenticated (credentials: 'include').
//
// These are third-party apps registered for the authorization-code + PKCE
// flow: each app gets a client_id (the app's `id`) and — once, at creation —
// a client_secret.

import { backendUrl } from '@/lib/api/backend';

export interface OAuthApp {
  id: string; // this IS the client_id
  name: string;
  redirectUris: string[];
  createdAt?: number;
}

export interface CreateOAuthAppResult {
  clientId: string;
  clientSecret: string; // returned ONCE
  app: OAuthApp;
  warning?: string;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    // This API returns { error } shapes; Nest's built-ins use { message }.
    const body = (await res.json()) as { error?: string; message?: string | string[] };
    if (body.error) return body.error;
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (body.message) return body.message;
  } catch {
    // non-JSON body
  }
  return fallback;
}

export async function listOAuthApps(): Promise<OAuthApp[]> {
  const res = await fetch(backendUrl('/api/developer/oauth-apps'), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to load OAuth apps.'));
  }
  const data = (await res.json()) as { apps: OAuthApp[] };
  return data.apps ?? [];
}

export async function createOAuthApp(
  name: string,
  redirectUris: string[],
): Promise<CreateOAuthAppResult> {
  const res = await fetch(backendUrl('/api/developer/oauth-apps'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, redirectUris }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to register OAuth app.'));
  }
  return (await res.json()) as CreateOAuthAppResult;
}

export async function updateRedirectUris(
  id: string,
  redirectUris: string[],
): Promise<OAuthApp> {
  const res = await fetch(backendUrl(`/api/developer/oauth-apps/${id}`), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ redirectUris }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to update redirect URIs.'));
  }
  const data = (await res.json()) as { app: OAuthApp };
  return data.app;
}

export async function deleteOAuthApp(id: string): Promise<void> {
  const res = await fetch(backendUrl(`/api/developer/oauth-apps/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to delete OAuth app.'));
  }
}
