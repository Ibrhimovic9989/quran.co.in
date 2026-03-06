// Quran Cache Service
// Handles caching and optimized data fetching

import { QuranRepository } from '@/lib/repositories';
import { QuranApiClient } from '@/lib/api/quran-api-client';
import type { ApiProvider } from '@prisma/client';
import type { SurahResponse } from '@/types/quran-api';
import { getCachedSurahList, type SurahListItem } from '@/lib/services/quran-surah-list-cache';

export class QuranCacheService {
  private repository: QuranRepository;
  private apiClient: QuranApiClient;

  constructor() {
    this.repository = new QuranRepository();
    this.apiClient = new QuranApiClient('https://quranapi.pages.dev');
  }

  /**
   * Get all surahs - prefer database, fallback to API
   * Optimized for fast loading (<100ms)
   */
  async getAllSurahs(apiProvider: ApiProvider = 'TEMPORARY_API'): Promise<SurahListItem[]> {
    const startTime = Date.now();
    const result = await getCachedSurahList(apiProvider);
    
    const queryTime = Date.now() - startTime;
    if (queryTime > 200) {
      console.warn(`Slow surah list query: ${queryTime}ms`);
    }

    return result;
  }

  /**
   * Get surah with ayahs - NETFLIX-STYLE optimization
   * Only fetches first 20 ayahs initially for instant load (<200ms)
   * Remaining ayahs loaded on-demand via API route
   */
  async getSurah(
    surahNo: number,
    apiProvider: ApiProvider = 'TEMPORARY_API',
    initialAyahLimit: number = 20 // Only fetch first 20 ayahs for instant load
  ): Promise<SurahResponse | null> {
    const startTime = Date.now();
    
    // Try database first (fast - uses index)
    const dbSurah = await this.repository.findSurahByNumber(surahNo, apiProvider);
    
    if (dbSurah) {
      const surahQueryTime = Date.now() - startTime;
      
      // NETFLIX-STYLE: Only fetch first N ayahs for instant load
      const ayahsStartTime = Date.now();
      const dbAyahs = await this.repository.findAyahsBySurah(surahNo, apiProvider, initialAyahLimit);
      const ayahsQueryTime = Date.now() - ayahsStartTime;
      
      if (dbAyahs.length > 0) {
        // Build response from database (fast - <200ms for first 20 ayahs)
        const buildStartTime = Date.now();
        const result: SurahResponse = {
          surahName: dbSurah.name,
          surahNameArabic: dbSurah.arabicName,
          surahNameArabicLong: (dbSurah.metadata as any)?.surahNameArabicLong || dbSurah.arabicName,
          surahNameTranslation: dbSurah.englishNameTranslation || dbSurah.englishName,
          revelationPlace: (dbSurah.revelationType === 'MECCAN' ? 'Mecca' : 'Madina') as 'Mecca' | 'Madina',
          totalAyah: dbSurah.numberOfAyahs,
          surahNo: dbSurah.number,
          audio: (dbSurah.metadata as any)?.audio || {},
          english: dbAyahs.map(a => a.translationText || ''),
          arabic1: dbAyahs.map(a => a.arabicText),
          arabic2: dbAyahs.map(a => a.transliteration || a.arabicText),
          bengali: dbAyahs.map(a => (a.metadata as any)?.bengali || null).filter(v => v !== null),
          urdu: dbAyahs.map(a => (a.metadata as any)?.urdu || null).filter(v => v !== null),
          turkish: dbAyahs.map(a => (a.metadata as any)?.turkish || null).filter(v => v !== null),
          uzbek: dbAyahs.map(a => (a.metadata as any)?.uzbek || null).filter(v => v !== null),
        };
        
        const totalTime = Date.now() - startTime;
        if (totalTime > 200) {
          console.warn(`Slow surah query (${surahNo}): ${totalTime}ms (surah: ${surahQueryTime}ms, ayahs: ${ayahsQueryTime}ms, build: ${Date.now() - buildStartTime}ms, count: ${dbAyahs.length})`);
        }
        
        return result;
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

    // Sync all ayahs in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < surah.english.length; i += batchSize) {
      const batch = surah.english.slice(i, i + batchSize);
      await Promise.all(
        batch.map((_, batchIndex) => {
          const ayahIndex = i + batchIndex;
          // Build metadata with all translations
          const metadata: Record<string, any> = {};
          
          if (surah.bengali?.[ayahIndex]) {
            metadata.bengali = surah.bengali[ayahIndex];
          }
          if (surah.urdu?.[ayahIndex]) {
            metadata.urdu = surah.urdu[ayahIndex];
          }
          if (surah.turkish?.[ayahIndex]) {
            metadata.turkish = surah.turkish[ayahIndex];
          }
          if (surah.uzbek?.[ayahIndex]) {
            metadata.uzbek = surah.uzbek[ayahIndex];
          }
          
          return this.repository.upsertAyah({
            surahId: dbSurah.id,
            surahNumber: surah.surahNo,
            number: ayahIndex + 1,
            apiProvider,
            arabicText: surah.arabic1[ayahIndex],
            translationText: surah.english[ayahIndex],
            transliteration: surah.arabic2[ayahIndex],
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          });
        })
      );
    }
  }
}
