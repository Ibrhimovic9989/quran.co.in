// Hero Section Component
// The calm opening: brand, one promise, one obvious way in.
// Layout ported from Namaz.app — left-aligned, a tinted "start here" card,
// then quick entries as cards rather than a centred wall of text.

'use client';

import { ArrowRight, ArrowUpRight, BookOpen, Compass, GraduationCap, Sparkles, Sun } from 'lucide-react';
import Link from 'next/link';

const entries = [
  {
    href: '/quran',
    tint: 'bg-tint-sage',
    icon: BookOpen,
    title: 'All 114 sūrahs',
    body: 'Madinah Mushaf script, translations, tafsir and recitation.',
  },
  {
    href: '/today',
    tint: 'bg-tint-sun',
    icon: Sun,
    title: 'Verse of the day',
    body: 'One āyah, chosen daily, with its meaning unpacked.',
  },
  {
    href: '/ask',
    tint: 'bg-tint-sky',
    icon: Sparkles,
    title: 'Ask a question',
    body: 'Answers drawn from the āyāt themselves, always cited.',
  },
];

export function HeroSection() {
  return (
    <section className="relative w-full bg-paper">
      <div className="relative mx-auto max-w-[960px] px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-14">
        {/* The Bismillah — quiet, in the mushaf hand */}
        <p
          lang="ar"
          dir="rtl"
          className="font-arabic text-[1.7rem] leading-[2] text-ink-soft md:text-[2.1rem]"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* Brand lockup */}
        <div className="mt-4 flex items-center gap-2.5">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-[#bcdde0] bg-accent-soft text-accent-strong">
            <BookOpen size={19} strokeWidth={1.6} />
          </span>
          <span className="font-heading text-[26px] font-extrabold leading-none tracking-[-0.04em] text-ink">
            Quran<span className="text-accent">.</span>
            <span className="text-[15px] font-bold text-accent-strong">co.in</span>
          </span>
        </div>

        <h1 className="mt-3.5 font-heading text-[clamp(32px,4vw,48px)] font-bold leading-[1.25] tracking-[-0.035em] text-ink">
          Read at your <em className="not-italic text-accent">pace</em>.
        </h1>
        <p className="mt-3.5 max-w-xl text-[15px] leading-[1.7] text-muted">
          All 114 sūrahs in the authentic Madinah Mushaf script — with translations,
          recitations, tafsir, and answers drawn from the āyāt themselves.
        </p>

        {/* Start here */}
        <div className="mt-7 flex flex-wrap items-center gap-4 rounded-[22px] border border-[#bce9e4] bg-[linear-gradient(115deg,var(--tint-sage),var(--tint-sky))] p-5 md:mt-8">
          <BookOpen size={30} strokeWidth={1.4} className="shrink-0 text-accent" />
          <div className="min-w-[180px] flex-1">
            <h2 className="font-heading text-[17px] font-bold tracking-[-0.02em] text-ink">
              New here?
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Start with Al-Fātiḥah — seven āyāt, and the opening of the Book.
            </p>
          </div>
          <Link
            href="/quran/1"
            className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Begin
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Where to begin */}
        <div className="mt-9 flex items-center justify-between">
          <h2 className="font-heading text-[19px] font-bold tracking-[-0.025em] text-ink">
            Choose where to begin
          </h2>
          <Link
            href="/quran"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-strong transition-colors hover:text-accent"
          >
            See all
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ href, tint, icon: Icon, title, body }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-card"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-full ${tint} text-ink-soft`}>
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <h3 className="mt-4 font-heading text-[15px] font-bold tracking-[-0.02em] text-ink">
                {title}
              </h3>
              <p className="mt-1.5 text-xs leading-[1.7] text-muted">{body}</p>
              <ArrowUpRight
                size={16}
                className="mt-4 self-end text-muted transition-colors group-hover:text-accent"
              />
            </Link>
          ))}
        </div>

        {/* Two wider doors, in the pastel voice */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            href="/learn"
            className="flex items-center gap-3 rounded-2xl bg-tint-sun px-5 py-4 text-ink transition-opacity hover:opacity-90"
          >
            <GraduationCap size={19} strokeWidth={1.6} />
            <span className="text-[13px] font-semibold">Learn to read the script</span>
            <ArrowRight size={16} className="ml-auto" />
          </Link>
          <Link
            href="/topics"
            className="flex items-center gap-3 rounded-2xl bg-tint-lavender px-5 py-4 text-ink transition-opacity hover:opacity-90"
          >
            <Compass size={19} strokeWidth={1.6} />
            <span className="text-[13px] font-semibold">Explore by topic</span>
            <ArrowRight size={16} className="ml-auto" />
          </Link>
        </div>

        <p className="mt-7 text-[11px] uppercase tracking-[0.18em] text-muted">
          Free for everyone · No sign-up required
        </p>
      </div>
    </section>
  );
}
