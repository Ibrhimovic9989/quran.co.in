// Quran domain service.
// Ported from apps/web/lib/services/{quran-cache.service,quran.service,
// quran-surah-list-cache}.ts and the juz route logic. Next.js' unstable_cache
// is replaced by a simple in-process TTL cache (the surah list is 114 rows and
// effectively immutable).

import { Injectable, Logger } from '@nestjs/common';
import type { ApiProvider } from '@prisma/client';
import { QuranRepository } from './quran.repository';
import { QuranApiClient } from './quran-api.client';
import { getApiBaseUrl } from './api-base-url';
import {
  mapApiSurahToUpsert,
  mapApiSurahToListItem,
  mapDbSurahToListItem,
  mapDbSurahToResponse,
  buildAyahMetadata,
  type SurahListItem,
} from './quran-mappers';
import { getJuzData, type JuzData } from './juz-mapping';
import type {
  AyahResponse,
  SurahResponse,
  TafsirResponse,
  AudioVerseResponse,
  AudioSurahResponse,
} from '../common/types/quran-api.types';

const SURAH_LIST_TTL_MS = 60 * 60 * 1000; // 1 hour, mirrors the old unstable_cache revalidate

export interface JuzAyahsResult {
  juzNumber: number;
  totalAyahs: number;
  ayahs: Array<Record<string, unknown>>;
  surahRanges: JuzData['surahRanges'];
}

@Injectable()
export class QuranService {
  private readonly logger = new Logger(QuranService.name);
  private readonly apiClient: QuranApiClient;
  private readonly surahListCache = new Map<ApiProvider, { data: SurahListItem[]; expiresAt: number }>();

  constructor(private readonly repository: QuranRepository) {
    this.apiClient = new QuranApiClient(getApiBaseUrl('TEMPORARY_API'));
  }

  /**
   * All 114 surahs — DB-first with external-API fallback, cached in-process.
   */
  async getAllSurahs(apiProvider: ApiProvider = 'TEMPORARY_API'): Promise<SurahListItem[]> {
    const hit = this.surahListCache.get(apiProvider);
    if (hit && hit.expiresAt > Date.now()) return hit.data;

    const data = await this.loadSurahList(apiProvider);
    this.surahListCache.set(apiProvider, { data, expiresAt: Date.now() + SURAH_LIST_TTL_MS });
    return data;
  }

  private async loadSurahList(apiProvider: ApiProvider): Promise<SurahListItem[]> {
    const dbSurahs = await this.repository.findAllSurahs(apiProvider);
    if (dbSurahs.length > 0) {
      return dbSurahs.map(mapDbSurahToListItem);
    }

    const apiSurahs = await this.apiClient.getSurahs();
    // Sync in the background; don't block the response.
    this.syncSurahListToDatabase(apiSurahs, apiProvider).catch((err) =>
      this.logger.error('surah list sync failed', err),
    );
    return apiSurahs.map(mapApiSurahToListItem);
  }

  private async syncSurahListToDatabase(
    surahs: Awaited<ReturnType<QuranApiClient['getSurahs']>>,
    apiProvider: ApiProvider,
  ): Promise<void> {
    for (let index = 0; index < surahs.length; index += 1) {
      await this.repository.upsertSurah(mapApiSurahToUpsert(surahs[index], index + 1, apiProvider));
    }
  }

  /**
   * One surah with its first N ayahs — DB-first (fast), external-API fallback
   * with async DB sync. Mirrors QuranCacheService.getSurah.
   */
  async getSurah(
    surahNo: number,
    apiProvider: ApiProvider = 'TEMPORARY_API',
    initialAyahLimit = 20,
  ): Promise<SurahResponse | null> {
    const dbSurah = await this.repository.findSurahByNumber(surahNo, apiProvider);

    if (dbSurah) {
      const dbAyahs = await this.repository.findAyahsBySurah(surahNo, apiProvider, initialAyahLimit);
      if (dbAyahs.length > 0) {
        return mapDbSurahToResponse(dbSurah, dbAyahs);
      }
    }

    try {
      const apiSurah = await this.apiClient.getSurah(surahNo);
      this.syncSurahToDatabase(apiSurah, apiProvider).catch((err) =>
        this.logger.error(`surah ${surahNo} sync failed`, err),
      );
      return apiSurah;
    } catch (error) {
      this.logger.error(`Error fetching surah ${surahNo} from API`, error as Error);
      return null;
    }
  }

  /**
   * Paginated ayahs of a surah (skip/take at the DB).
   */
  async getSurahAyahs(
    surahNo: number,
    offset: number,
    limit: number,
  ): Promise<{ ayahs: unknown[]; hasMore: boolean }> {
    const [ayahs, total] = await Promise.all([
      this.repository.findAyahsBySurah(surahNo, 'TEMPORARY_API', limit, offset),
      this.repository.countAyahsBySurah(surahNo, 'TEMPORARY_API'),
    ]);
    return { ayahs, hasMore: offset + ayahs.length < total };
  }

  /**
   * Single ayah from the external API, synced to DB when the surah exists.
   * Mirrors old QuranService.getAyah.
   */
  async getAyah(
    surahNo: number,
    ayahNo: number,
    apiProvider: ApiProvider = 'TEMPORARY_API',
  ): Promise<AyahResponse> {
    const ayah = await this.apiClient.getAyah(surahNo, ayahNo);

    const surah = await this.repository.findSurahByNumber(surahNo, apiProvider);
    if (surah) {
      await this.repository.upsertAyah({
        surahId: surah.id,
        surahNumber: surahNo,
        number: ayahNo,
        apiProvider,
        arabicText: ayah.arabic1,
        translationText: ayah.english,
        transliteration: ayah.arabic2,
        audioUrl: ayah.audio['1']?.originalUrl,
        metadata: JSON.parse(
          JSON.stringify({ bengali: ayah.bengali, urdu: ayah.urdu, audio: ayah.audio }),
        ),
      });
    }

    return ayah;
  }

  async getTafsir(surahNo: number, ayahNo: number): Promise<TafsirResponse> {
    return this.apiClient.getTafsir(surahNo, ayahNo);
  }

  async getVerseAudio(surahNo: number, ayahNo: number): Promise<AudioVerseResponse> {
    return this.apiClient.getVerseAudio(surahNo, ayahNo);
  }

  async getSurahAudio(surahNo: number): Promise<AudioSurahResponse> {
    return this.apiClient.getSurahAudio(surahNo);
  }

  /**
   * Paginated ayahs of a Juz, windowed across its surah ranges.
   * Ported from app/api/quran/juz/[juzNumber]/route.ts.
   */
  async getJuzAyahs(juzNo: number, offset: number, limit: number): Promise<JuzAyahsResult | null> {
    const juzData = getJuzData(juzNo);
    if (!juzData) return null;

    const juzAyahs: Array<Record<string, unknown>> = [];

    const totalAyahs = juzData.surahRanges.reduce(
      (sum, r) => sum + (r.endAyah - r.startAyah + 1),
      0,
    );

    const endIndex = Math.min(offset + limit, totalAyahs);
    let globalIndex = 0; // index within the whole Juz (0-based)

    for (const range of juzData.surahRanges) {
      const rangeLength = range.endAyah - range.startAyah + 1;

      if (globalIndex + rangeLength <= offset) {
        globalIndex += rangeLength;
        continue;
      }
      if (globalIndex >= endIndex) break;

      const localStartOffset = Math.max(offset - globalIndex, 0);
      const localEndOffset = Math.min(endIndex - globalIndex - 1, rangeLength - 1);
      const localStartAyah = range.startAyah + localStartOffset;
      const localEndAyah = range.startAyah + localEndOffset;

      const surah = await this.repository.findSurahByNumber(range.surahNumber, 'TEMPORARY_API');
      if (!surah) {
        globalIndex += rangeLength;
        continue;
      }

      const ayahs = await this.repository.findAyahsBySurah(
        range.surahNumber,
        'TEMPORARY_API',
        localEndAyah,
      );

      const windowAyahs = ayahs.filter(
        (ayah) => ayah.number >= localStartAyah && ayah.number <= localEndAyah,
      );

      const enrichedAyahs = windowAyahs.map((ayah) => {
        const metadata = (ayah.metadata as Record<string, unknown>) || {};
        return {
          // Surah info
          surahNo: range.surahNumber,
          surahName: surah.name,
          surahNameArabic: surah.arabicName,
          surahNameArabicLong: surah.arabicName,
          surahNameTranslation: surah.englishNameTranslation || surah.englishName,
          revelationPlace: surah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina',
          totalAyah: surah.numberOfAyahs,
          // Ayah info
          ayahNo: ayah.number,
          // Content
          arabic1: ayah.arabicText || '',
          arabic2: ayah.transliteration || ayah.arabicText || '',
          english: ayah.translationText || '',
          // Translations from metadata
          bengali: metadata.bengali,
          urdu: metadata.urdu,
          turkish: metadata.turkish,
          uzbek: metadata.uzbek,
          // Audio
          audio: metadata.audio || {},
          // Additional fields for Juz modal
          surahNumber: range.surahNumber,
          juzNumber: juzNo,
        };
      });

      juzAyahs.push(...enrichedAyahs);
      globalIndex += rangeLength;
    }

    juzAyahs.sort((a, b) => {
      if (a.surahNumber !== b.surahNumber) {
        return (a.surahNumber as number) - (b.surahNumber as number);
      }
      return (a.ayahNo as number) - (b.ayahNo as number);
    });

    return {
      juzNumber: juzNo,
      totalAyahs,
      ayahs: juzAyahs,
      surahRanges: juzData.surahRanges,
    };
  }

  /**
   * Sync a complete surah (with ayahs) to the DB in batches.
   * Ported from QuranCacheService.syncSurahToDatabase.
   */
  private async syncSurahToDatabase(surah: SurahResponse, apiProvider: ApiProvider): Promise<void> {
    const dbSurah = await this.repository.upsertSurah(
      mapApiSurahToUpsert(surah, surah.surahNo, apiProvider, { audio: surah.audio }),
    );

    const batchSize = 50;
    for (let i = 0; i < surah.english.length; i += batchSize) {
      const batch = surah.english.slice(i, i + batchSize);
      await Promise.all(
        batch.map((_, batchIndex) => {
          const ayahIndex = i + batchIndex;
          return this.repository.upsertAyah({
            surahId: dbSurah.id,
            surahNumber: surah.surahNo,
            number: ayahIndex + 1,
            apiProvider,
            arabicText: surah.arabic1[ayahIndex],
            translationText: surah.english[ayahIndex],
            transliteration: surah.arabic2[ayahIndex],
            metadata: buildAyahMetadata(surah, ayahIndex),
          });
        }),
      );
    }
  }
}
