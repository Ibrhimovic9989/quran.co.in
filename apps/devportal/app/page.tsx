import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Gauge,
  KeyRound,
  Sparkles,
  FileJson,
  Zap,
} from 'lucide-react';
import { CodeBlock } from '@/components/ui/code-block';
import { BACKEND_URL } from '@/lib/api/backend';

const QUICKSTART = `# No key required for public reads
curl ${BACKEND_URL}/api/quran/surahs

# Fetch every ayah of Al-Fātiḥah
curl ${BACKEND_URL}/api/quran/surah/1/ayahs`;

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Free and public',
    body: 'The core read endpoints need no key at all. Sign in only when you want a higher rate-limit tier for production traffic.',
  },
  {
    icon: BookOpen,
    title: 'The whole Qurʾān',
    body: 'All 114 surahs and 6,236 ayahs, with translations, transliteration and audio — the same data that powers quran.co.in.',
  },
  {
    icon: FileJson,
    title: 'OpenAPI spec',
    body: 'A live Swagger UI and a machine-readable docs-json feed, so you can generate a typed client in the language of your choice.',
  },
  {
    icon: Gauge,
    title: 'Generous limits',
    body: 'Keyless requests are rate-limited fairly; an API key lifts you to 600 requests per minute with per-key usage tracking.',
  },
];

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Public REST API · free to use
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Build with the{' '}
              <span className="text-accent">Qurʾān API</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              A clean, fast REST API for the Holy Qurʾān — surahs, ayahs,
              translations, transliteration and audio. Start with keyless public
              reads, then grab an API key when you are ready to ship. This is the
              same backend that serves{' '}
              <a
                href="https://quran.co.in"
                className="text-accent underline-offset-2 hover:underline"
              >
                quran.co.in
              </a>
              .
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-accent-strong"
              >
                <KeyRound className="h-4 w-4" />
                Get an API key
              </Link>
              <a
                href={`${BACKEND_URL}/api/docs`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
              >
                API reference
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <CodeBlock label="Quickstart · curl" code={QUICKSTART} />
            <p className="mt-3 text-center text-sm text-muted">
              Copy, paste, run. No signup needed to try it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-line bg-surface p-6 shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How keys work ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface-warm shadow-card">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                How API keys work
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Public read endpoints work with no key. When you need production
                throughput, create a key from your dashboard and send it as an{' '}
                <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
                  X-API-Key
                </code>{' '}
                header. Keys are tied to your Google account, tracked per-key,
                and revocable at any time.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-soft">
                {[
                  'Sign in with Google — no separate account to create.',
                  'Create a named key; the secret is shown exactly once.',
                  'Send it as X-API-Key for the 600 req/min tier.',
                  'Revoke a key instantly if it ever leaks.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
                >
                  Read the quickstart
                </Link>
              </div>
            </div>

            <CodeBlock
              label="Authenticated request"
              code={`curl ${BACKEND_URL}/api/quran/surah/2/ayahs \\
  -H "X-API-Key: qk_live_your_key_here"

# Response headers include your quota:
#   X-RateLimit-Limit: 600
#   X-RateLimit-Remaining: 599
#   X-RateLimit-Reset: 1712345678`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
