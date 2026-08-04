# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately through GitHub's **"Report a vulnerability"** button on
the repository's **Security** tab (Security → Advisories → Report a vulnerability).
This opens a private advisory visible only to you and the maintainers.

Include, as best you can:

- what the issue is and where (endpoint, file, or flow),
- steps to reproduce or a proof of concept,
- the impact you think it has.

We'll acknowledge your report, work on a fix, and credit you when the fix ships
(unless you'd prefer to stay anonymous).

## What's in scope

- The web app (`apps/web`), API (`apps/api`), and mobile app (`apps/mobile`).
- Authentication, session/cookie handling, and the API's authorization.
- Anything that could expose user data or allow abuse of the service.

## Not secrets in the repo

Credentials, API keys, and database URLs are **never** committed here — they live
only in each deployment's environment. If you believe you've found a secret in
the code or git history, treat it as a vulnerability and report it privately so we
can rotate it.
