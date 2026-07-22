// Base URL for the dedicated NestJS backend (apps/api).
//
// The backend serves the same /api/... paths the old in-process Next.js routes
// did, so call sites only prepend this host. NEXT_PUBLIC_ makes it available
// in client components (inlined at build time).
//
// Local dev: http://localhost:3001 — Production: https://api.quran.co.in

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001';

export function backendUrl(path: string): string {
  return `${BACKEND_URL}${path}`;
}
