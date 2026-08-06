// Ask (AI) developer-access requests against apps/api. Cookie-authenticated.
// The AI endpoint has real cost, so third-party use is gated behind approval.

import { backendUrl } from '@/lib/api/backend';

export type AskStatus = 'none' | 'pending' | 'approved' | 'denied';

export interface AskAccess {
  askAccess: AskStatus;
  askUseCase: string | null;
  askRequestedAt: string | null;
  askDecidedAt: string | null;
}

export interface AskRequestRow {
  id: string;
  email: string;
  name: string;
  askAccess: AskStatus;
  askUseCase: string | null;
  askRequestedAt: string | null;
  askDecidedAt: string | null;
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string; message?: string | string[] };
    if (body.error) return body.error;
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (body.message) return body.message;
  } catch {
    // non-JSON
  }
  return fallback;
}

export async function getAskAccess(): Promise<AskAccess> {
  const res = await fetch(backendUrl('/api/developer/ask-access'), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load Ask access status.'));
  return (await res.json()) as AskAccess;
}

export async function requestAskAccess(useCase: string): Promise<AskAccess> {
  const res = await fetch(backendUrl('/api/developer/ask-access'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useCase }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to submit request.'));
  return (await res.json()) as AskAccess;
}

/** Admin-only. Returns null when the caller isn't an admin (403), so the UI hides. */
export async function listAskRequests(): Promise<AskRequestRow[] | null> {
  const res = await fetch(backendUrl('/api/developer/ask-access/requests'), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (res.status === 403) return null;
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load requests.'));
  const data = (await res.json()) as { requests: AskRequestRow[] };
  return data.requests ?? [];
}

export async function decideAskAccess(
  userId: string,
  decision: 'approved' | 'denied',
): Promise<void> {
  const res = await fetch(backendUrl(`/api/developer/ask-access/${userId}/decision`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to record decision.'));
}
