'use client';

import { Heading, Text } from '@/components/ui/typography';
import { AudioPlayer } from './audio-player';
import { ReciterSelector } from '@/components/ui/molecules';
import { SurahViewModeToggle, type SurahDisplayMode } from './surah-view-mode-toggle';
import type { SurahResponse } from '@/types/quran-api';
import { getRevelationInfo, PERIOD_LABELS, APPROXIMATION_NOTE } from '@/lib/data/revelation-periods';
import { RevelationLegendModal } from '@/components/ui/revelation-legend-modal';
import { RepeatControl } from './playback-settings';
import { Focus, Loader2, WholeWord, BookOpen, Palette } from 'lucide-react';
import { TajweedLegendButton } from './tajweed-text';
import Link from 'next/link';

interface SurahHeaderProps {
  surah: SurahResponse;
  mode: SurahDisplayMode;
  onModeChange: (mode: SurahDisplayMode) => void;
  selectedReciter: string | null;
  onReciterChange: (reciterId: string) => void;
  focusMode?: boolean;
  onFocusToggle?: () => void;
  wordByWord?: boolean;
  wordsLoading?: boolean;
  onWordByWordToggle?: () => void;
  tajweed?: boolean;
  tajweedLoading?: boolean;
  onTajweedToggle?: () => void;
  mushafPage?: number | null;
}

export function SurahHeader({
  surah,
  mode,
  onModeChange,
  selectedReciter,
  onReciterChange,
  focusMode = false,
  onFocusToggle,
  wordByWord = false,
  wordsLoading = false,
  onWordByWordToggle,
  tajweed = false,
  tajweedLoading = false,
  onTajweedToggle,
  mushafPage = null,
}: SurahHeaderProps) {
  const hasAudio = surah.audio && Object.keys(surah.audio).length > 0;
  const revelation = getRevelationInfo(surah.surahNo);

  return (
    <div className="mb-6 md:mb-10">
      {/* ── Hero: the Arabic name is the star ─────────────────────────── */}
      <div className="arch-top relative overflow-hidden border border-line bg-surface-warm px-5 pb-7 pt-9 text-center shadow-card md:px-8 md:pb-9 md:pt-12">
        {/* girih texture, whisper-quiet, header only */}
        <div className="girih-bg pointer-events-none absolute inset-0 opacity-[0.045]" aria-hidden />

        <div className="relative">
          {/* Quiet kicker line */}
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-text md:mb-4 md:text-xs">
            Sūrah {surah.surahNo}
            <span className="mx-2 text-gold">✦</span>
            {surah.revelationPlace === 'Mecca' ? 'Meccan' : 'Medinan'}
            <span className="mx-2 text-gold">✦</span>
            {surah.totalAyah} Āyāt
          </p>

          {/* THE Arabic name — mushaf script, generous scale */}
          <p
            lang="ar"
            dir="rtl"
            className="font-mushaf leading-[1.6] text-ink [font-size:3.25rem] md:[font-size:5rem]"
          >
            {surah.surahNameArabicLong}
          </p>

          {/* English identity — subordinate, warm serif */}
          <Heading level={1} className="mt-2 font-reading text-xl font-medium text-ink-soft md:mt-3 md:text-3xl">
            {surah.surahName}
            <span className="text-ink-muted"> — {surah.surahNameTranslation}</span>
          </Heading>

          {/* Revelation period: one quiet footnote, details on demand */}
          {revelation && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-muted md:mt-4">
              <span title={APPROXIMATION_NOTE} className="cursor-help">
                {PERIOD_LABELS[revelation.period]} · {revelation.yearCE} CE
              </span>
              <RevelationLegendModal className="!m-0" />
            </div>
          )}
        </div>
      </div>

      {/* ── Controls row: mode toggle + listen ────────────────────────── */}
      <div className="mt-4 flex flex-col items-stretch gap-3 md:mt-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <SurahViewModeToggle mode={mode} onModeChange={onModeChange} />
          {mode === 'verse' && onFocusToggle && (
            <button
              onClick={onFocusToggle}
              title="Focus mode — dims everything but the ayah being recited"
              className={
                focusMode
                  ? 'flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors'
                  : 'flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition-colors hover:text-ink'
              }
            >
              <Focus className="h-3.5 w-3.5" aria-hidden />
              Focus
            </button>
          )}
          {mode === 'verse' && onWordByWordToggle && (
            <button
              onClick={onWordByWordToggle}
              title="Word by word — tap any word to hear it and see its meaning"
              className={
                wordByWord
                  ? 'flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors'
                  : 'flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition-colors hover:text-ink'
              }
            >
              {wordsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <WholeWord className="h-3.5 w-3.5" aria-hidden />}
              Word by Word
            </button>
          )}
          {mode === 'verse' && onTajweedToggle && (
            <button
              onClick={onTajweedToggle}
              title="Tajwīd colors — tap any colored letter to learn its rule"
              className={
                tajweed
                  ? 'flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors'
                  : 'flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition-colors hover:text-ink'
              }
            >
              {tajweedLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Palette className="h-3.5 w-3.5" aria-hidden />}
              Tajwīd
            </button>
          )}
          {mode === 'verse' && tajweed && <TajweedLegendButton />}
          {mushafPage != null && (
            <Link
              href={`/mushaf/${mushafPage}`}
              title="Open this sūrah in the page-faithful Madinah mushaf"
              className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold-soft/30 px-3.5 py-2 text-xs font-semibold text-gold-text transition-colors hover:bg-gold-soft/60"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Mushaf
            </Link>
          )}
        </div>

        {mode === 'verse' && hasAudio && (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 py-2 shadow-card md:justify-end">
            <ReciterSelector
              audioData={surah.audio}
              selectedReciter={selectedReciter}
              onReciterChange={onReciterChange}
              hideLabel
              minimal
              className="min-w-[11rem] flex-1 md:max-w-xs md:flex-none"
            />
            <RepeatControl />
            <AudioPlayer
              audioData={surah.audio}
              surahNo={surah.surahNo}
              selectedReciter={selectedReciter}
              onReciterChange={onReciterChange}
              enableSharedPlayback={true}
              minimal
            />
          </div>
        )}
      </div>
    </div>
  );
}
