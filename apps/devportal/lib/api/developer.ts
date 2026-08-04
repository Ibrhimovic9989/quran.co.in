// Developer API-key management against apps/api.
// Every call is cookie-authenticated (credentials: 'include').

import { backendUrl } from '@/lib/api/backend';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes?: string; // space/comma-separated, e.g. "quran:read"
  tier: string;
  revoked: boolean;
  requestCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateKeyResult {
  apiKey: string; // plaintext qk_live_… — returned ONCE
  warning?: string;
  client?: Record<string, unknown>;
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

export async function listKeys(): Promise<ApiKey[]> {
  const res = await fetch(backendUrl('/api/developer/keys'), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to load API keys.'));
  }
  const data = (await res.json()) as { keys: ApiKey[] };
  return data.keys ?? [];
}

export async function createKey(name: string): Promise<CreateKeyResult> {
  const res = await fetch(backendUrl('/api/developer/keys'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to create API key.'));
  }
  return (await res.json()) as CreateKeyResult;
}

export async function revokeKey(id: string): Promise<void> {
  const res = await fetch(backendUrl(`/api/developer/keys/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(await parseError(res, 'Failed to revoke API key.'));
  }
}
