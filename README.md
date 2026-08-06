# Quran.co.in

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-0F6B4F.svg)](LICENSE)

Open-source frontend + mobile for quran.co.in — a modern Qurʾān platform: read
all 114 sūrahs with translations and audio, AI-powered Ask (RAG), semantic
search, bookmarks, reading history, a personalised verse of the day, and a
teaching ladder — **Tajwīd Mode**, **Maqāmāt** (melodic modes), and a
**Noorani-Qāʿidah "Learn to Read"** engine — on both web and native mobile.

Built as ṣadaqah jāriyah: free, and open for anyone to learn from, self-host, or
build on. Contributions are welcome — see [Contributing](#contributing).

## Architecture

```
apps/
  web/       Next.js 16 frontend (Vercel)  — UI, SSR, OG images, sitemap
  mobile/    Flutter app (Android/iOS)     — native client over the same API
```

Both clients talk to the **public API** at `https://api.quran.co.in` over HTTP
(`NEXT_PUBLIC_API_URL`). This repo has **no database access and holds no
secrets** — it's a pure client of the API.

> **Backend & developer console** — the NestJS API, the credential-issuing
> developer console, and the Prisma schema live in a **separate private repo**.
> This mirrors the split Quran.com uses (open frontends/SDKs, closed backend +
> console): the API itself is public to use and documented below, but its
> source and the account/credential tooling are kept private. Nothing here
> depends on them beyond the HTTP API.

## Development

```bash
npm install                 # workspace install (root)
npm run dev:web             # Next.js on :3000 (needs apps/web/.env.local)
```

The web app finds the API via `NEXT_PUBLIC_API_URL` (default
`https://api.quran.co.in`). No local backend or database is required to run the
frontend — it uses the live public API.

The Flutter app lives in `apps/mobile` (`flutter run`); it points at the same
API base URL.

## Deployment

**Web → Vercel**:
1. Project setting **Root Directory: `apps/web`**.
2. Env var `NEXT_PUBLIC_API_URL=https://api.quran.co.in`.

## Public API

The same API that powers our apps is open for developers to build on.

- **Base URL:** `https://api.quran.co.in`
- **Developer portal:** [`developers.quran.co.in`](https://developers.quran.co.in)
  (guides + OAuth 2.0); console at
  [`console.developers.quran.co.in`](https://console.developers.quran.co.in).
- **Docs:** Swagger UI at [`/api/docs`](https://api.quran.co.in/api/docs); OpenAPI
  spec at `/api/docs-json` (generate a client with e.g.
  `openapi-generator generate -i https://api.quran.co.in/api/docs-json -g <lang>`).

**Reading the Qurʾān needs no key** — the read endpoints are public:

```bash
curl https://api.quran.co.in/api/quran/surahs
curl https://api.quran.co.in/api/quran/surah/1/ayahs
```

**Get an API key** for a higher, identified rate tier: sign in on quran.co.in,
create a key in the console, then send it as `X-API-Key`:

```bash
curl https://api.quran.co.in/api/quran/surah/1/ayahs -H 'X-API-Key: qk_live_...'
```

**Act on a user's behalf** (their bookmarks, history, profile) via OAuth 2.0 —
see the [OAuth guide](https://developers.quran.co.in/docs/oauth). The AI **Ask**
endpoint is gated (sign-in for the site; owner approval for the API).

> Build something beautiful with it. Attribution to quran.co.in is appreciated
> but not required.

## Contributing

We'd love your help with the **frontend and mobile** apps in this repo. The
`main` branch is protected — **all changes land through pull requests**, and
only maintainers merge.

1. **Fork** the repo and create a branch off `main`.
2. Copy `apps/web/.env.example`; the frontend runs against the live public API,
   so no secrets are needed.
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
live only in each deployment's environment.

## History

The project began as a single full-stack Next.js app; the backend was split
into a NestJS API so one API can serve web and mobile. The backend and developer
console later moved to a private repository, leaving this repo as the
open-source frontend + mobile client of the public API.
