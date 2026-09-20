'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen, Home, GraduationCap, Sun, Sparkles, Compass, Music2, Bookmark, User } from 'lucide-react';
import { useSession } from '@/components/auth/auth-client';
import { ThemeToggle } from '@/components/ui/theme/theme-toggle';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/quran', label: 'Read Quran', icon: BookOpen },
  { href: '/learn', label: 'Learn to read', icon: GraduationCap },
  { href: '/today', label: 'Today’s verse', icon: Sun },
  { href: '/ask', label: 'Ask a question', icon: Sparkles },
  { href: '/topics', label: 'Explore topics', icon: Compass },
  { href: '/maqamat', label: 'Recitation styles', icon: Music2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const signedIn = status === 'authenticated';
  const navigation = [...links,
    { href: signedIn ? '/bookmarks' : '/sign-in?callbackUrl=/bookmarks', label: 'Saved verses', icon: Bookmark },
    { href: signedIn ? '/profile' : '/sign-in', label: signedIn ? 'Your account' : 'Sign in', icon: User },
  ];
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-[1040px] items-center gap-2 px-3 sm:px-6">
          <button type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Collapse menu' : 'Expand menu'} aria-expanded={open} aria-controls="main-navigation" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-accent-soft focus-visible:outline-accent">
            <Menu size={20} />
          </button>
          <Link href="/" aria-label="Quran.co.in home" className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight">
            <Image src="/logo.png" alt="Quran.co.in" width={394} height={83} priority className="navbar-logo" />
          </Link>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </header>
      <nav id="main-navigation" aria-label="Main navigation" hidden={!open} className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-[1040px] grid-cols-2 gap-1 px-4 py-3 sm:grid-cols-3 sm:px-6">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm', pathname === href ? 'bg-accent-soft font-semibold text-accent-strong' : 'text-ink-soft hover:bg-line-soft')}>
              <Icon size={17} className="shrink-0" />{label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
