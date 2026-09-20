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
      <div className="relative overflow-hidden rounded-2xl border border-line bg-accent-soft px-4 py-5 text-center md:py-6">
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
            className="font-mushaf leading-[1.6] text-ink [font-size:2.5rem] md:[font-size:3.5rem]"
          >
            {surah.surahNameArabicLong}
          </p>

          {/* English identity — subordinate, warm serif */}
          <Heading level={1} className="mt-2 font-reading text-lg font-medium text-ink-soft md:mt-3 md:text-xl">
            {surah.surahName}
            <span className="text-ink-muted"> — {surah.surahNameTranslation}</span>
          </Heading>


        </div>
      </div>

      {/* ── Controls row: mode toggle + listen ────────────────────────── */}
      <div className="mt-4 flex flex-col items-stretch gap-3 md:mt-5 ">
        <div className="flex flex-wrap items-center gap-2">
          <SurahViewModeToggle mode={mode} onModeChange={onModeChange} />
          {mode === 'verse' && hasAudio && (
            <AudioPlayer audioData={surah.audio} surahNo={surah.surahNo} selectedReciter={selectedReciter} onReciterChange={onReciterChange} enableSharedPlayback minimal />
          )}
          {mode === 'verse' && <details className="w-full rounded-xl border border-line bg-surface p-3">
            <summary className="cursor-pointer text-xs font-semibold text-ink-soft">Reading options</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {hasAudio && <div className="flex w-full min-w-0 items-center gap-2">
                <ReciterSelector audioData={surah.audio} selectedReciter={selectedReciter} onReciterChange={onReciterChange} minimal className="min-w-0 flex-1" />
                <RepeatControl />
              </div>}
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
              {revelation && <div className="mt-2 flex w-full flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-muted">
                <span title={APPROXIMATION_NOTE}>{PERIOD_LABELS[revelation.period]} · {revelation.yearCE} CE</span>
                <RevelationLegendModal />
              </div>}
            </div>
          </details>}
        </div>


      </div>
    </div>
  );
}
