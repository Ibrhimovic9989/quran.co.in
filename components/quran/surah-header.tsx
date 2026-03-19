'use client';

import { Heading, Text } from '@/components/ui/typography';
import { AudioPlayer } from './audio-player';
import { ReciterSelector } from '@/components/ui/molecules';
import { SurahViewModeToggle, type SurahDisplayMode } from './surah-view-mode-toggle';
import type { SurahResponse } from '@/types/quran-api';
import { getRevelationInfo, PERIOD_LABELS, PERIOD_COLORS, PERIOD_DESCRIPTIONS, APPROXIMATION_NOTE } from '@/lib/data/revelation-periods';
import { cn } from '@/lib/utils/cn';
import { RevelationLegendModal } from '@/components/ui/revelation-legend-modal';

interface SurahHeaderProps {
  surah: SurahResponse;
  mode: SurahDisplayMode;
  onModeChange: (mode: SurahDisplayMode) => void;
  selectedReciter: string | null;
  onReciterChange: (reciterId: string) => void;
}

export function SurahHeader({
  surah,
  mode,
  onModeChange,
  selectedReciter,
  onReciterChange,
}: SurahHeaderProps) {
  const hasAudio = surah.audio && Object.keys(surah.audio).length > 0;
  const revelation = getRevelationInfo(surah.surahNo);

  return (
    <div className="mb-6 md:mb-12">
      <div className="mb-4 flex justify-center md:justify-start">
        <SurahViewModeToggle mode={mode} onModeChange={onModeChange} />
      </div>

      {mode === 'reading' ? (
        <div className="px-1 py-1 md:rounded-3xl md:border md:border-gray-200 md:bg-white/70 md:px-8 md:py-8 md:shadow-sm md:backdrop-blur-sm">
          <div className="grid grid-cols-[120px_1fr] items-center gap-3 md:grid-cols-[1.2fr_1fr] md:gap-5">
            <Text className="text-left text-[3.2rem] font-mushaf font-semibold leading-none text-gray-900 md:text-right md:text-8xl">
              {surah.surahNameArabicLong}
            </Text>
            <div className="text-left">
              <Heading level={1} className="text-[1.95rem] font-bold leading-none text-gray-900 md:text-5xl">
                {surah.surahNo}. {surah.surahNameTranslation}
              </Heading>
              <div className="mt-1 inline-flex rounded-full bg-cyan-500/90 px-2 py-0.5 text-[11px] font-semibold text-white md:hidden">
                info
              </div>
              <Text className="mt-1 text-[1rem] text-gray-700 md:mt-2 md:text-3xl">
                {surah.surahName}
              </Text>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-gray-600 md:mt-4 md:justify-start md:gap-2 md:text-sm">
                <span>{surah.totalAyah} Ayahs</span>
                <span className="text-gray-300">•</span>
                <span>{surah.revelationPlace}</span>
                {revelation && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span
                      title={`${PERIOD_DESCRIPTIONS[revelation.period]}\n\n${APPROXIMATION_NOTE}`}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-medium cursor-help',
                        PERIOD_COLORS[revelation.period].badge
                      )}
                    >
                      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PERIOD_COLORS[revelation.period].dot)} />
                      {PERIOD_LABELS[revelation.period]}
                    </span>
                    <span title={APPROXIMATION_NOTE} className="text-gray-500 cursor-help">{revelation.yearCE} CE*</span>
                    <span className="text-gray-300">•</span>
                    <span title={APPROXIMATION_NOTE} className="text-gray-400 italic cursor-help">{revelation.yearProphethood}</span>
                  </>
                )}
              </div>
              {revelation && <RevelationLegendModal className="mt-1" />}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center md:text-left">
          <div className="mb-3 flex items-center justify-center gap-2 md:justify-start md:gap-3 md:mb-6">
            <span className="rounded-md bg-white/80 px-2 py-1 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-sm md:px-3 md:py-1.5 md:text-base">
              {surah.surahNo}
            </span>
            <Heading level={1} className="text-2xl font-bold leading-tight text-gray-900 md:text-6xl">
              {surah.surahNameTranslation}
            </Heading>
          </div>
          <Text className="mb-3 text-center text-xl font-arabic font-semibold leading-tight text-gray-900 md:mb-6 md:text-right md:text-5xl lg:text-6xl md:leading-relaxed">
            {surah.surahNameArabicLong}
          </Text>
          <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium text-gray-700 md:mb-6 md:justify-start md:gap-2 md:text-sm">
            <span>{surah.totalAyah} Ayahs</span>
            <span className="text-gray-400">•</span>
            <span>{surah.revelationPlace}</span>
            {revelation && (
              <>
                <span className="text-gray-400">•</span>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] md:text-xs font-medium',
                  PERIOD_COLORS[revelation.period].badge
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', PERIOD_COLORS[revelation.period].dot)} />
                  {PERIOD_LABELS[revelation.period]}
                </span>
                <span className="text-gray-500">{revelation.yearCE} CE</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 italic">{revelation.yearProphethood}</span>
              </>
            )}
          </div>
          {revelation && <RevelationLegendModal className="mb-2 justify-center md:justify-start" />}
          <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-gray-600 md:mb-8 md:justify-start md:gap-2 md:text-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-900 md:h-2 md:w-2" />
            <span>Authentic • Complete • Free Access</span>
          </div>
        </div>
      )}

      {mode === 'verse' && hasAudio && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white/90 p-3 shadow-sm md:mt-8 md:p-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="text-sm font-medium text-stone-500">Listen</span>
            <ReciterSelector
              audioData={surah.audio}
              selectedReciter={selectedReciter}
              onReciterChange={onReciterChange}
              hideLabel
              minimal
              className="min-w-[13rem] flex-1 md:max-w-sm md:flex-none"
            />
            <AudioPlayer
              audioData={surah.audio}
              surahNo={surah.surahNo}
              selectedReciter={selectedReciter}
              onReciterChange={onReciterChange}
              enableSharedPlayback={true}
              minimal
              className="flex-1 md:flex-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
