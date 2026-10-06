# Contributing

Contributions to the web and Flutter apps are welcome. The current backend and
developer console are maintained separately in a private repository.

Fork this repository, branch from `main`, make a focused change, and open a pull
request. Maintainers review and merge changes after the required checks pass.
Administrators also follow the branch requirements. Opening a PR does not grant
push access. Report bugs and ideas through issues; report vulnerabilities
privately following [SECURITY.md](SECURITY.md).

## Web development

Use Node.js 22 or later, from the repository root:

```sh
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run dev:web
```

The example uses the hosted API. No database or production secrets are required.
Validate with `npm run build:web`, including TypeScript checks. Hosted auth, AI,
and quotas remain subject to service access rules; forking does not grant
unrestricted service access.

## Mobile development

Use Flutter with Dart 3.12.2 or later:

```sh
cd apps/mobile
flutter pub get
flutter analyze
flutter run
```

The API defaults to `https://api.quran.co.in`; use `--dart-define=API_BASE=...`
for a compatible alternative backend.

## Content and licenses

Match existing conventions and keep mirrored lesson files in sync. Quran text,
transliteration, tajweed, and lesson changes must cite their source and preserve
accuracy. Pitch feedback must not be presented as pronunciation certification.
Never commit secrets, user data, database exports, or signing keys.

Contributions use [Apache-2.0](LICENSE). Third-party content retains its own
terms; consult [THIRD_PARTY.md](THIRD_PARTY.md).
