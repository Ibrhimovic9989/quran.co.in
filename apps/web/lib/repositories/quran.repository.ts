// Quran Repository
// Data access layer for Quran-related database operations

import { prisma } from '@/lib/prisma';
import type { ApiProvider, Prisma } from '@prisma/client';

// Shared input shapes — also consumed by the surah mappers so the field mapping
// lives in exactly one place.
export interface UpsertSurahInput {
  number: number;
  name: string;
  englishName: string;
  arabicName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'MECCAN' | 'MEDINAN';
  apiProvider: ApiProvider;
  metadata?: Prisma.JsonValue;
}

export interface UpsertAyahInput {
  surahId: string;
  surahNumber: number;
  number: number;
  apiProvider: ApiProvider;
  arabicText: string;
  translationText: string;
  transliteration?: string;
  audioUrl?: string;
  metadata?: Prisma.JsonValue;
}

export class QuranRepository {
  /**
   * Find surah by number and provider (optimized query)
   */
  async findSurahByNumber(number: number, apiProvider: ApiProvider) {
    return prisma.surah.findFirst({
      where: {
        number,
        apiProvider,
      },
      select: {
        id: true,
        number: true,
        name: true,
        englishName: true,
        arabicName: true,
        englishNameTranslation: true,
        numberOfAyahs: true,
        revelationType: true,
        metadata: true,
        // Don't select relationships to reduce data transfer
      },
    });
  }

  /**
   * Find all surahs (optimized query - minimal fields)
   */
  async findAllSurahs(apiProvider?: ApiProvider) {
    return prisma.surah.findMany({
      where: apiProvider ? { apiProvider } : undefined,
      orderBy: { number: 'asc' },
      select: {
        id: true, // needed by the sync service to set Ayah.surahId
        number: true,
        name: true,
        englishName: true,
        arabicName: true,
        englishNameTranslation: true,
        numberOfAyahs: true,
        revelationType: true,
        metadata: true,
      },
      // Use index for faster query
      take: 114, // Limit to 114 surahs
    });
  }

  /**
   * Upsert surah
   */
  async upsertSurah(data: UpsertSurahInput) {
    return prisma.surah.upsert({
      where: {
        number_apiProvider: {
          number: data.number,
          apiProvider: data.apiProvider,
        },
      },
      update: {
        name: data.name,
        englishName: data.englishName,
        arabicName: data.arabicName,
        englishNameTranslation: data.englishNameTranslation,
        numberOfAyahs: data.numberOfAyahs,
        revelationType: data.revelationType,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
      create: {
        number: data.number,
        name: data.name,
        englishName: data.englishName,
        arabicName: data.arabicName,
        englishNameTranslation: data.englishNameTranslation,
        numberOfAyahs: data.numberOfAyahs,
        revelationType: data.revelationType,
        apiProvider: data.apiProvider,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update surah
   */
  async updateSurah(id: string, data: { metadata?: Prisma.JsonValue }) {
    return prisma.surah.update({
      where: { id },
      data: {
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Find ayah by surah number, ayah number, and provider
   */
  async findAyah(surahNumber: number, ayahNumber: number, apiProvider: ApiProvider) {
    return prisma.ayah.findFirst({
      where: {
        surahNumber,
        number: ayahNumber,
        apiProvider,
      },
    });
  }

  /**
   * Find ayahs by surah number (optimized query)
   * NETFLIX-STYLE: Only fetch what's needed initially
   */
  async findAyahsBySurah(
    surahNumber: number,
    apiProvider: ApiProvider = 'TEMPORARY_API',
    limit?: number, // Only fetch first N ayahs for fast initial load
    offset?: number // Skip this many ayahs (for pagination)
  ) {
    return prisma.ayah.findMany({
      where: {
        surahNumber,
        apiProvider,
      },
      orderBy: { number: 'asc' },
      take: limit, // Limit results for fast initial load
      skip: offset, // Read only the requested page instead of re-scanning from row 1
      select: {
        number: true,
        arabicText: true,
        translationText: true,
        transliteration: true,
        metadata: true,
      },
      // Uses index: idx_ayah_surah_number_provider
    });
  }

  /**
   * Get total count of ayahs for a surah (fast count query)
   */
  async countAyahsBySurah(
    surahNumber: number,
    apiProvider: ApiProvider = 'TEMPORARY_API'
  ): Promise<number> {
    return prisma.ayah.count({
      where: {
        surahNumber,
        apiProvider,
      },
    });
  }

  /**
   * Upsert ayah
   * Merges metadata to preserve existing translations/tafsir
   */
  async upsertAyah(data: UpsertAyahInput) {
    // First, try to find existing ayah to merge metadata
    const existing = await prisma.ayah.findUnique({
      where: {
        surahNumber_number_apiProvider: {
          surahNumber: data.surahNumber,
          number: data.number,
          apiProvider: data.apiProvider,
        },
      },
    });

    // Merge metadata: existing + new (new values override existing)
    const mergedMetadata = existing?.metadata && data.metadata
      ? {
          ...(existing.metadata as object),
          ...(data.metadata as object),
        }
      : (data.metadata || existing?.metadata);

    return prisma.ayah.upsert({
      where: {
        surahNumber_number_apiProvider: {
          surahNumber: data.surahNumber,
          number: data.number,
          apiProvider: data.apiProvider,
        },
      },
      update: {
        arabicText: data.arabicText,
        translationText: data.translationText,
        transliteration: data.transliteration,
        audioUrl: data.audioUrl,
        metadata: mergedMetadata as Prisma.InputJsonValue,
      },
      create: {
        surahId: data.surahId,
        surahNumber: data.surahNumber,
        number: data.number,
        apiProvider: data.apiProvider,
        arabicText: data.arabicText,
        translationText: data.translationText,
        transliteration: data.transliteration,
        audioUrl: data.audioUrl,
        metadata: mergedMetadata as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Update ayah
   */
  async updateAyah(id: string, data: { metadata?: Prisma.JsonValue }) {
    return prisma.ayah.update({
      where: { id },
      data: {
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
