// Ayah Display Component
// Displays a single ayah with Arabic, translations, audio, and tafsir

'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/typography';
import { Select } from '@/components/ui/atoms';
import { cn } from '@/lib/utils/cn';
import { AudioPlayer } from './audio-player';
import { TafsirDisplay } from './tafsir-display';
import { BookmarkButton } from './bookmark-button';
import { AyahShareButton } from './ayah-share-button';
import type { AyahResponse, TafsirResponse } from '@/types/quran-api';

type TranslationLanguage = 'english' | 'bengali' | 'urdu' | 'turkish' | 'uzbek';

const languageNames: Record<TranslationLanguage, string> = {
  english: 'English',
  bengali: 'Bengali',
  urdu: 'Urdu',
  turkish: 'Turkish',
  uzbek: 'Uzbek',
};

interface AyahDisplayProps {
  ayah: AyahResponse;
  tafsir?: TafsirResponse;
  showNumber?: boolean;
  className?: string;
  selectedReciter?: string | null; // Reciter selected at surah level
  onReciterChange?: (reciterId: string) => void; // Callback when reciter changes
  isActive?: boolean;
  enableSharedPlayback?: boolean;
}

export function AyahDisplay({
  ayah,
  tafsir: initialTafsir,
  showNumber = true,
  className,
  selectedReciter,
  onReciterChange,
  isActive = false,
  enableSharedPlayback = false,
}: AyahDisplayProps) {
  const { data: session, status } = useSession();
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsir, setTafsir] = useState<TafsirResponse | undefined>(initialTafsir);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationLanguage>('english');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedRef = useRef(false);

  // Track reading history when ayah is actually in view for a short time
  useEffect(() => {
    if (hasTrackedRef.current) return;
    if (status !== 'authenticated' || !session?.user) return;

    const element = rootRef.current;
    if (!element || typeof window === 'undefined') return;

    let timer: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTrackedRef.current) {
          // Only track if user has kept this ayah in view for ~1.5s
          timer = window.setTimeout(() => {
            if (hasTrackedRef.current) return;
            hasTrackedRef.current = true;
            fetch('/api/reading-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                surahNumber: ayah.surahNo,
                ayahNumber: ayah.ayahNo,
              }),
            }).catch((error) => {
              console.error('Error tracking reading history:', error);
            });
            observer.disconnect();
          }, 1500);
        } else if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(element);

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      observer.disconnect();
    };
  }, [status, session, ayah.surahNo, ayah.ayahNo]);

  useEffect(() => {
    if (!isActive) return;
    const element = rootRef.current;
    if (!element) return;

    const timer = window.setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isActive]);

  const availableTranslations: TranslationLanguage[] = [];
  if (ayah.english) availableTranslations.push('english');
  if (ayah.bengali) availableTranslations.push('bengali');
  if (ayah.urdu) availableTranslations.push('urdu');
  if (ayah.turkish) availableTranslations.push('turkish');
  if (ayah.uzbek) availableTranslations.push('uzbek');

  const hasMultipleTranslations = availableTranslations.length > 1;
  const hasAudio = Boolean(ayah.audio && Object.keys(ayah.audio).length > 0);
  const showInlineAudioControl = hasAudio && selectedReciter !== undefined;

  const getCurrentTranslation = (): string => {
    switch (selectedTranslation) {
      case 'bengali':
        return ayah.bengali || '';
      case 'urdu':
        return ayah.urdu || '';
      case 'turkish':
        return ayah.turkish || '';
      case 'uzbek':
        return ayah.uzbek || '';
      default:
        return ayah.english || '';
    }
  };

  return (
    <div ref={rootRef}>
      <Card 
        className={cn(
          'relative border border-stone-200/80 bg-white/95 shadow-sm backdrop-blur-sm',
          'transition-colors duration-200',
          isActive && 'border-emerald-300 bg-emerald-50/40 shadow-md ring-1 ring-emerald-200',
          className
        )}
      >
        <div className="space-y-4 md:space-y-5">
          <div className="flex items-start justify-between gap-3">
            {showNumber ? (
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-500">
                  {ayah.surahNo}:{ayah.ayahNo}
                </p>
                <p className="truncate text-xs text-stone-400 md:text-sm">
                  {ayah.surahNameTranslation}
                </p>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {showInlineAudioControl && (
                <AudioPlayer
                  audioData={ayah.audio!}
                  surahNo={ayah.surahNo}
                  ayahNo={ayah.ayahNo}
                  selectedReciter={selectedReciter}
                  onReciterChange={onReciterChange}
                  enableSharedPlayback={enableSharedPlayback}
                  minimal
                />
              )}
              <BookmarkButton
                surahNumber={ayah.surahNo}
                ayahNumber={ayah.ayahNo}
                iconOnly
              />
              <AyahShareButton
                surahNumber={ayah.surahNo}
                ayahNumber={ayah.ayahNo}
                surahName={ayah.surahNameTranslation}
                arabicText={ayah.arabic1}
                translationText={getCurrentTranslation()}
                iconOnly
              />
            </div>
          </div>

          <Text className="text-right font-arabic text-[2rem] font-semibold leading-[2.1] text-stone-900 md:text-[2.6rem] md:leading-[2.3]">
          {ayah.arabic1}
          </Text>

          <div className="space-y-3">
            {hasMultipleTranslations && (
              <div className="max-w-[10rem]">
                <Select
                  value={selectedTranslation}
                  onChange={(e) => setSelectedTranslation(e.target.value as TranslationLanguage)}
                  options={availableTranslations.map((lang) => ({
                    value: lang,
                    label: languageNames[lang],
                  }))}
                  className="h-9 rounded-full border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 focus:border-stone-400"
                />
              </div>
            )}

            <Text className="text-base font-medium leading-8 text-stone-800 md:text-xl md:leading-9">
              {getCurrentTranslation()}
            </Text>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
            {hasAudio && !showInlineAudioControl && (
              <AudioPlayer
                audioData={ayah.audio!}
                surahNo={ayah.surahNo}
                ayahNo={ayah.ayahNo}
                className="flex-1"
                selectedReciter={selectedReciter}
                onReciterChange={onReciterChange}
                enableSharedPlayback={enableSharedPlayback}
                minimal
              />
            )}

            <button
              onClick={async () => {
                if (!showTafsir && !tafsir) {
                  try {
                    const response = await fetch(
                      `/api/quran/tafsir/${ayah.surahNo}/${ayah.ayahNo}`
                    );
                    if (response.ok) {
                      const data = await response.json();
                      setTafsir(data.tafsir);
                    }
                  } catch (error) {
                    console.error('Error fetching tafsir:', error);
                  }
                }
                setShowTafsir(!showTafsir);
              }}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-stone-500 transition-colors duration-200 hover:bg-stone-100 hover:text-stone-800"
            >
              {showTafsir ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span>Tafsir</span>
            </button>
          </div>

          {showTafsir && tafsir && (
            <TafsirDisplay tafsir={tafsir} className="mt-2 md:mt-4" />
          )}
        </div>
      </Card>
    </div>
  );
}
