// App shell — the chrome every page sits inside.
//
// Shape ported from Namaz.app: a quiet white topbar carrying a breadcrumb,
// a search trigger and the account dot; navigation lives in a drawer rather
// than a permanently reserved column, so the reading column stays centred.
// Mobile keeps a bottom tab bar for the places people jump between.

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Bookmark,
  BookOpen,
  ChevronRight,
  Compass,
  GraduationCap,
  HelpCircle,
  Home,
  LogIn,
  Menu,
  MessageCircle,
  Music2,
  Search,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useSession } from '@/components/auth/auth-client';
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  href: string;
  requiresAuth?: boolean;
}

// Drawer navigation — the full map of the site.
const navItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Read the Qur’ān', icon: BookOpen, href: '/quran' },
  { label: 'Learn to read', icon: GraduationCap, href: '/learn' },
  { label: 'Today', icon: Sun, href: '/today' },
  { label: 'Ask', icon: Sparkles, href: '/ask' },
  { label: 'Topics', icon: Compass, href: '/topics' },
  { label: 'Maqāmāt', icon: Music2, href: '/maqamat' },
];

// Bottom tab bar on phones — the five most-travelled routes.
const tabItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Qur’ān', icon: BookOpen, href: '/quran' },
  { label: 'Today', icon: Sun, href: '/today' },
  { label: 'Ask', icon: Sparkles, href: '/ask' },
  { label: 'Saved', icon: Bookmark, href: '/bookmarks', requiresAuth: true },
];

// Breadcrumb labels for the sections the drawer doesn't name.
const CRUMBS: Record<string, string> = {
  '/': 'Overview',
  '/quran': 'The Qur’ān',
  '/learn': 'Learn to read',
  '/today': 'Today',
  '/ask': 'Ask',
  '/topics': 'Topics',
  '/maqamat': 'Maqāmāt',
  '/bookmarks': 'Saved for later',
  '/profile': 'Your account',
  '/sign-in': 'Sign in',
  '/about': 'About',
  '/contact': 'Contact',
  '/help': 'Help',
  '/faq': 'Questions',
  '/privacy': 'Privacy',
  '/terms': 'Terms',
  '/dashboard': 'Dashboard',
};

function crumbFor(pathname: string): string {
  if (CRUMBS[pathname]) return CRUMBS[pathname];
  if (pathname.startsWith('/quran/juz/')) return `Juz ${pathname.split('/').pop()}`;
  if (pathname.startsWith('/quran/')) return `Sūrah ${pathname.split('/').pop()}`;
  if (pathname.startsWith('/mushaf/')) return `Mushaf page ${pathname.split('/').pop()}`;
  if (pathname.startsWith('/topics/')) return 'Topic';
  return 'Reading';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const { data: session, status } = useSession();
  const [navOpen, setNavOpen] = useState(false);

  const close = useCallback(() => setNavOpen(false), []);

  // The drawer is a view of the current route — leaving the route closes it.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Escape closes the drawer; while it's open the page behind doesn't scroll.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  const signedIn = status === 'authenticated';
  const initial = (session?.user?.name || session?.user?.email || 'Q').trim().charAt(0).toUpperCase();
  const onAsk = pathname.startsWith('/ask');

  return (
    <div className="min-h-screen">
      {/* ── Drawer ─────────────────────────────────────────────────── */}
      {navOpen && (
        <div
          className="fixed inset-0 z-[59] bg-[rgba(22,61,80,0.45)]"
          onClick={close}
          aria-hidden
        />
      )}
      <aside
        id="main-navigation"
        aria-label="Main navigation"
        aria-hidden={!navOpen}
        className={cn(
          'fixed inset-y-0 left-0 z-[60] flex w-[min(278px,85vw)] flex-col overflow-y-auto',
          'border-r border-line bg-surface px-5 pb-5 pt-14',
          'transition-transform duration-200 ease-out',
          navOpen ? 'translate-x-0' : '-translate-x-full invisible',
        )}
      >
        <button
          onClick={close}
          aria-label="Close navigation"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-accent-soft hover:text-accent-strong"
          tabIndex={navOpen ? 0 : -1}
        >
          <X size={19} />
        </button>

        <Link href="/" className="mb-5 flex items-center gap-2.5" tabIndex={navOpen ? 0 : -1}>
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-[#bcdde0] bg-accent-soft text-accent-strong">
            <BookOpen size={19} strokeWidth={1.6} />
          </span>
          <span className="font-heading text-[22px] font-extrabold tracking-[-0.045em] text-ink">
            Quran<span className="text-accent">.</span>
            <span className="text-[13px] font-bold text-accent-strong">co.in</span>
          </span>
        </Link>

        <p className="mb-4 pl-3.5 text-[9px] font-semibold tracking-[1.5px] text-muted">
          YOUR READING COMPANION
        </p>

        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              tabIndex={navOpen ? 0 : -1}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-[7px] px-3 py-2.5 text-[13px] font-medium transition-colors',
                isActive(href)
                  ? 'bg-accent-soft font-semibold text-accent-strong'
                  : 'text-ink-soft hover:bg-line-soft',
              )}
            >
              <Icon size={19} strokeWidth={1.6} />
              {label}
            </Link>
          ))}

          <div className="mx-2.5 my-3 h-px bg-line" />

          <Link
            href={signedIn ? '/bookmarks' : '/sign-in'}
            tabIndex={navOpen ? 0 : -1}
            className={cn(
              'flex min-h-[44px] items-center gap-3 rounded-[7px] px-3 py-2.5 text-[13px] font-medium transition-colors',
              isActive('/bookmarks')
                ? 'bg-accent-soft font-semibold text-accent-strong'
                : 'text-ink-soft hover:bg-line-soft',
            )}
          >
            <Bookmark size={19} strokeWidth={1.6} />
            Saved for later
          </Link>
          <Link
            href={signedIn ? '/profile' : '/sign-in'}
            tabIndex={navOpen ? 0 : -1}
            className={cn(
              'flex min-h-[44px] items-center gap-3 rounded-[7px] px-3 py-2.5 text-[13px] font-medium transition-colors',
              isActive(signedIn ? '/profile' : '/sign-in')
                ? 'bg-accent-soft font-semibold text-accent-strong'
                : 'text-ink-soft hover:bg-line-soft',
            )}
          >
            {signedIn ? <User size={19} strokeWidth={1.6} /> : <LogIn size={19} strokeWidth={1.6} />}
            {signedIn ? 'Your account' : 'Sign in'}
          </Link>
        </nav>

        <div className="mt-auto pt-6">
          <div className="mx-1 mb-6 rounded-[9px] border border-line bg-surface-warm px-4 py-5 text-center">
            <span className="mb-2.5 block text-accent">
              <BookOpen size={19} className="mx-auto" strokeWidth={1.6} />
            </span>
            <h4 className="mb-2 text-xs font-semibold text-ink">A little, consistently.</h4>
            <p className="text-[11px] leading-[1.8] text-muted">
              One āyah a day keeps the
              <br />
              connection alive.
            </p>
          </div>
          <Link
            href="/about"
            tabIndex={navOpen ? 0 : -1}
            className="mb-6 flex w-full items-center gap-3 px-3.5 text-[11px] text-muted transition-colors hover:text-accent-strong"
          >
            <HelpCircle size={18} />
            About this site
            <ArrowUpRight size={15} className="ml-auto" />
          </Link>
          <div className="flex items-center gap-2.5 border-t border-line px-1 py-5 text-[10px] text-ink-soft">
            <span className="font-arabic-display text-lg text-accent">ق</span>
            <div>
              Free for everyone
              <small className="mt-0.5 block text-[9px] text-muted">
                No sign-up. No ads. No tracking of what you read.
              </small>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Topbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex h-[54px] items-center justify-between border-b border-line bg-surface px-4 md:h-[77px] md:px-10">
        <div className="flex min-w-0 items-center gap-2 md:gap-3.5">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            aria-controls="main-navigation"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent-strong"
          >
            <Menu size={20} />
          </button>
          <Link
            href="/"
            className="hidden truncate text-[11px] text-muted transition-colors hover:text-accent-strong sm:block"
          >
            Quran.co.in
          </Link>
          <ChevronRight size={13} className="hidden shrink-0 text-muted sm:block" />
          <strong className="truncate text-xs font-medium text-ink-soft md:text-[13px]">
            {crumbFor(pathname)}
          </strong>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-5">
          <Link
            href="/ask"
            aria-label="Ask a question about the Qur’ān"
            className="flex items-center gap-2.5 text-[11px] text-muted transition-colors hover:text-accent-strong"
          >
            <Search size={17} />
            <span className="hidden lg:inline">What would you like to read?</span>
            <kbd className="ml-5 hidden rounded border border-line px-1.5 py-0.5 text-xs lg:inline">
              ⌕
            </kbd>
          </Link>
          <ThemeToggle />
          {signedIn ? (
            <Link
              href="/profile"
              aria-label="Your account"
              className="grid h-8 w-8 place-items-center rounded-full border-[3px] border-paper bg-tint-peach text-[11px] font-semibold text-[#70422d]"
            >
              {initial}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-accent px-3.5 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* ── Page ─────────────────────────────────────────────────────
          A div, not <main>: pages bring their own <main>, and nesting
          landmarks would break assistive navigation. */}
      <div className="pb-20 md:pb-0">{children}</div>

      {/* ── Ask pill ───────────────────────────────────────────────── */}
      {!onAsk && (
        <Link
          href="/ask"
          className={cn(
            'fixed bottom-20 right-4 z-40 flex items-center gap-2.5 rounded-[25px] bg-accent px-4 py-3 text-xs font-semibold text-white shadow-card transition-colors hover:bg-accent-strong',
            'md:bottom-5 md:right-6 md:px-5',
          )}
        >
          <MessageCircle size={16} />
          <span className="md:hidden">Ask</span>
          <span className="hidden md:inline">Ask the Qur’ān</span>
          <ArrowUpRight size={14} className="hidden md:block" />
        </Link>
      )}

      {/* ── Mobile tab bar ─────────────────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {tabItems
            .filter((item) => !item.requiresAuth || signedIn)
            .map(({ label, icon: Icon, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex min-w-[48px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-colors',
                    active ? 'text-accent' : 'text-muted',
                  )}
                >
                  <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
                  <span className="text-[10px] font-medium leading-tight">{label}</span>
                </Link>
              );
            })}
        </div>
      </nav>
    </div>
  );
}
