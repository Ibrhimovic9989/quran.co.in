'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ExternalLink, LogOut } from 'lucide-react';
import { backendUrl } from '@/lib/api/backend';
import { useAuth, signIn, signOut } from '@/components/auth/auth-client';
import { cn } from '@/lib/utils/cn';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Quickstart' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/apps', label: 'OAuth Apps' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, status } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <BookOpen className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="font-heading font-bold tracking-[-0.03em] text-ink">
            quran.co.in{' '}
            <span className="font-medium text-muted">/ developers</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-[7px] px-3 py-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-accent-soft font-semibold text-accent-strong'
                    : 'text-ink-soft hover:bg-line-soft hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={backendUrl('/api/docs')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-[7px] px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
          >
            API Reference
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {/* Show "Sign in" immediately (the common case); only swap to the
              account menu once we've confirmed the visitor is authenticated. No
              skeleton — the button must never wait on a slow/cold auth check. */}
          {status === 'authenticated' && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden max-w-[10rem] truncate text-sm text-ink-soft sm:inline">
                {user.name || user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn({ callbackUrl: '/dashboard' })}
              className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
