// Ayah Display Component
// Displays a single ayah with Arabic, translations, audio, and tafsir

'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
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
}

export function AyahDisplay({
  ayah,
  tafsir: initialTafsir,
  showNumber = true,
  className,
  selectedReciter,
  onReciterChange,
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

  const availableTranslations: TranslationLanguage[] = [];
  if (ayah.english) availableTranslations.push('english');
  if (ayah.bengali) availableTranslations.push('bengali');
  if (ayah.urdu) availableTranslations.push('urdu');
  if (ayah.turkish) availableTranslations.push('turkish');
  if (ayah.uzbek) availableTranslations.push('uzbek');

  const hasMultipleTranslations = availableTranslations.length > 1;

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

  // Determine gradient based on ayah number for visual variety
  const gradients = [
    'from-blue-50 to-blue-100/30',
    'from-emerald-50 to-emerald-100/30',
    'from-purple-50 to-purple-100/30',
    'from-amber-50 to-amber-100/30',
  ];
  const gradient = gradients[ayah.ayahNo % gradients.length];

  return (
    <div ref={rootRef}>
      <Card 
        className={cn(
          "relative overflow-hidden border border-gray-200 hover:border-gray-300",
          "transition-all duration-300 ease-in-out hover:shadow-lg md:hover:shadow-xl hover:-translate-y-0.5 md:hover:-translate-y-1",
          `bg-gradient-to-br ${gradient}`,
          "group/card",
          className
        )}
      >
      {showNumber && (
        <div className="mb-3 md:mb-5 flex items-center gap-2">
          <span className="text-gray-800 text-xs md:text-base font-bold bg-white/80 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-md shadow-sm">
            {ayah.surahNameTranslation} {ayah.ayahNo}
          </span>
        </div>
      )}
      
      <div className="space-y-3 md:space-y-5">
        {/* Arabic Text - Mobile optimized */}
        <Text className="text-xl md:text-4xl text-right leading-tight md:leading-loose font-arabic text-gray-900 font-semibold">
          {ayah.arabic1}
        </Text>
        
        {/* Translation Selector - Using Select atom - Mobile optimized */}
        {hasMultipleTranslations && (
          <div className="mb-2 md:mb-3">
            <Select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value as TranslationLanguage)}
              options={availableTranslations.map((lang) => ({
                value: lang,
                label: languageNames[lang],
              }))}
              className="max-w-xs text-xs md:text-sm"
            />
          </div>
        )}

        {/* Selected Translation - Mobile optimized */}
        <Text className="text-gray-900 leading-tight md:leading-relaxed text-sm md:text-lg font-medium">
          {getCurrentTranslation()}
        </Text>

        {/* Audio Player */}
        {ayah.audio && Object.keys(ayah.audio).length > 0 && (
          <AudioPlayer
            audioData={ayah.audio}
            surahNo={ayah.surahNo}
            ayahNo={ayah.ayahNo}
            className="mt-2 md:mt-4"
            selectedReciter={selectedReciter}
            onReciterChange={onReciterChange}
          />
        )}

        {/* Bookmark + Share Actions */}
        <div className="mt-2 md:mt-4 flex flex-wrap gap-2">
          <BookmarkButton
            surahNumber={ayah.surahNo}
            ayahNumber={ayah.ayahNo}
          />
          <AyahShareButton
            surahNumber={ayah.surahNo}
            ayahNumber={ayah.ayahNo}
            surahName={ayah.surahNameTranslation}
            arabicText={ayah.arabic1}
            translationText={getCurrentTranslation()}
          />
        </div>

        {/* Tafsir Toggle - Mobile optimized */}
        <button
          onClick={async () => {
            if (!showTafsir && !tafsir) {
              // Fetch tafsir on demand
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
          className="text-xs md:text-base text-gray-800 hover:text-black transition-colors duration-300 font-semibold py-1.5 md:py-2 px-2 md:px-3 rounded-md hover:bg-gray-50"
        >
          {showTafsir ? '▼' : '▶'} Tafsir (Commentary)
        </button>

        {/* Tafsir Display */}
        {showTafsir && tafsir && (
          <TafsirDisplay tafsir={tafsir} className="mt-2 md:mt-4" />
        )}
      </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 ease-in-out pointer-events-none" />
      </Card>
    </div>
  );
}
