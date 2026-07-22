// Quran Cache Service
// Handles caching and optimized data fetching

import { QuranRepository } from '@/lib/repositories';
import { QuranApiClient } from '@/lib/api/quran-api-client';
import { DEFAULT_QURAN_API_BASE_URL } from '@/lib/api/api-base-url';
import type { ApiProvider } from '@prisma/client';
import type { SurahResponse } from '@/types/quran-api';
import { getCachedSurahList, type SurahListItem } from '@/lib/services/quran-surah-list-cache';
import { mapApiSurahToUpsert, mapDbSurahToResponse, buildAyahMetadata } from '@/lib/services/quran-mappers';

export class QuranCacheService {
  private repository: QuranRepository;
  private apiClient: QuranApiClient;

  constructor() {
    this.repository = new QuranRepository();
    this.apiClient = new QuranApiClient(DEFAULT_QURAN_API_BASE_URL);
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
        const result = mapDbSurahToResponse(dbSurah, dbAyahs);

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
    const dbSurah = await this.repository.upsertSurah(
      mapApiSurahToUpsert(surah, surah.surahNo, apiProvider, { audio: surah.audio })
    );

    // Sync all ayahs in batches for better performance
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
        })
      );
    }
  }
}
