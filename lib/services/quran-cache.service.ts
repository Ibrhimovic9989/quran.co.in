// Quran Cache Service
// Handles caching and optimized data fetching

import { QuranRepository } from '@/lib/repositories';
import { QuranApiClient } from '@/lib/api/quran-api-client';
import type { ApiProvider } from '@prisma/client';
import type { SurahInfo } from '@/types/quran-api';

export class QuranCacheService {
  private repository: QuranRepository;
  private apiClient: QuranApiClient;

  constructor() {
    this.repository = new QuranRepository();
    this.apiClient = new QuranApiClient('https://quranapi.pages.dev');
  }

  /**
   * Get all surahs - prefer database, fallback to API
   */
  async getAllSurahs(apiProvider: ApiProvider = 'TEMPORARY_API'): Promise<(SurahInfo & { surahNo: number })[]> {
    // Try database first (fast)
    const dbSurahs = await this.repository.findAllSurahs(apiProvider);
    
    if (dbSurahs.length > 0) {
      // Return from database (cached)
      return dbSurahs.map((surah) => ({
        surahName: surah.name,
        surahNameArabic: surah.arabicName,
        surahNameArabicLong: (surah.metadata as any)?.surahNameArabicLong || surah.arabicName,
        surahNameTranslation: surah.englishNameTranslation || surah.englishName,
        revelationPlace: surah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina',
        totalAyah: surah.numberOfAyahs,
        surahNo: surah.number,
      }));
    }

    // If no data in DB, fetch from API (slow, but only once)
    const apiSurahs = await this.apiClient.getSurahs();
    
    // Store in database for future requests (async, don't wait)
    this.syncSurahsToDatabase(apiSurahs, apiProvider).catch(console.error);
    
    return apiSurahs.map((surah, index) => ({
      ...surah,
      surahNo: index + 1,
    }));
  }

  /**
   * Sync surahs to database (async, non-blocking)
   */
  private async syncSurahsToDatabase(
    surahs: SurahInfo[],
    apiProvider: ApiProvider
  ): Promise<void> {
    for (let i = 0; i < surahs.length; i++) {
      const surah = surahs[i];
      await this.repository.upsertSurah({
        number: i + 1,
        name: surah.surahName,
        englishName: surah.surahNameTranslation,
        arabicName: surah.surahNameArabic,
        englishNameTranslation: surah.surahNameTranslation,
        numberOfAyahs: surah.totalAyah,
        revelationType: surah.revelationPlace === 'Mecca' ? 'MECCAN' : 'MEDINAN',
        apiProvider,
        metadata: {
          surahNameArabicLong: surah.surahNameArabicLong,
        } as any,
      });
    }
  }
}
