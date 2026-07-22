// Quran Repository — data access for surahs/ayahs.
// Ported from apps/web/lib/repositories/quran.repository.ts; the global prisma
// singleton is replaced with Nest-injected PrismaService.

import { Injectable } from '@nestjs/common';
import type { ApiProvider, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class QuranRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSurahByNumber(number: number, apiProvider: ApiProvider) {
    return this.prisma.surah.findFirst({
      where: { number, apiProvider },
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
      },
    });
  }

  async findAllSurahs(apiProvider?: ApiProvider) {
    return this.prisma.surah.findMany({
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
      },
      take: 114,
    });
  }

  async upsertSurah(data: UpsertSurahInput) {
    return this.prisma.surah.upsert({
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

  async findAyah(surahNumber: number, ayahNumber: number, apiProvider: ApiProvider) {
    return this.prisma.ayah.findFirst({
      where: { surahNumber, number: ayahNumber, apiProvider },
    });
  }

  async findAyahsBySurah(
    surahNumber: number,
    apiProvider: ApiProvider = 'TEMPORARY_API',
    limit?: number,
    offset?: number,
  ) {
    return this.prisma.ayah.findMany({
      where: { surahNumber, apiProvider },
      orderBy: { number: 'asc' },
      take: limit,
      skip: offset,
      select: {
        number: true,
        arabicText: true,
        translationText: true,
        transliteration: true,
        metadata: true,
      },
    });
  }

  /** Word-by-word rows for a surah (raw table, no Prisma model needed). */
  async findWordsBySurah(surahNumber: number) {
    return this.prisma.$queryRaw<
      {
        ayahNumber: number;
        position: number;
        charType: string;
        textUthmani: string;
        translation: string | null;
        transliteration: string | null;
        audioUrl: string | null;
      }[]
    >`
      SELECT "ayahNumber", position, "charType", "textUthmani",
             translation, transliteration, "audioUrl"
      FROM quran_words
      WHERE "surahNumber" = ${surahNumber}
      ORDER BY "ayahNumber", position
    `;
  }

  /** All words on one Madinah mushaf page (1–604), in reading order. */
  async findWordsByPage(pageNumber: number) {
    return this.prisma.$queryRaw<
      {
        surahNumber: number;
        ayahNumber: number;
        position: number;
        charType: string;
        textUthmani: string;
        lineNumber: number | null;
      }[]
    >`
      SELECT "surahNumber", "ayahNumber", position, "charType", "textUthmani", "lineNumber"
      FROM quran_words
      WHERE "pageNumber" = ${pageNumber}
      ORDER BY "lineNumber", "surahNumber", "ayahNumber", position
    `;
  }

  /** The mushaf page on which a surah begins. */
  async findSurahStartPage(surahNumber: number): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<{ page: number | null }[]>`
      SELECT MIN("pageNumber")::int AS page
      FROM quran_words
      WHERE "surahNumber" = ${surahNumber}
    `;
    return rows[0]?.page ?? null;
  }

  async countAyahsBySurah(
    surahNumber: number,
    apiProvider: ApiProvider = 'TEMPORARY_API',
  ): Promise<number> {
    return this.prisma.ayah.count({ where: { surahNumber, apiProvider } });
  }

  /**
   * Upsert ayah — merges metadata to preserve existing translations/tafsir.
   */
  async upsertAyah(data: UpsertAyahInput) {
    const existing = await this.prisma.ayah.findUnique({
      where: {
        surahNumber_number_apiProvider: {
          surahNumber: data.surahNumber,
          number: data.number,
          apiProvider: data.apiProvider,
        },
      },
    });

    const mergedMetadata =
      existing?.metadata && data.metadata
        ? { ...(existing.metadata as object), ...(data.metadata as object) }
        : data.metadata || existing?.metadata;

    return this.prisma.ayah.upsert({
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
}
