// Surah Display Component
// Displays a complete surah with lazy-loaded ayahs, audio, translations, and tafsir
// NETFLIX-STYLE: Only loads first 20 ayahs initially, loads more on demand

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

interface LoadedAyahs {
  english: string[];
  arabic1: string[];
  arabic2: string[];
  bengali: string[];
  urdu: string[];
  turkish: string[];
  uzbek: string[];
}

export function SurahDisplay({ surah, tafsirs }: SurahDisplayProps) {
  // NETFLIX-STYLE: Start with initial ayahs from server (first 20)
  const [loadedAyahs, setLoadedAyahs] = useState<LoadedAyahs>({
    english: surah.english || [],
    arabic1: surah.arabic1 || [],
    arabic2: surah.arabic2 || [],
    bengali: surah.bengali || [],
    urdu: surah.urdu || [],
    turkish: surah.turkish || [],
    uzbek: surah.uzbek || [],
  });
  
  const [visibleAyahs, setVisibleAyahs] = useState(INITIAL_AYAHS);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize visible ayahs for performance
  const visibleAyahsList = useMemo(() => {
    return loadedAyahs.english.slice(0, visibleAyahs);
  }, [loadedAyahs.english, visibleAyahs]);

  const hasMore = loadedAyahs.english.length < surah.totalAyah || visibleAyahs < surah.totalAyah;
  const totalAyahs = surah.totalAyah;

  // NETFLIX-STYLE: Load more ayahs on-demand from API
  const loadMoreAyahs = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    try {
      // Fetch next batch of ayahs from API
      const response = await fetch(
        `/api/quran/surah/${surah.surahNo}/ayahs?offset=${loadedAyahs.english.length}&limit=${AYAHS_PER_BATCH}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.ayahs && data.ayahs.length > 0) {
          // Merge new ayahs with existing
          const newEnglish = data.ayahs.map((a: any) => a.translationText || '');
          const newArabic1 = data.ayahs.map((a: any) => a.arabicText);
          const newArabic2 = data.ayahs.map((a: any) => a.transliteration || a.arabicText);
          const newBengali = data.ayahs.map((a: any) => (a.metadata as any)?.bengali).filter(Boolean);
          const newUrdu = data.ayahs.map((a: any) => (a.metadata as any)?.urdu).filter(Boolean);
          const newTurkish = data.ayahs.map((a: any) => (a.metadata as any)?.turkish).filter(Boolean);
          const newUzbek = data.ayahs.map((a: any) => (a.metadata as any)?.uzbek).filter(Boolean);
          
          // Update loaded ayahs
          setLoadedAyahs((prev) => ({
            english: [...prev.english, ...newEnglish],
            arabic1: [...prev.arabic1, ...newArabic1],
            arabic2: [...prev.arabic2, ...newArabic2],
            bengali: [...prev.bengali, ...newBengali],
            urdu: [...prev.urdu, ...newUrdu],
            turkish: [...prev.turkish, ...newTurkish],
            uzbek: [...prev.uzbek, ...newUzbek],
          }));
          
          // Show more ayahs
          setVisibleAyahs((prev) => Math.min(prev + AYAHS_PER_BATCH, totalAyahs));
        }
      }
    } catch (error) {
      console.error('Error loading more ayahs:', error);
    } finally {
      setIsLoading(false);
    }
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
                  arabic1: loadedAyahs.arabic1[index] || '',
                  arabic2: loadedAyahs.arabic2[index] || '',
                  audio: surah.audio,
                  bengali: loadedAyahs.bengali[index],
                  urdu: loadedAyahs.urdu[index],
                  turkish: loadedAyahs.turkish[index],
                  uzbek: loadedAyahs.uzbek[index],
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
                `Load More Ayahs (${totalAyahs - loadedAyahs.english.length} remaining)`
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
