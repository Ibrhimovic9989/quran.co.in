# quran.co.in — Developer Portal

The public developer front door for the **quran.co.in API**. A Next.js app that
lets developers learn the API, sign in with Google, and create / revoke their
own API keys. It talks to the existing NestJS backend at `api.quran.co.in` — it
is purely additive and does not touch any other app in the monorepo.

Pages:

- `/` — landing: what the API is, a keyless quickstart, features, "how keys work".
- `/dashboard` — auth-gated key management (create with one-time reveal, list, revoke).
- `/docs` — quickstart guide: base URL, auth, key lifecycle, rate limits, endpoints, codegen.

## Develop

From the monorepo root:

```bash
npm run dev:devportal      # next dev
npm run build:devportal    # next build
```

Or inside `apps/devportal`: `npm run dev`.

Create a local `.env` from `.env.example`. By default it points at the deployed
API (`https://api.quran.co.in`); set `NEXT_PUBLIC_API_URL=http://localhost:3001`
to run against a local backend.

## Deploy (Vercel)

- **New Vercel project**, Root Directory = `apps/devportal`.
- Framework preset: Next.js (auto-detected).
- Env var: `NEXT_PUBLIC_API_URL=https://api.quran.co.in`.
- Domain: `developers.quran.co.in`.

The auth cookie is issued on the `.quran.co.in` parent domain, so it is sent
automatically on this subdomain — no token handling is needed in the portal.

## Backend prerequisites (apps/api)

For credentialed auth + key management to work from this subdomain, the backend
must allow it:

1. **CORS** — the API's `WEB_ORIGIN` env (comma-separated allowed origins for
   credentialed CORS) must include `https://developers.quran.co.in`.
2. **Google OAuth redirect** — the OAuth flow must be permitted to return to the
   portal, i.e. `https://developers.quran.co.in/dashboard` (and `/`) must be an
   accepted `redirect` target for `GET /api/auth/google?redirect=…`.

No backend code changes are required beyond these configuration/allow-list
entries.
