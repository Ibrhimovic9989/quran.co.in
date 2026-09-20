'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Sparkles, Sun, Compass } from 'lucide-react';
import { BookmarksProvider, useBookmarks } from '@/components/quran/bookmarks-provider';

const entries = [
  { href: '/quran', title: 'Read Quran', body: 'Browse all 114 chapters', icon: BookOpen, tint: 'bg-tint-sage' },
  { href: '/learn', title: 'Learn to read', body: 'Start with the Arabic letters', icon: GraduationCap, tint: 'bg-tint-peach' },
  { href: '/today', title: 'Today’s verse', body: 'A moment to reflect', icon: Sun, tint: 'bg-tint-sun' },
  { href: '/ask', title: 'Ask a question', body: 'Explore with verse references', icon: Sparkles, tint: 'bg-tint-sky' },
];
function ReadingStart() {
  const { latestBookmark } = useBookmarks();
  const saved = latestBookmark?.surah ? latestBookmark : null;
  return <Link href={saved ? `/quran/${saved.surahNumber}${saved.ayahNumber ? `?ayah=${saved.ayahNumber}` : ''}` : '/quran/1'} className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-[linear-gradient(115deg,var(--accent-soft),var(--tint-sky))] p-4 sm:p-5">
    <BookOpen size={23} className="shrink-0 text-accent" />
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium text-accent-strong">{saved ? 'Continue reading' : 'Begin with the opening chapter'}</p>
      <h2 className="mt-1 font-heading text-base font-bold">{saved ? saved.surah?.englishName : 'Al-Fatihah'}</h2>
      <p className="mt-0.5 text-xs text-ink-soft">{saved ? (saved.ayahNumber ? `Verse ${saved.ayahNumber}` : 'Pick up where you left off') : '7 verses · Read and listen'}</p>
    </div>
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white"><ArrowRight size={17} /></span>
  </Link>;
}
export function HeroSection() {
  return <section className="mx-auto max-w-[880px] px-4 pb-8 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
    <p lang="ar" dir="rtl" className="text-center font-arabic text-2xl leading-[2] text-accent-strong">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
    <h1 className="mt-5 font-heading text-[26px] font-bold leading-tight tracking-tight sm:text-4xl">Read at your pace.</h1>
    <p className="mt-2 text-sm leading-relaxed text-muted">Read, listen, and understand. One verse at a time.</p>
    <BookmarksProvider><ReadingStart /></BookmarksProvider>
    <h2 className="mb-3 mt-7 font-heading text-sm font-semibold text-ink-soft">Explore</h2>
    <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
      {entries.map(({href,title,body,icon:Icon,tint}) => <Link key={href} href={href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-accent/40">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={19} strokeWidth={1.7} /></span>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-muted">{body}</p></div>
        <ArrowRight size={15} className="shrink-0 text-muted group-hover:text-accent" />
      </Link>)}
    </div>
    <Link href="/topics" className="mt-3 flex min-h-11 items-center gap-2 text-xs font-medium text-accent-strong"><Compass size={16} />Explore by topic<ArrowRight size={14} /></Link>
  </section>;
}
