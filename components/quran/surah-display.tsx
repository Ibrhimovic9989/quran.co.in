// Surah Display Component
// Displays a complete surah with all ayahs, audio, translations, and tafsir

'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { AyahDisplay } from './ayah-display';
import { AudioPlayer } from './audio-player';
import type { SurahResponse, TafsirResponse } from '@/types/quran-api';

interface SurahDisplayProps {
  surah: SurahResponse;
  tafsirs?: Map<string, TafsirResponse>; // Map of "surahNo_ayahNo" to tafsir
}

export function SurahDisplay({ surah, tafsirs }: SurahDisplayProps) {
  const [showAllTranslations, setShowAllTranslations] = useState(false);

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
          {surah.english.map((translation, index) => {
            const ayahNo = index + 1;
            const tafsirKey = `${surah.surahNo}_${ayahNo}`;
            const tafsir = tafsirs?.get(tafsirKey);

            return (
              <AyahDisplay
                key={index}
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
      </div>
    </Container>
  );
}
