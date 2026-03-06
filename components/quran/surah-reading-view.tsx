'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';
import { AudioPlayer } from './audio-player';
import { ReciterSelector } from '@/components/ui/molecules';
import { cn } from '@/lib/utils/cn';
import { useOptionalSurahPlayback } from './surah-playback-provider';

interface SurahReadingViewProps {
  surahNumber: number;
  loadedAyahs: {
    english: string[];
    arabic1: string[];
  };
  visibleAyahs: number;
  audioData: Record<string, { reciter: string; url: string; originalUrl: string }>;
  selectedReciter: string | null;
  onReciterChange: (reciterId: string) => void;
}

type ReadingTextMode = 'arabic' | 'translation';

function toArabicIndicNumber(value: number) {
  return value
    .toString()
    .replace(/\d/g, (digit) => String.fromCharCode(0x0660 + Number(digit)));
}

function ReadingAyahMarker({ ayahNumber }: { ayahNumber: number }) {
  return (
    <span className="mx-1 inline-flex h-7 min-w-7 translate-y-[-1px] items-center justify-center rounded-full border border-amber-400/70 bg-white px-1.5 text-[11px] font-semibold text-amber-700 shadow-sm md:h-8 md:min-w-8 md:px-2 md:text-sm">
      {toArabicIndicNumber(ayahNumber)}
    </span>
  );
}

export function SurahReadingView({
  surahNumber,
  loadedAyahs,
  visibleAyahs,
  audioData,
  selectedReciter,
  onReciterChange,
}: SurahReadingViewProps) {
  const [textMode, setTextMode] = useState<ReadingTextMode>('arabic');
  const [showAudioControls, setShowAudioControls] = useState(false);
  const sharedPlayback = useOptionalSurahPlayback();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 768px)').matches) {
      setShowAudioControls(true);
    }
  }, []);

  const visibleContent = useMemo(() => {
    const availableAyahs = Math.min(
      visibleAyahs,
      loadedAyahs.arabic1.length,
      loadedAyahs.english.length
    );

    return Array.from({ length: availableAyahs }, (_, index) => ({
      ayahNo: index + 1,
      arabic: loadedAyahs.arabic1[index] || '',
      translation: loadedAyahs.english[index] || '',
    }));
  }, [loadedAyahs.arabic1, loadedAyahs.english, visibleAyahs]);

  useEffect(() => {
    const activeAyah = sharedPlayback?.activeAyahNumber;
    if (!activeAyah) return;

    const element = document.getElementById(`ayah-${surahNumber}-${activeAyah}`);
    if (!element) return;

    const timer = window.setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [sharedPlayback?.activeAyahNumber, surahNumber, textMode]);

  return (
    <div className="p-0 md:rounded-3xl md:border md:border-gray-200 md:bg-white/70 md:p-8 md:shadow-sm md:backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:gap-3">
        <button
          type="button"
          onClick={() => setShowAudioControls((prev) => !prev)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:text-gray-900"
          aria-expanded={showAudioControls}
        >
          <Play className="h-4 w-4 text-teal-600" />
          Audio
          {showAudioControls ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <div className="inline-flex shrink-0 rounded-full border border-gray-200 bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTextMode('arabic')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              textMode === 'arabic' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:text-gray-900'
            )}
          >
            Arabic
          </button>
          <button
            type="button"
            onClick={() => setTextMode('translation')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              textMode === 'translation' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:text-gray-900'
            )}
          >
            Translation
          </button>
        </div>
      </div>

      {showAudioControls && Object.keys(audioData).length > 0 && (
        <div className="mb-5 rounded-2xl border border-stone-200 bg-white/90 p-3 shadow-sm md:mb-6 md:p-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="text-sm font-medium text-stone-500">Listen</span>
            <ReciterSelector
              audioData={audioData}
              selectedReciter={selectedReciter}
              onReciterChange={onReciterChange}
              hideLabel
              minimal
              className="min-w-[13rem] flex-1 md:max-w-sm md:flex-none"
            />
          <AudioPlayer
            audioData={audioData}
            surahNo={surahNumber}
            selectedReciter={selectedReciter}
            onReciterChange={onReciterChange}
            enableSharedPlayback={true}
            minimal
            className="flex-1 md:flex-none"
          />
          </div>
        </div>
      )}

      {textMode === 'arabic' ? (
        <>
          <div className="mx-auto max-w-[22rem] rounded-2xl bg-gray-50/70 px-3 py-5 md:hidden">
            <div dir="rtl" className="text-center font-arabic text-[2.2rem] leading-[2.05] text-gray-900">
              {visibleContent.map((ayah) => (
                <span
                  key={ayah.ayahNo}
                  id={`ayah-${surahNumber}-${ayah.ayahNo}`}
                  className={cn(
                    'inline rounded-xl px-1 py-1 transition-colors duration-300',
                    sharedPlayback?.activeAyahNumber === ayah.ayahNo &&
                      'bg-emerald-100/80 shadow-sm ring-1 ring-emerald-200'
                  )}
                >
                  {ayah.arabic}
                  <ReadingAyahMarker ayahNumber={ayah.ayahNo} />
                </span>
              ))}
            </div>
            <div className="mt-3 text-center text-sm text-gray-500">{surahNumber}</div>
          </div>

          <div
            dir="rtl"
            className="hidden rounded-2xl bg-gray-50/80 px-8 py-6 text-right text-5xl leading-[2.3] text-gray-900 font-arabic md:block"
          >
            {visibleContent.map((ayah) => (
              <span
                key={ayah.ayahNo}
                id={`ayah-${surahNumber}-${ayah.ayahNo}`}
                className={cn(
                  'inline rounded-xl px-1.5 py-1 transition-colors duration-300',
                  sharedPlayback?.activeAyahNumber === ayah.ayahNo && 'bg-emerald-100/80 shadow-sm ring-1 ring-emerald-200'
                )}
              >
                {ayah.arabic}{' '}
                <ReadingAyahMarker ayahNumber={ayah.ayahNo} />
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-[22rem] space-y-2 rounded-2xl bg-gray-50/70 px-3 py-4 md:max-w-none md:space-y-4 md:px-8 md:py-6">
          {visibleContent.map((ayah) => (
            <p
              key={ayah.ayahNo}
              id={`ayah-${surahNumber}-${ayah.ayahNo}`}
              className={cn(
                'rounded-xl px-3 py-2 text-sm leading-7 text-gray-800 transition-colors duration-300 md:text-xl md:leading-10',
                sharedPlayback?.activeAyahNumber === ayah.ayahNo && 'bg-emerald-100/80 text-gray-900 ring-1 ring-emerald-200'
              )}
            >
              <span className="font-semibold text-gray-900">{ayah.ayahNo}.</span>{' '}
              {ayah.translation}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
