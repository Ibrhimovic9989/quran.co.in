// Base URL for the quran.co.in NestJS backend (apps/api).
//
// The portal talks to the same /api/... surface the main web app uses.
// NEXT_PUBLIC_ makes it available in client components (inlined at build time).
//
// Local dev: http://localhost:3001 — Production: https://api.quran.co.in

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'https://api.quran.co.in';

export function backendUrl(path: string): string {
  return `${BACKEND_URL}${path}`;
}
