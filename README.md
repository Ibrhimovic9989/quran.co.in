# Quran.co.in

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-0F6B4F.svg)](LICENSE)

Open-source monorepo for quran.co.in — a modern Qurʾān platform: read all 114
sūrahs with translations and audio, AI-powered Ask (RAG over pgvector), semantic
search, bookmarks, reading history, a personalised verse of the day, and a
teaching ladder — **Tajwīd Mode**, **Maqāmāt** (melodic modes), and a
**Noorani-Qāʿidah "Learn to Read"** engine — on both web and native mobile.

Built as ṣadaqah jāriyah: free, and open for anyone to learn from, self-host, or
build on. Contributions are welcome — see [Contributing](#contributing).

## Architecture

```
apps/
  web/          Next.js 16 frontend (Vercel) — UI, SSR, OG images, sitemap
  api/          NestJS backend (Render)      — data, auth, AI; serves web + mobile
  mobile/       Flutter app (Android/iOS)    — native client over the same API
packages/
  database/     Shared Prisma schema + migrations (Supabase Postgres + pgvector)
```

- **One API for all clients.** The web app and (future) Flutter app call the
  same REST API. OpenAPI docs at `/api/docs`, spec at `/api/docs-json`
  (Flutter codegen: `openapi-generator -i .../api/docs-json -g dart-dio`).
- **Auth**: Google OAuth owned by the API. Web gets httpOnly cookies
  (`Domain=.quran.co.in`); mobile exchanges a Google ID token for a Bearer JWT
  at `POST /api/auth/google/mobile`. One guard accepts both.
- **AI on free tier**: chat runs through a fallback chain (NVIDIA NIM
  auto-discovered models → OpenRouter `:free` → optional Azure) with
  per-provider cooldowns; embeddings use NVIDIA `llama-nemotron-embed-1b-v2`
  (2048-dim, halfvec HNSW). Search degrades to Postgres full-text if every
  provider is down.

## Development

```bash
npm install                 # workspace install (root)
npm run db:generate         # generate the shared Prisma client

npm run dev:api             # NestJS on :3001  (needs apps/api/.env — see .env.example)
npm run dev:web             # Next.js on :3000 (needs apps/web/.env.local)
```

Web finds the API via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

### Database

Schema lives in `packages/database/prisma/schema.prisma`. pgvector migrations
(HNSW indexes, embeddings v2 tables) are applied manually:

```bash
npx dotenv -e apps/api/.env -- npx prisma db execute \
  --schema packages/database/prisma/schema.prisma \
  --file packages/database/prisma/migrations/<file>.sql
```

Maintenance scripts (run from `apps/api/`):

- `node scripts/sync-quran.mjs` — (re)seed surahs + ayahs from the external API
- `node scripts/re-embed-nvidia.mjs verses|tafsir|all` — rebuild the embedding corpus

## Deployment

**API → Render** (blueprint in `render.yaml`):
1. New Blueprint → point at this repo. Set `DATABASE_URL`, `DIRECT_URL`,
   `NVIDIA_API_KEY`, `OPENROUTER_API_KEY` (+ Google/JWT vars from
   `apps/api/.env.example`) in the dashboard.
2. Custom domain `api.quran.co.in`; set `WEB_ORIGIN=https://quran.co.in`,
   `WEB_URL=https://quran.co.in`, `COOKIE_DOMAIN=.quran.co.in`,
   `GOOGLE_REDIRECT_URI=https://api.quran.co.in/api/auth/google/callback`.
3. Add that redirect URI to the Google OAuth client (Cloud Console →
   Credentials → Authorized redirect URIs).

**Web → Vercel**:
1. Project setting **Root Directory: `apps/web`**.
2. Env var `NEXT_PUBLIC_API_URL=https://api.quran.co.in`.

## Contributing

We'd love your help. The `main` branch is protected — **all changes land through
pull requests**, and only maintainers merge.

1. **Fork** the repo and create a branch off `main`.
2. Copy the `.env.example` files (no secrets are shipped — bring your own keys,
   or run the read-only Qurʾān endpoints without any).
3. Make your change; keep it in the style of the surrounding code.
4. Open a **pull request**. A maintainer (see [CODEOWNERS](.github/CODEOWNERS))
   will review.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide and
[SECURITY.md](SECURITY.md) to report a vulnerability privately.

## License

Licensed under the **Apache License 2.0** — see [LICENSE](LICENSE). You are free
to use, modify, and redistribute, including commercially, with attribution and
the patent grant Apache 2.0 provides.

Secrets, credentials, and production data are **never** in this repository; they
live only in each deployment's environment. The code here is the whole project —
what runs in production builds from it.

## History

The project began as a single full-stack Next.js app; the backend was split
into NestJS (branch `feat/nestjs-backend-split`) so one API can serve web and
mobile. NextAuth and Azure OpenAI were retired in the process.
