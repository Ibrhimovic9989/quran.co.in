// Quran-related type definitions

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  surahNumber: number;
  arabicText: string;
  translationText: string;
  transliteration?: string;
}

export interface QuranVerse {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string;
  embedding?: number[];
  createdAt: Date;
}
