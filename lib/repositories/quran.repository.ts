// Quran Repository
// Data access layer for Quran-related database operations

import { prisma } from '@/lib/prisma';
import type { ApiProvider, Prisma } from '@prisma/client';

export class QuranRepository {
  /**
   * Find surah by number and provider (optimized query)
   */
  async findSurahByNumber(
    number: number,
    apiProvider: ApiProvider
  ): Promise<any | null> {
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
   * Find all surahs (optimized query)
   */
  async findAllSurahs(apiProvider?: ApiProvider): Promise<any[]> {
    return prisma.surah.findMany({
      where: apiProvider ? { apiProvider } : undefined,
      orderBy: { number: 'asc' },
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
   * Upsert surah
   */
  async upsertSurah(data: {
    number: number;
    name: string;
    englishName: string;
    arabicName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'MECCAN' | 'MEDINAN';
    apiProvider: ApiProvider;
    metadata?: Prisma.JsonValue;
  }): Promise<any> {
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
        metadata: data.metadata as any,
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
        metadata: data.metadata as any,
      },
    });
  }

  /**
   * Update surah
   */
  async updateSurah(
    id: string,
    data: {
      metadata?: Prisma.JsonValue;
    }
  ): Promise<any> {
    return prisma.surah.update({
      where: { id },
      data: {
        metadata: data.metadata as any,
      },
    });
  }

  /**
   * Find ayah by surah number, ayah number, and provider
   */
  async findAyah(
    surahNumber: number,
    ayahNumber: number,
    apiProvider: ApiProvider
  ): Promise<any | null> {
    return prisma.ayah.findFirst({
      where: {
        surahNumber,
        number: ayahNumber,
        apiProvider,
      },
    });
  }

  /**
   * Find ayah by number (alias for compatibility)
   */
  async findAyahByNumber(
    surahNumber: number,
    ayahNumber: number,
    apiProvider: ApiProvider = 'TEMPORARY_API'
  ): Promise<any | null> {
    return this.findAyah(surahNumber, ayahNumber, apiProvider);
  }

  /**
   * Find ayahs by surah number (optimized query)
   */
  async findAyahsBySurah(
    surahNumber: number,
    apiProvider: ApiProvider = 'TEMPORARY_API'
  ): Promise<any[]> {
    return prisma.ayah.findMany({
      where: {
        surahNumber,
        apiProvider,
      },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        surahNumber: true,
        arabicText: true,
        translationText: true,
        transliteration: true,
        metadata: true,
        // Don't select relationships to reduce data transfer
      },
    });
  }

  /**
   * Upsert ayah
   */
  async upsertAyah(data: {
    surahId: string;
    surahNumber: number;
    number: number;
    apiProvider: ApiProvider;
    arabicText: string;
    translationText: string;
    transliteration?: string;
    audioUrl?: string;
    metadata?: Prisma.JsonValue;
  }): Promise<any> {
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
        metadata: data.metadata as any,
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
        metadata: data.metadata as any,
      },
    });
  }

  /**
   * Update ayah
   */
  async updateAyah(
    id: string,
    data: {
      metadata?: Prisma.JsonValue;
    }
  ): Promise<any> {
    return prisma.ayah.update({
      where: { id },
      data: {
        metadata: data.metadata as any,
      },
    });
  }
}
