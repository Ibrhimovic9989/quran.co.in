'use client';

import { AyahDisplay } from './ayah-display';
import { useOptionalSurahPlayback } from './surah-playback-provider';
import type { TafsirResponse } from '@/types/quran-api';

interface SurahVerseListViewProps {
  surahNumber: number;
  surahBaseData: {
    surahName: string;
    surahNameArabic: string;
    surahNameArabicLong: string;
    surahNameTranslation: string;
    revelationPlace: 'Mecca' | 'Madina';
    totalAyah: number;
    audio: Record<string, { reciter: string; url: string; originalUrl: string }>;
  };
  loadedAyahs: {
    english: string[];
    arabic1: string[];
    arabic2: string[];
    bengali: string[];
    urdu: string[];
    turkish: string[];
    uzbek: string[];
  };
  visibleAyahs: number;
  tafsirs?: Map<string, TafsirResponse>;
  selectedReciter: string | null;
  onReciterChange: (reciterId: string) => void;
}

export function SurahVerseListView({
  surahNumber,
  surahBaseData,
  loadedAyahs,
  visibleAyahs,
  tafsirs,
  selectedReciter,
  onReciterChange,
}: SurahVerseListViewProps) {
  const sharedPlayback = useOptionalSurahPlayback();

  return (
    <div className="space-y-4 md:space-y-8">
      {loadedAyahs.english.slice(0, visibleAyahs).map((translation, index) => {
        const ayahNo = index + 1;
        const tafsirKey = `${surahNumber}_${ayahNo}`;
        const tafsir = tafsirs?.get(tafsirKey);

        return (
          <div key={ayahNo} id={`ayah-${surahNumber}-${ayahNo}`}>
            <AyahDisplay
              ayah={{
                ...surahBaseData,
                surahNo: surahNumber,
                ayahNo,
                english: translation,
                arabic1: loadedAyahs.arabic1[index] || '',
                arabic2: loadedAyahs.arabic2[index] || '',
                audio: surahBaseData.audio,
                bengali: loadedAyahs.bengali[index],
                urdu: loadedAyahs.urdu[index],
                turkish: loadedAyahs.turkish[index],
                uzbek: loadedAyahs.uzbek[index],
              }}
              tafsir={tafsir}
              showNumber={true}
              selectedReciter={selectedReciter}
              onReciterChange={onReciterChange}
              isActive={sharedPlayback?.activeAyahNumber === ayahNo}
              enableSharedPlayback={true}
            />
          </div>
        );
      })}
    </div>
  );
}
