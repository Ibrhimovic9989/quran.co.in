// Ayah Display Component
// Displays a single ayah with Arabic, translations, audio, and tafsir

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/typography';
import { AudioPlayer } from './audio-player';
import { TranslationsDisplay } from './translations-display';
import { TafsirDisplay } from './tafsir-display';
import type { AyahResponse, TafsirResponse } from '@/types/quran-api';

interface AyahDisplayProps {
  ayah: AyahResponse;
  tafsir?: TafsirResponse;
  showNumber?: boolean;
  className?: string;
}

export function AyahDisplay({
  ayah,
  tafsir: initialTafsir,
  showNumber = true,
  className,
}: AyahDisplayProps) {
  const [showTafsir, setShowTafsir] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [tafsir, setTafsir] = useState<TafsirResponse | undefined>(initialTafsir);

  const hasMultipleTranslations =
    ayah.bengali || ayah.urdu || ayah.turkish || ayah.uzbek;

  return (
    <Card className={className}>
      {showNumber && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-gray-400 text-sm">
            {ayah.surahNameTranslation} {ayah.ayahNo}
          </span>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Arabic Text */}
        <Text className="text-2xl text-right leading-relaxed font-arabic">
          {ayah.arabic1}
        </Text>
        
        {/* English Translation */}
        <Text className="text-gray-300 leading-relaxed">
          {ayah.english}
        </Text>

        {/* Audio Player */}
        {ayah.audio && Object.keys(ayah.audio).length > 0 && (
          <AudioPlayer
            audioData={ayah.audio}
            surahNo={ayah.surahNo}
            ayahNo={ayah.ayahNo}
            className="mt-4"
          />
        )}

        {/* Additional Translations Toggle */}
        {hasMultipleTranslations && (
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showTranslations ? '▼' : '▶'} Other Translations
          </button>
        )}

        {/* Multiple Translations */}
        {showTranslations && hasMultipleTranslations && (
          <TranslationsDisplay
            translations={{
              english: ayah.english,
              bengali: ayah.bengali,
              urdu: ayah.urdu,
              turkish: ayah.turkish,
              uzbek: ayah.uzbek,
            }}
            className="mt-4"
          />
        )}

        {/* Tafsir Toggle */}
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
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {showTafsir ? '▼' : '▶'} Tafsir (Commentary)
        </button>

        {/* Tafsir Display */}
        {showTafsir && tafsir && (
          <TafsirDisplay tafsir={tafsir} className="mt-4" />
        )}
      </div>
    </Card>
  );
}
