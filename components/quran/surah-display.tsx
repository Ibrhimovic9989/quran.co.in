// Surah Display Component
// Displays a complete surah with lazy-loaded ayahs, audio, translations, and tafsir

'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { AyahDisplay } from './ayah-display';
import { AudioPlayer } from './audio-player';
import type { SurahResponse, TafsirResponse } from '@/types/quran-api';

interface SurahDisplayProps {
  surah: SurahResponse;
  tafsirs?: Map<string, TafsirResponse>; // Map of "surahNo_ayahNo" to tafsir
}

const AYAHS_PER_BATCH = 20;
const INITIAL_AYAHS = 20; // Load first 20 ayahs immediately

export function SurahDisplay({ surah, tafsirs }: SurahDisplayProps) {
  const [visibleAyahs, setVisibleAyahs] = useState(INITIAL_AYAHS);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize visible ayahs for performance
  const visibleAyahsList = useMemo(() => {
    return surah.english.slice(0, visibleAyahs);
  }, [surah.english, visibleAyahs]);

  const hasMore = visibleAyahs < surah.english.length;
  const totalAyahs = surah.english.length;

  const loadMoreAyahs = () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Use requestAnimationFrame for instant UI update
    requestAnimationFrame(() => {
      setVisibleAyahs((prev) => Math.min(prev + AYAHS_PER_BATCH, totalAyahs));
      setIsLoading(false);
    });
  };

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-400 text-sm font-mono">
              {surah.surahNo}
            </span>
            <Heading level={1}>{surah.surahNameTranslation}</Heading>
          </div>
          <Text className="text-3xl text-right mb-4 font-arabic">
            {surah.surahNameArabicLong}
          </Text>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>{surah.totalAyah} Ayahs</span>
            <span>•</span>
            <span>{surah.revelationPlace}</span>
          </div>

          {/* Surah Audio Player */}
          {surah.audio && Object.keys(surah.audio).length > 0 && (
            <AudioPlayer
              audioData={surah.audio}
              surahNo={surah.surahNo}
              className="mb-6"
            />
          )}
        </div>

        <div className="space-y-6">
          {visibleAyahsList.map((translation, index) => {
            const ayahNo = index + 1;
            const tafsirKey = `${surah.surahNo}_${ayahNo}`;
            const tafsir = tafsirs?.get(tafsirKey);

            return (
              <AyahDisplay
                key={ayahNo}
                ayah={{
                  ...surah,
                  ayahNo,
                  english: translation,
                  arabic1: surah.arabic1[index],
                  arabic2: surah.arabic2[index],
                  audio: surah.audio,
                  bengali: surah.bengali?.[index],
                  urdu: surah.urdu?.[index],
                  turkish: surah.turkish?.[index],
                  uzbek: surah.uzbek?.[index],
                }}
                tafsir={tafsir}
                showNumber={true}
              />
            );
          })}
        </div>

        {/* Load More Ayahs */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMoreAyahs}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Loading...'
              ) : (
                `Load More Ayahs (${totalAyahs - visibleAyahs} remaining)`
              )}
            </button>
          </div>
        )}

        {!hasMore && totalAyahs > INITIAL_AYAHS && (
          <div className="mt-8 text-center">
            <Text className="text-gray-400">
              All {totalAyahs} ayahs loaded
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
}
