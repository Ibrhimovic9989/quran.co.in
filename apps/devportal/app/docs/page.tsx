import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, KeyRound } from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';
import { BACKEND_URL } from '@/lib/api/backend';

export const metadata: Metadata = {
  title: 'Quickstart',
  description:
    'Getting started with the quran.co.in API: base URL, authentication, rate limits, endpoints and client codegen.',
};

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
