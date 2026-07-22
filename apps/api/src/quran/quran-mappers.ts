// Shared Surah mapping helpers.
// Ported from apps/web/lib/services/quran-mappers.ts — one definition for the
// API-surah → DB-upsert mapping and the DB-surah → response mapping.

import type { ApiProvider } from '@prisma/client';
import type { SurahInfo, SurahResponse } from '../common/types/quran-api.types';
import type { UpsertSurahInput } from './quran.repository';

// A surah list entry: the raw API shape plus its 1-based surah number.
export type SurahListItem = SurahInfo & { surahNo: number };

// Minimal shape returned by QuranRepository.findAllSurahs / findSurahByNumber.
export interface DbSurahRow {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  englishNameTranslation: string | null;
  numberOfAyahs: number;
  revelationType: 'MECCAN' | 'MEDINAN';
  metadata: unknown;
}

function readMetadata(metadata: unknown): Record<string, unknown> {
  return metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
}

/** API surah (list or full response) → repository upsert input. */
export function mapApiSurahToUpsert(
  surah: SurahInfo,
  number: number,
  apiProvider: ApiProvider,
  extraMetadata?: Record<string, unknown>,
): UpsertSurahInput {
  return {
    number,
    name: surah.surahName,
    englishName: surah.surahNameTranslation,
    arabicName: surah.surahNameArabic,
    englishNameTranslation: surah.surahNameTranslation,
    numberOfAyahs: surah.totalAyah,
    revelationType: surah.revelationPlace === 'Mecca' ? 'MECCAN' : 'MEDINAN',
    apiProvider,
    metadata: {
      surahNameArabicLong: surah.surahNameArabicLong,
      ...extraMetadata,
    } as UpsertSurahInput['metadata'],
  };
}

/** DB surah row → surah list item. */
export function mapDbSurahToListItem(surah: DbSurahRow): SurahListItem {
  const metadata = readMetadata(surah.metadata);
  return {
    surahName: surah.name,
    surahNameArabic: surah.arabicName,
    surahNameArabicLong: (metadata.surahNameArabicLong as string) || surah.arabicName,
    surahNameTranslation: surah.englishNameTranslation || surah.englishName,
    revelationPlace: surah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina',
    totalAyah: surah.numberOfAyahs,
    surahNo: surah.number,
  };
}

/** API list surah → surah list item (raw API shape + 1-based index). */
export function mapApiSurahToListItem(surah: SurahInfo, index: number): SurahListItem {
  return { ...surah, surahNo: index + 1 };
}

// Ayah row shape needed to build a SurahResponse (subset selected by the repo).
export interface DbAyahRow {
  arabicText: string;
  translationText: string | null;
  transliteration: string | null;
  metadata: unknown;
}

/** DB surah + ayah rows → full SurahResponse (as the temporary API would return). */
export function mapDbSurahToResponse(surah: DbSurahRow, ayahs: DbAyahRow[]): SurahResponse {
  const metadata = readMetadata(surah.metadata);
  return {
    surahName: surah.name,
    surahNameArabic: surah.arabicName,
    surahNameArabicLong: (metadata.surahNameArabicLong as string) || surah.arabicName,
    surahNameTranslation: surah.englishNameTranslation || surah.englishName,
    revelationPlace: surah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina',
    totalAyah: surah.numberOfAyahs,
    surahNo: surah.number,
    audio: (metadata.audio as SurahResponse['audio']) || {},
    english: ayahs.map((a) => a.translationText || ''),
    arabic1: ayahs.map((a) => a.arabicText),
    arabic2: ayahs.map((a) => a.transliteration || a.arabicText),
    bengali: ayahs.map((a) => (readMetadata(a.metadata).bengali as string) ?? null) as unknown as string[],
    urdu: ayahs.map((a) => (readMetadata(a.metadata).urdu as string) ?? null) as unknown as string[],
    turkish: ayahs.map((a) => (readMetadata(a.metadata).turkish as string) ?? null) as unknown as string[],
    uzbek: ayahs.map((a) => (readMetadata(a.metadata).uzbek as string) ?? null) as unknown as string[],
  };
}

/** Build the per-ayah metadata object from an API surah at a given index. */
export function buildAyahMetadata(surah: SurahResponse, index: number): Record<string, string> | undefined {
  const metadata: Record<string, string> = {};
  if (surah.bengali?.[index]) metadata.bengali = surah.bengali[index];
  if (surah.urdu?.[index]) metadata.urdu = surah.urdu[index];
  if (surah.turkish?.[index]) metadata.turkish = surah.turkish[index];
  if (surah.uzbek?.[index]) metadata.uzbek = surah.uzbek[index];
  return Object.keys(metadata).length > 0 ? metadata : undefined;
}
