'use client';

import Link from 'next/link';
import { ArrowRight, Blocks, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// A small "which credential do I need?" explainer shown on both console pages.
// API keys and OAuth apps answer different questions — this makes the choice
// obvious and links the two pages together. `current` highlights the page
// you're on and turns the other into a link.
type AuthKind = 'keys' | 'oauth';

const ITEMS: Array<{
  kind: AuthKind;
  href: string;
  icon: typeof KeyRound;
  title: string;
  blurb: string;
}> = [
  {
    kind: 'keys',
    href: '/dashboard',
    icon: KeyRound,
    title: 'API key',
    blurb:
      'Call the API as your own app — for public Qurʼan data: text, translations, tafsir, search, audio. No user sign-in.',
  },
  {
    kind: 'oauth',
    href: '/apps',
    icon: Blocks,
    title: 'OAuth app',
    blurb:
      "Access a signed-in user's own data — their bookmarks and reading history — with their consent, via the sign-in flow.",
  },
];

export function WhichAuth({ current }: { current: AuthKind }) {
  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Which do I need?
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const active = item.kind === current;
          const Icon = item.icon;
          const inner = (
            <div
              className={cn(
                'flex h-full gap-3 rounded-lg border p-3.5 transition-colors',
                active
                  ? 'border-accent/40 bg-accent-soft'
                  : 'border-line bg-surface-warm hover:border-accent/40 hover:bg-line-soft',
              )}
            >
              <span
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                  active ? 'bg-accent text-white' : 'bg-accent-soft text-accent',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  {item.title}
                  {active ? (
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      You&apos;re here
                    </span>
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 text-accent" />
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  {item.blurb}
                </p>
              </div>
            </div>
          );
          return active ? (
            <div key={item.kind}>{inner}</div>
          ) : (
            <Link key={item.kind} href={item.href} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
