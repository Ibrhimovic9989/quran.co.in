// Hero Section Component
// Calm, reader-first hero: the bismillah in the authentic mushaf script,
// one warm headline, and a single obvious path into reading.

'use client';

import { Heading, Text } from './typography';
import { ArrowRight, BookOpen, Sun } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-paper">
      {/* girih texture, whisper-quiet */}
      <div className="girih-bg pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden />
      {/* soft warm glow behind the bismillah */}
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-gold-soft/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 md:pb-24 md:pt-24">
        {/* The Bismillah — mushaf script, the crown of the page */}
        <p
          lang="ar"
          dir="rtl"
          className="font-arabic text-[2.6rem] leading-[1.9] text-ink sm:text-6xl md:text-[4.5rem]"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <Text className="mt-6 font-reading text-sm italic text-ink-muted md:mt-8 md:text-base">
          In the name of Allah, the Most Gracious, the Most Merciful
        </Text>

        <div className="ayah-divider mt-8 w-full max-w-xs md:mt-10" />

        {/* Headline */}
        <Heading
          level={1}
          className="mt-8 font-reading text-3xl font-medium leading-tight text-ink md:mt-10 md:text-5xl"
        >
          Read the Noble Quran,
          <br className="hidden sm:block" /> beautifully.
        </Heading>
        <Text className="mt-4 max-w-xl font-reading text-base leading-relaxed text-ink-soft md:text-lg">
          All 114 sūrahs in the authentic Madinah Mushaf script — with translations,
          recitations, tafsir, and answers drawn from the ayāt themselves.
        </Text>

        {/* CTAs — one obvious path in */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row md:mt-10">
          <Link
            href="/quran"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-accent-strong hover:shadow-card-hover sm:w-auto md:text-base"
          >
            <BookOpen className="h-4 w-4" />
            Begin Reading
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/today"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-8 py-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-gold/60 hover:text-ink sm:w-auto md:text-base"
          >
            <Sun className="h-4 w-4 text-gold-text" />
            Verse of the Day
          </Link>
        </div>

        <Text className="mt-6 text-[11px] uppercase tracking-[0.18em] text-ink-muted md:text-xs">
          Free for everyone · No sign-up required
        </Text>
      </div>
    </section>
  );
}
