// Quran Cache Service
// Handles caching and optimized data fetching

import { QuranRepository } from '@/lib/repositories';
import { QuranApiClient } from '@/lib/api/quran-api-client';
import type { ApiProvider } from '@prisma/client';
import type { SurahInfo, SurahResponse } from '@/types/quran-api';

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
   * Get surah with ayahs - prefer database, fallback to API
   */
  async getSurah(
    surahNo: number,
    apiProvider: ApiProvider = 'TEMPORARY_API'
  ): Promise<SurahResponse | null> {
    // Try database first (fast)
    const dbSurah = await this.repository.findSurahByNumber(surahNo, apiProvider);
    
    if (dbSurah) {
      // Get ayahs from database
      const dbAyahs = await this.repository.findAyahsBySurah(surahNo, apiProvider);
      
      if (dbAyahs.length > 0) {
        // Build response from database (fast)
        return {
          surahName: dbSurah.name,
          surahNameArabic: dbSurah.arabicName,
          surahNameArabicLong: (dbSurah.metadata as any)?.surahNameArabicLong || dbSurah.arabicName,
          surahNameTranslation: dbSurah.englishNameTranslation || dbSurah.englishName,
          revelationPlace: dbSurah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina',
          totalAyah: dbSurah.numberOfAyahs,
          surahNo: dbSurah.number,
          audio: (dbSurah.metadata as any)?.audio || {},
          english: dbAyahs.map(a => a.translationText || '').filter(Boolean),
          arabic1: dbAyahs.map(a => a.arabicText),
          arabic2: dbAyahs.map(a => a.transliteration || a.arabicText),
          bengali: dbAyahs.map(a => (a.metadata as any)?.bengali).filter(Boolean),
          urdu: dbAyahs.map(a => (a.metadata as any)?.urdu).filter(Boolean),
          turkish: dbAyahs.map(a => (a.metadata as any)?.turkish).filter(Boolean),
          uzbek: dbAyahs.map(a => (a.metadata as any)?.uzbek).filter(Boolean),
        };
      }
    }

    // If not in DB, fetch from API (slow, but only once)
    try {
      const apiSurah = await this.apiClient.getSurah(surahNo);
      
      // Store in database for future requests (async, don't wait)
      this.syncSurahToDatabase(apiSurah, apiProvider).catch(console.error);
      
      return apiSurah;
    } catch (error) {
      console.error(`Error fetching surah ${surahNo} from API:`, error);
      return null;
    }
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

  /**
   * Sync complete surah to database (async, non-blocking)
   */
  private async syncSurahToDatabase(
    surah: SurahResponse,
    apiProvider: ApiProvider
  ): Promise<void> {
    const dbSurah = await this.repository.upsertSurah({
      number: surah.surahNo,
      name: surah.surahName,
      englishName: surah.surahNameTranslation,
      arabicName: surah.surahNameArabic,
      englishNameTranslation: surah.surahNameTranslation,
      numberOfAyahs: surah.totalAyah,
      revelationType: surah.revelationPlace === 'Mecca' ? 'MECCAN' : 'MEDINAN',
      apiProvider,
      metadata: {
        surahNameArabicLong: surah.surahNameArabicLong,
        audio: surah.audio,
      } as any,
    });

    // Sync all ayahs
    for (let i = 0; i < surah.english.length; i++) {
      await this.repository.upsertAyah({
        surahId: dbSurah.id,
        surahNumber: surah.surahNo,
        number: i + 1,
        apiProvider,
        arabicText: surah.arabic1[i],
        translationText: surah.english[i],
        transliteration: surah.arabic2[i],
        metadata: {
          bengali: surah.bengali?.[i],
          urdu: surah.urdu?.[i],
          turkish: surah.turkish?.[i],
          uzbek: surah.uzbek?.[i],
        } as any,
      });
    }
  }
}
