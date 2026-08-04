# Contributing to Quran.co.in

Thank you for wanting to help. This project is free and open —
built as ṣadaqah jāriyah — and every improvement is welcome, from a typo fix to
a whole new lesson in the Learn-to-Read engine.

## How changes land

The `main` branch is **protected**. Nobody pushes to it directly; every change
goes through a pull request that a maintainer reviews and merges. As an external
contributor you already can't push to the repo — you fork it, and open a PR from
your fork. That's the whole model.

1. **Fork** this repository and clone your fork.
2. Create a branch off `main`: `git checkout -b fix/short-description`.
3. Make your change.
4. Push to your fork and open a **pull request** against `main`.
5. A maintainer ([CODEOWNERS](.github/CODEOWNERS)) reviews; once approved, they merge.

Keep pull requests focused — one logical change per PR is easiest to review.

## Running it locally

No secrets are shipped in this repo, and you don't need ours. The read-only
Qurʾān endpoints work without any keys; auth and AI features need your own.

```bash
npm install                 # workspace install (root)
npm run db:generate         # generate the shared Prisma client

cp apps/api/.env.example apps/api/.env      # fill in what you have (or leave AI/auth blank)
npm run dev:api             # NestJS on :3001
npm run dev:web             # Next.js on :3000  (needs apps/web/.env.local with NEXT_PUBLIC_API_URL)
```

The Flutter app is in `apps/mobile` (`flutter run`), and points at
`https://api.quran.co.in` by default.

## Repo layout

| Path | What |
|------|------|
| `apps/web` | Next.js frontend |
| `apps/api` | NestJS backend (data, auth, AI) |
| `apps/mobile` | Flutter app |
| `packages/database` | Prisma schema + migrations |

## Style & checks

- Match the surrounding code — naming, formatting, comment density.
- Web/API: `npx tsc --noEmit` should stay green. Mobile: `flutter analyze` clean.
- Content touching the Qurʾān text, transliteration, tajwīd, or lesson data must
  be **accurate**. When in doubt, cite your source in the PR. Correctness of the
  sacred text is non-negotiable.
- Two mirrored data files (web `.ts` ⇄ mobile `.dart`, e.g. the Learn and Maqāmāt
  lessons) must be kept in sync — change both.

## Reporting bugs & ideas

Open an issue. For anything security-sensitive, **do not** open a public issue —
see [SECURITY.md](SECURITY.md).

By contributing, you agree your contributions are licensed under the project's
[Apache 2.0 License](LICENSE).
