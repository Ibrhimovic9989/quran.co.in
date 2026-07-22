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

// Surah 1 (Al-Fatiha): Bismillah is ayah 1 — already in data, don't duplicate.
// Surah 9 (At-Tawbah): No Bismillah by Quranic convention.
// All other surahs: show Bismillah as a header before the first ayah.
const SURAH_WITHOUT_BISMILLAH = 9;
const SURAH_FATIHA = 1;

function BismillahHeader() {
  return (
    <div className="mb-4 md:mb-8 text-center py-4 md:py-6">
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-2xl md:text-4xl text-gray-800 leading-relaxed"
        aria-label="Bismillah ir-Rahman ir-Raheem"
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>
    </div>
  );
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
  const showBismillah = surahNumber !== SURAH_FATIHA && surahNumber !== SURAH_WITHOUT_BISMILLAH;

  return (
    <div className="space-y-4 md:space-y-8">
      {showBismillah && <BismillahHeader />}
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
