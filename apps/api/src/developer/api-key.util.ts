// API-key generation & hashing. We store only the SHA-256 hash of a key; the
// plaintext is shown to the developer exactly once, at creation.

import { createHash, randomBytes } from 'node:crypto';

const KEY_PREFIX = 'qk_live_';

export interface GeneratedKey {
  key: string; // the full plaintext key — return to the user once, never store
  hash: string; // sha256(key) — stored
  prefix: string; // first chars, safe to store/display for identification
}

export function generateApiKey(): GeneratedKey {
  const secret = randomBytes(24).toString('hex'); // 48 hex chars
  const key = `${KEY_PREFIX}${secret}`;
  return { key, hash: hashApiKey(key), prefix: key.slice(0, 16) };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key.trim()).digest('hex');
}

export function looksLikeApiKey(value: string): boolean {
  return value.startsWith(KEY_PREFIX);
}
