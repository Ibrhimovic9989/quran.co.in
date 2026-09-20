'use client';

import { ReadingPreferenceControls, type TranslationLanguage } from './reading-preferences';
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
    <div className="mb-5 md:mb-7">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <p className="text-xs text-muted">Chapter {surah.surahNo} · {surah.totalAyah} verses</p>
          <h1 className="mt-2 font-heading text-[22px] font-bold tracking-tight text-ink sm:text-3xl">{surah.surahName}</h1>
          <p className="mt-1 text-sm text-ink-soft">{surah.surahNameTranslation}</p>
        </div>
        <p lang="ar" dir="rtl" className="max-w-[42%] break-words font-mushaf text-[28px] leading-[1.7] text-accent-strong sm:text-4xl">{surah.surahNameArabic}</p>
      </div>

      {/* ── Controls row: mode toggle + listen ────────────────────────── */}
      <div className="mt-4 flex flex-col items-stretch gap-3 md:mt-5 ">
        <div className="flex flex-wrap items-center gap-2">
          <SurahViewModeToggle mode={mode} onModeChange={onModeChange} />
          {mode === 'verse' && hasAudio && (
            <AudioPlayer audioData={surah.audio} surahNo={surah.surahNo} selectedReciter={selectedReciter} onReciterChange={onReciterChange} enableSharedPlayback minimal />
          )}
          {mode === 'verse' && <details className="w-full rounded-xl border border-line bg-surface p-3">
            <summary className="cursor-pointer text-xs font-semibold text-ink-soft">Reading & audio settings</summary>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <ReadingPreferenceControls languages={(['english', 'bengali', 'urdu', 'turkish', 'uzbek'] as TranslationLanguage[]).filter(language => surah[language]?.some(Boolean))} />
              <div className="flex flex-wrap content-start gap-2">
                <h2 className="mb-1 w-full text-sm font-semibold text-ink">Listening & learning</h2>
              {hasAudio && <div className="flex w-full min-w-0 items-center gap-2">
                <ReciterSelector audioData={surah.audio} selectedReciter={selectedReciter} onReciterChange={onReciterChange} minimal className="min-w-0 flex-1" />
                <RepeatControl />
              </div>}
          {mode === 'verse' && onFocusToggle && (
            <button
              onClick={onFocusToggle}
              aria-pressed={focusMode}
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
              aria-pressed={wordByWord}
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
              aria-pressed={tajweed}
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
            </div>
          </details>}
        </div>


      </div>
    </div>
  );
}
