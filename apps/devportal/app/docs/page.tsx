import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, KeyRound } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';
import { BACKEND_URL } from '@/lib/api/backend';

export const metadata: Metadata = {
  title: 'Quickstart',
  description:
    'Getting started with the quran.co.in API: base URL, authentication, OAuth 2.0, rate limits, endpoints and client codegen.',
};

// OAuth 2.0 — hosted authorization by quran.co.in (Logto).
const OAUTH_AUTHORIZE_URL = 'https://2jytqm.logto.app/oidc/auth';
const OAUTH_TOKEN_URL = 'https://2jytqm.logto.app/oidc/token';
const OAUTH_RESOURCE = 'https://api.quran.co.in';
const OAUTH_SCOPES = [
  ['openid', 'Required. Issues an ID token identifying the user.'],
  ['profile', 'Basic profile claims (name, picture).'],
  ['email', 'The user’s email address.'],
  ['offline_access', 'Returns a refresh token for long-lived access.'],
  ['bookmarks:read', 'Read the user’s bookmarks.'],
  ['bookmarks:write', 'Create and remove the user’s bookmarks.'],
  ['history:read', 'Read the user’s reading history.'],
  ['history:write', 'Record the user’s reading history.'],
  ['profile:read', 'Read the user’s quran.co.in profile.'],
];

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/quran/surahs',
    desc: 'List all 114 surahs with metadata (name, revelation place, ayah count).',
    keyed: false,
  },
  {
    method: 'GET',
    path: '/api/quran/surah/:id/ayahs',
    desc: 'Every ayah of a surah (1–114) with Arabic text, translation and transliteration.',
    keyed: false,
  },
  {
    method: 'POST',
    path: '/api/developer/keys',
    desc: 'Create a new API key. The plaintext secret is returned once. Requires sign-in.',
    keyed: true,
  },
  {
    method: 'GET',
    path: '/api/developer/keys',
    desc: 'List your keys with usage counts and status. Requires sign-in.',
    keyed: true,
  },
  {
    method: 'DELETE',
    path: '/api/developer/keys/:id',
    desc: 'Revoke a key immediately. Requires sign-in.',
    keyed: true,
  },
];

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-2xl font-bold tracking-tight text-ink"
    >
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">
        Quickstart
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
        Getting started
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        Everything you need to make your first call and move to production. The
        full, always-current schema lives in the{' '}
        <a
          href={`${BACKEND_URL}/api/docs`}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline-offset-2 hover:underline"
        >
          interactive API reference
        </a>
        .
      </p>

      <div className="mt-12 space-y-14">
        {/* Base URL */}
        <section className="space-y-4">
          <SectionHeading id="base-url">Base URL</SectionHeading>
          <p className="leading-relaxed text-ink-soft">
            All endpoints are served from a single host. Every path below is
            relative to it.
          </p>
          <CodeBlock label="Base URL" code={BACKEND_URL} />
        </section>

        {/* Auth */}
        <section className="space-y-4">
          <SectionHeading id="auth">Authentication</SectionHeading>
          <p className="leading-relaxed text-ink-soft">
            Public read endpoints need no authentication. For a higher rate-limit
            tier, pass your API key in the{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              X-API-Key
            </code>{' '}
            request header. Keys look like{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              qk_live_…
            </code>
            .
          </p>
          <CodeBlock
            label="With an API key"
            code={`curl ${BACKEND_URL}/api/quran/surahs \\
  -H "X-API-Key: qk_live_your_key_here"`}
          />
          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-warm p-4 text-sm text-ink-soft">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              Create and manage keys from your{' '}
              <Link
                href="/dashboard"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                dashboard
              </Link>
              . Treat a key like a password — never commit it to source control
              or expose it in client-side code.
            </span>
          </div>
        </section>

        {/* Key lifecycle */}
        <section className="space-y-4">
          <SectionHeading id="key-lifecycle">Key lifecycle</SectionHeading>
          <ol className="space-y-3">
            {[
              ['Create', 'POST /api/developer/keys with a { name }. The plaintext key is returned exactly once — copy it immediately.'],
              ['Use', 'Send the key as the X-API-Key header. Each request increments that key’s usage counter.'],
              ['Rotate', 'Create a second key, switch your app over, then revoke the old one — zero downtime.'],
              ['Revoke', 'DELETE /api/developer/keys/:id disables the key at once. Revoked keys stay listed for your records.'],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* OAuth 2.0 */}
        <section className="space-y-4">
          <SectionHeading id="oauth">
            OAuth 2.0 (act on a user&apos;s behalf)
          </SectionHeading>
          <p className="leading-relaxed text-ink-soft">
            API keys authenticate <em>your</em> app for public data. To read or
            write a <em>user&apos;s</em> own data — their bookmarks, reading
            history and profile — use OAuth 2.0. Your app sends the user to a
            sign-in and consent screen hosted by us; once they approve, you
            receive an access token scoped to exactly what they granted. We use
            the standard{' '}
            <span className="font-medium text-ink">
              authorization code flow with PKCE
            </span>
            , the same flow quran.com uses.
          </p>

          <Link
            href="/docs/oauth"
            className="flex items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent-soft p-5 transition-colors hover:opacity-90"
          >
            <div>
              <p className="font-semibold text-ink">
                Read the full OAuth 2.0 guide →
              </p>
              <p className="text-sm text-ink-soft">
                Complete Node.js walkthrough, refresh tokens, the user-data API
                (bookmarks, history, profile) and error handling.
              </p>
            </div>
          </Link>

          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-line">
                <tr className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    Authorize URL
                  </td>
                  <td className="px-4 py-3">
                    <code className="break-all font-mono text-xs text-ink-soft">
                      {OAUTH_AUTHORIZE_URL}
                    </code>
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">Token URL</td>
                  <td className="px-4 py-3">
                    <code className="break-all font-mono text-xs text-ink-soft">
                      {OAUTH_TOKEN_URL}
                    </code>
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    <code className="font-mono text-xs">resource</code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="break-all font-mono text-xs text-ink-soft">
                      {OAUTH_RESOURCE}
                    </code>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      Required. Without this parameter the token is not valid for
                      the quran.co.in API.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="leading-relaxed text-ink-soft">
            First,{' '}
            <Link
              href="/apps"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              register an app
            </Link>{' '}
            to get a{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              client_id
            </code>{' '}
            and{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              client_secret
            </code>
            , listing every redirect URI your app will use.
          </p>

          <h3 className="pt-2 text-base font-semibold text-ink">
            Scopes
          </h3>
          <p className="leading-relaxed text-ink-soft">
            Request only what you need — the consent screen shows the user
            exactly what they are granting. Space-separate multiple scopes.
          </p>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-warm text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Scope</th>
                  <th className="px-4 py-3 font-semibold">Grants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {OAUTH_SCOPES.map(([scope, desc]) => (
                  <tr key={scope} className="align-top">
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-ink">
                        {scope}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-ink-soft">
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="pt-2 text-base font-semibold text-ink">
            The flow, step by step
          </h3>
          <ol className="space-y-3">
            {[
              [
                'Register',
                'Register an app on /apps. You receive a client_id and a client_secret (shown once). Add the redirect URIs your app returns to.',
              ],
              [
                'Redirect to authorize',
                'Send the user to the authorize URL with client_id, redirect_uri, response_type=code, your scope, resource=https://api.quran.co.in, a PKCE code_challenge with code_challenge_method=S256, and a random state you can verify on return.',
              ],
              [
                'User consents',
                'The user logs in and approves the requested scopes on the sign-in and consent screen we host. We redirect back to your redirect_uri with a one-time code and your state.',
              ],
              [
                'Exchange the code',
                'POST the code to the token URL along with your code_verifier and client credentials to receive an access_token and (with offline_access) a refresh_token.',
              ],
              [
                'Call the API',
                'Send the access token as a Bearer token, e.g. GET https://api.quran.co.in/api/v1/me. When it expires, use the refresh token to get a new one.',
              ],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="pt-2 text-base font-semibold text-ink">
            1. Send the user to authorize
          </h3>
          <CodeBlock
            label="Authorize URL"
            code={`${OAUTH_AUTHORIZE_URL}?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https%3A%2F%2Fyour-app.com%2Fcallback
  &scope=openid%20profile%20email%20offline_access%20bookmarks%3Aread%20bookmarks%3Awrite
  &resource=${encodeURIComponent(OAUTH_RESOURCE)}
  &code_challenge=BASE64URL_SHA256_OF_YOUR_VERIFIER
  &code_challenge_method=S256
  &state=A_RANDOM_UNGUESSABLE_STRING`}
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            Generate a high-entropy{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              code_verifier
            </code>
            , derive{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              code_challenge = BASE64URL(SHA256(code_verifier))
            </code>
            , and keep the verifier for the token exchange. Line breaks above are
            only for readability — send it as a single URL.
          </p>

          <h3 className="pt-2 text-base font-semibold text-ink">
            2. Exchange the code for tokens
          </h3>
          <CodeBlock
            label="Token exchange"
            code={`curl -X POST ${OAUTH_TOKEN_URL} \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d grant_type=authorization_code \\
  -d client_id=YOUR_CLIENT_ID \\
  -d client_secret=YOUR_CLIENT_SECRET \\
  -d redirect_uri=https://your-app.com/callback \\
  -d code=CODE_FROM_THE_REDIRECT \\
  -d code_verifier=YOUR_PKCE_VERIFIER \\
  -d resource=${OAUTH_RESOURCE}`}
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            The response contains an{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              access_token
            </code>
            , its{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              expires_in
            </code>
            , and — if you requested{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              offline_access
            </code>{' '}
            — a{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              refresh_token
            </code>
            .
          </p>

          <h3 className="pt-2 text-base font-semibold text-ink">
            3. Call the API on the user&apos;s behalf
          </h3>
          <CodeBlock
            label="Authenticated request"
            code={`curl ${OAUTH_RESOURCE}/api/v1/me \\
  -H "Authorization: Bearer ACCESS_TOKEN"`}
          />
          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-warm p-4 text-sm text-ink-soft">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              Keep the{' '}
              <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
                client_secret
              </code>{' '}
              on your server only. For public clients (mobile, SPA) rely on PKCE
              and omit the secret. Manage your apps and redirect URIs from the{' '}
              <Link
                href="/apps"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                OAuth apps
              </Link>{' '}
              page.
            </span>
          </div>
        </section>

        {/* Rate limits */}
        <section className="space-y-4">
          <SectionHeading id="rate-limits">Rate limits</SectionHeading>
          <p className="leading-relaxed text-ink-soft">
            Keyless requests share a fair public limit. An API key raises you to
            the 600 requests-per-minute tier. Every response carries your current
            quota in standard headers, so you can back off gracefully.
          </p>
          <CodeBlock
            label="Rate-limit headers"
            code={`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 597
X-RateLimit-Reset: 1712345678   # unix seconds until the window resets`}
          />
          <p className="text-sm leading-relaxed text-ink-soft">
            When you exceed the limit the API responds with HTTP{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              429 Too Many Requests
            </code>
            . Wait until the reset time, then retry.
          </p>
        </section>

        {/* Endpoints */}
        <section className="space-y-4">
          <SectionHeading id="endpoints">Endpoints</SectionHeading>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-warm text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Path</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Auth
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ENDPOINTS.map((e) => (
                  <tr key={e.method + e.path} className="align-top">
                    <td className="px-4 py-3">
                      <span
                        className={
                          e.method === 'GET'
                            ? 'font-mono text-xs font-semibold text-accent'
                            : e.method === 'DELETE'
                              ? 'font-mono text-xs font-semibold text-red-600'
                              : 'font-mono text-xs font-semibold text-gold-text'
                        }
                      >
                        {e.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-ink">
                        {e.path}
                      </code>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                        {e.desc}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted sm:table-cell">
                      {e.keyed ? 'Sign-in' : 'Public'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Codegen */}
        <section className="space-y-4">
          <SectionHeading id="codegen">Generate a client</SectionHeading>
          <p className="leading-relaxed text-ink-soft">
            The API ships an OpenAPI (Swagger) document. Point any generator at
            the{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              docs-json
            </code>{' '}
            feed to produce a typed client in your language of choice.
          </p>
          <CodeBlock
            label="openapi-generator"
            code={`# Example: a TypeScript-fetch client
openapi-generator-cli generate \\
  -i ${BACKEND_URL}/api/docs-json \\
  -g typescript-fetch \\
  -o ./quran-client`}
          />
        </section>

        {/* Reference CTA */}
        <section>
          <a
            href={`${BACKEND_URL}/api/docs`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card transition-colors hover:bg-line-soft"
          >
            <div>
              <p className="font-semibold text-ink">
                Explore the full API reference
              </p>
              <p className="text-sm text-ink-soft">
                Interactive Swagger UI with every endpoint, schema and example.
              </p>
            </div>
            <ExternalLink className="h-5 w-5 shrink-0 text-accent" />
          </a>
        </section>
      </div>
    </div>
  );
}
