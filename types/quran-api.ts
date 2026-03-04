// Quran API Response Types
// Types for the temporary Quran API responses

export interface SurahInfo {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: 'Mecca' | 'Madina';
  totalAyah: number;
}

export interface AudioReciter {
  reciter: string;
  url: string;
  originalUrl: string;
}

export interface AudioReciters {
  [key: string]: AudioReciter;
}

export interface AyahResponse extends SurahInfo {
  surahNo: number;
  ayahNo: number;
  audio: AudioReciters;
  english: string;
  arabic1: string;
  arabic2: string;
  bengali?: string;
  urdu?: string;
  turkish?: string;
  uzbek?: string;
}

export interface SurahResponse extends SurahInfo {
  surahNo: number;
  audio: AudioReciters;
  english: string[];
  arabic1: string[];
  arabic2: string[];
  bengali?: string[];
  urdu?: string[];
  turkish?: string[];
  uzbek?: string[];
}

export interface TafsirContent {
  author: string;
  groupVerse: string | null;
  content: string; // Markdown format
}

export interface TafsirResponse {
  surahName: string;
  surahNo: number;
  ayahNo: number;
  tafsirs: TafsirContent[];
}

export interface RecitersResponse {
  [key: string]: string; // reciterId: reciterName
}

export interface AudioVerseResponse {
  [key: string]: AudioReciter; // reciterId: AudioReciter
}

export interface AudioSurahResponse {
  [key: string]: AudioReciter; // reciterId: AudioReciter
}
