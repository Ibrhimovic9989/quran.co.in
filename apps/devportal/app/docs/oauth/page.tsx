import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Lock, ShieldCheck } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';
import { BACKEND_URL } from '@/lib/api/backend';

export const metadata: Metadata = {
  title: 'OAuth 2.0 guide',
  description:
    'Add "Sign in with quran.co.in" to your app. The full OAuth 2.0 authorization-code + PKCE flow: register an app, request scopes, exchange the code, refresh tokens, and call the user-data API (bookmarks, reading history, profile).',
};

// Hosted authorization by quran.co.in (Logto under the hood).
const AUTHORIZE_URL = 'https://2jytqm.logto.app/oidc/auth';
const TOKEN_URL = 'https://2jytqm.logto.app/oidc/token';
const RESOURCE = 'https://api.quran.co.in';

const SCOPES: Array<[string, string]> = [
  ['openid', 'Required. Issues an ID token identifying the user.'],
  ['offline_access', 'Returns a refresh token for long-lived access.'],
  ['profile', 'Standard OIDC profile claims (name, picture) in the ID token.'],
  ['email', 'The user’s email address in the ID token.'],
  ['profile:read', 'Read the user’s quran.co.in profile via /api/v1/me.'],
  ['bookmarks:read', 'Read the user’s bookmarks.'],
  ['bookmarks:write', 'Create and remove the user’s bookmarks.'],
  ['history:read', 'Read the user’s reading history.'],
  ['history:write', 'Record the user’s reading history.'],
];

const USER_ENDPOINTS: Array<[string, string, string, string]> = [
  ['GET', '/api/v1/me', 'profile:read', 'The authorizing user’s profile.'],
  ['GET', '/api/v1/bookmarks', 'bookmarks:read', 'List the user’s bookmarks.'],
  [
    'POST',
    '/api/v1/bookmarks',
    'bookmarks:write',
    'Add or update a bookmark. Body: { surahNumber, ayahNumber?, note? }.',
  ],
  [
    'DELETE',
    '/api/v1/bookmarks/:surah/:ayah?',
    'bookmarks:write',
    'Remove one bookmark, or every bookmark in a surah if :ayah is omitted.',
  ],
  ['GET', '/api/v1/history', 'history:read', 'The 50 most recent reading positions.'],
  [
    'POST',
    '/api/v1/history',
    'history:write',
    'Record a reading position. Body: { surahNumber, ayahNumber? }.',
  ],
];

const NODE_EXAMPLE = `import express from 'express';
import crypto from 'node:crypto';

const app = express();

const CLIENT_ID = process.env.QURAN_CLIENT_ID;
const CLIENT_SECRET = process.env.QURAN_CLIENT_SECRET;   // server-side only
const REDIRECT_URI = 'https://your-app.com/callback';
const AUTHORIZE_URL = '${AUTHORIZE_URL}';
const TOKEN_URL = '${TOKEN_URL}';
const RESOURCE = '${RESOURCE}';
const SCOPE = 'openid offline_access profile:read bookmarks:read bookmarks:write';

const b64url = (buf) => buf.toString('base64url');
// Demo store; in production keep these in the user's session, not a Map.
const pending = new Map(); // state -> code_verifier

// 1. Send the user off to sign in + consent.
app.get('/login', (req, res) => {
  const state = b64url(crypto.randomBytes(16));
  const codeVerifier = b64url(crypto.randomBytes(32));
  const codeChallenge = b64url(
    crypto.createHash('sha256').update(codeVerifier).digest(),
  );
  pending.set(state, codeVerifier);

  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    resource: RESOURCE,                    // REQUIRED — token is for our API
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();

  res.redirect(url.toString());
});

// 2. They come back here with ?code=…&state=…
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const codeVerifier = pending.get(state);
  if (!codeVerifier) return res.status(400).send('Invalid or expired state');
  pending.delete(state);

  // 3. Exchange the code for tokens.
  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
      resource: RESOURCE,
    }),
  });
  if (!tokenRes.ok) return res.status(502).send('Token exchange failed');
  const tokens = await tokenRes.json();
  // { access_token, refresh_token, expires_in, token_type: 'Bearer' }

  // 4. Call the API on the user's behalf.
  const me = await fetch(RESOURCE + '/api/v1/me', {
    headers: { Authorization: 'Bearer ' + tokens.access_token },
  }).then((r) => r.json());

  res.json({ profile: me.user, expires_in: tokens.expires_in });
});

app.listen(3000, () => console.log('http://localhost:3000/login'));`;

const REFRESH_EXAMPLE = `curl -X POST ${TOKEN_URL} \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d grant_type=refresh_token \\
  -d client_id=YOUR_CLIENT_ID \\
  -d client_secret=YOUR_CLIENT_SECRET \\
  -d refresh_token=YOUR_REFRESH_TOKEN \\
  -d resource=${RESOURCE}`;

const BOOKMARK_WRITE_EXAMPLE = `curl -X POST ${RESOURCE}/api/v1/bookmarks \\
  -H "Authorization: Bearer ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "surahNumber": 2, "ayahNumber": 255, "note": "Ayat al-Kursi" }'`;

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-2xl font-bold tracking-tight text-ink"
    >
      {children}
    </h2>
  );
}

function methodClass(method: string): string {
  if (method === 'GET') return 'text-accent';
  if (method === 'DELETE') return 'text-red-600';
  return 'text-gold-text';
}

export default function OAuthGuidePage() {
  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/docs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Quickstart
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-accent">
        OAuth 2.0
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
        Sign in with quran.co.in
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        Let your users connect their quran.co.in account so your app can read and
        write <em>their</em> data — bookmarks, reading history and profile — with
        their explicit consent. It works exactly like “Sign in with Google”: we
        host the login and consent screen, and hand your app a scoped access
        token. Nothing here touches the user’s password.
      </p>

      {/* When to use */}
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-surface-warm p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div className="text-sm leading-relaxed text-ink-soft">
          <p className="font-semibold text-ink">API key or OAuth?</p>
          <p className="mt-1">
            Just need public Qurʼan data (text, translations, search, audio)? An{' '}
            <Link
              href="/docs#auth"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              API key
            </Link>{' '}
            is all you need — no user, no login. Reach for OAuth only when you
            need a <em>specific signed-in user’s own</em> data.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {/* Overview */}
        <section className="space-y-4">
          <Heading id="how-it-works">How it works</Heading>
          <p className="leading-relaxed text-ink-soft">
            We use the standard{' '}
            <span className="font-medium text-ink">
              authorization-code flow with PKCE
            </span>{' '}
            — the same flow used by Google, GitHub and quran.com. End to end:
          </p>
          <ol className="space-y-3">
            {[
              [
                'Register your app',
                'Once, on the OAuth apps page, to get a client_id and client_secret and to list your redirect URIs.',
              ],
              [
                'Redirect the user to authorize',
                'Your app sends them to our authorize URL with the scopes you need and a PKCE challenge.',
              ],
              [
                'The user consents',
                'They sign in and approve the scopes on the screen we host. We redirect back to your app with a one-time code.',
              ],
              [
                'Exchange the code for tokens',
                'Your server swaps the code (plus the PKCE verifier) for an access token and a refresh token.',
              ],
              [
                'Call the API',
                'Send the access token as a Bearer token to /api/v1/*. Refresh it when it expires.',
              ],
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

        {/* Endpoints */}
        <section className="space-y-4">
          <Heading id="endpoints">Endpoints</Heading>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-line">
                {[
                  ['Authorize URL', AUTHORIZE_URL],
                  ['Token URL', TOKEN_URL],
                ].map(([label, value]) => (
                  <tr key={label} className="align-top">
                    <td className="px-4 py-3 font-medium text-ink">{label}</td>
                    <td className="px-4 py-3">
                      <code className="break-all font-mono text-xs text-ink-soft">
                        {value}
                      </code>
                    </td>
                  </tr>
                ))}
                <tr className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">
                    <code className="font-mono text-xs">resource</code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="break-all font-mono text-xs text-ink-soft">
                      {RESOURCE}
                    </code>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      Pass this on <em>both</em> the authorize and token requests.
                      Without it the token is not valid for the quran.co.in API.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Scopes */}
        <section className="space-y-4">
          <Heading id="scopes">Scopes</Heading>
          <p className="leading-relaxed text-ink-soft">
            Request only what you need — the consent screen shows the user exactly
            what they are granting, and a token only works for the scopes they
            approved. Space-separate multiple scopes.
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
                {SCOPES.map(([scope, desc]) => (
                  <tr key={scope} className="align-top">
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-ink">{scope}</code>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-ink-soft">
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Register */}
        <section className="space-y-4">
          <Heading id="register">1. Register your app</Heading>
          <p className="leading-relaxed text-ink-soft">
            On the{' '}
            <Link
              href="/apps"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              OAuth apps
            </Link>{' '}
            page, register an app to receive a{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              client_id
            </code>{' '}
            and a{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              client_secret
            </code>{' '}
            (shown once). List <em>every</em> redirect URI your app will use — a
            request whose{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              redirect_uri
            </code>{' '}
            isn’t on the list is rejected.
          </p>
        </section>

        {/* Full example */}
        <section className="space-y-4">
          <Heading id="example">2. The whole flow, in Node.js</Heading>
          <p className="leading-relaxed text-ink-soft">
            A complete, copy-pasteable Express server: it generates the PKCE pair,
            sends the user to authorize, handles the callback, exchanges the code,
            and calls the API as the user. Swap in your own session store for the
            demo <code className="font-mono text-[0.85em]">Map</code>.
          </p>
          <CodeBlock label="server.js" code={NODE_EXAMPLE} />
        </section>

        {/* Refresh */}
        <section className="space-y-4">
          <Heading id="refresh">3. Refresh the access token</Heading>
          <p className="leading-relaxed text-ink-soft">
            Access tokens are short-lived. If you requested{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              offline_access
            </code>
            , you got a refresh token — trade it for a fresh access token without
            sending the user through sign-in again.
          </p>
          <CodeBlock label="Refresh token" code={REFRESH_EXAMPLE} />
        </section>

        {/* User-data API */}
        <section className="space-y-4">
          <Heading id="user-api">4. The user-data API</Heading>
          <p className="leading-relaxed text-ink-soft">
            Every endpoint below is authorized by the user’s access token (
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              Authorization: Bearer …
            </code>
            ) and gated on the scope shown. All live under{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              {RESOURCE}
            </code>
            .
          </p>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-warm text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Path</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                    Scope
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {USER_ENDPOINTS.map(([method, path, scope, desc]) => (
                  <tr key={method + path} className="align-top">
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-xs font-semibold ${methodClass(method)}`}
                      >
                        {method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-ink">{path}</code>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                        {desc}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <code className="font-mono text-xs text-ink-soft">
                        {scope}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pt-1 text-sm leading-relaxed text-ink-soft">
            Example — bookmark Ayat al-Kursī for the signed-in user:
          </p>
          <CodeBlock label="Write a bookmark" code={BOOKMARK_WRITE_EXAMPLE} />
        </section>

        {/* Errors */}
        <section className="space-y-4">
          <Heading id="errors">Error responses</Heading>
          <div className="overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-warm text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Meaning &amp; fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  [
                    '401',
                    'Missing, malformed or expired access token. Refresh it (or re-authorize) and retry.',
                  ],
                  [
                    '403',
                    'The token is valid but lacks a required scope (e.g. writing a bookmark with only bookmarks:read). Request the right scope at authorize time.',
                  ],
                  [
                    '400',
                    'Bad request body — e.g. a missing surahNumber when creating a bookmark.',
                  ],
                  [
                    '429',
                    'Rate limited. Back off using the X-RateLimit-* headers, then retry.',
                  ],
                ].map(([code, meaning]) => (
                  <tr key={code} className="align-top">
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs font-semibold text-ink">
                        {code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-ink-soft">
                      {meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-4">
          <Heading id="security">Security checklist</Heading>
          <ul className="space-y-3">
            {[
              'Keep the client_secret on your server only. For mobile apps and SPAs (public clients), rely on PKCE and don’t ship a secret.',
              'Always use PKCE (code_challenge_method=S256) — it’s required here, not optional.',
              'Generate a random state per request and verify it on the callback to prevent CSRF.',
              'Store tokens server-side or in secure storage — never in localStorage for a web app.',
              'Request the narrowest set of scopes your feature needs; add more only when you use them.',
            ].map((tip) => (
              <li key={tip} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/apps"
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card transition-colors hover:bg-line-soft"
          >
            <div>
              <p className="font-semibold text-ink">Register an app</p>
              <p className="text-sm text-ink-soft">
                Get your client_id and secret.
              </p>
            </div>
            <ArrowLeft className="h-5 w-5 shrink-0 rotate-180 text-accent" />
          </Link>
          <a
            href={`${BACKEND_URL}/api/docs`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 shadow-card transition-colors hover:bg-line-soft"
          >
            <div>
              <p className="font-semibold text-ink">Full API reference</p>
              <p className="text-sm text-ink-soft">
                Interactive Swagger for every endpoint.
              </p>
            </div>
            <ExternalLink className="h-5 w-5 shrink-0 text-accent" />
          </a>
        </section>
      </div>
    </div>
  );
}
