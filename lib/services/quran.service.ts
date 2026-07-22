// Quran Service
// Business logic layer for Quran operations
// Supports multiple API providers

import { QuranApiClient } from '@/lib/api/quran-api-client';
import { getApiBaseUrl } from '@/lib/api/api-base-url';
import { QuranRepository } from '@/lib/repositories';
import type { ApiProvider } from '@prisma/client';
import type { SurahInfo, AyahResponse, SurahResponse } from '@/types/quran-api';
import { mapApiSurahToUpsert, buildAyahMetadata } from '@/lib/services/quran-mappers';

export class QuranService {
  private apiClient: QuranApiClient;
  private repository: QuranRepository;

  constructor(apiProvider: ApiProvider = 'TEMPORARY_API') {
    // Initialize API client based on provider
    this.apiClient = new QuranApiClient(getApiBaseUrl(apiProvider));
    this.repository = new QuranRepository();
  }

  /**
   * Get all surahs and sync to database
   */
  async getAllSurahs(apiProvider: ApiProvider = 'TEMPORARY_API'): Promise<SurahInfo[]> {
    const surahs = await this.apiClient.getSurahs();

    // Sync to database
    for (let i = 0; i < surahs.length; i++) {
      await this.repository.upsertSurah(mapApiSurahToUpsert(surahs[i], i + 1, apiProvider));
    }

    return surahs;
  }

  /**
   * Get a specific ayah
   */
  async getAyah(
    surahNo: number,
    ayahNo: number,
    apiProvider: ApiProvider = 'TEMPORARY_API'
  ): Promise<AyahResponse> {
    const ayah = await this.apiClient.getAyah(surahNo, ayahNo);
    
    // Sync to database if not exists
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
        metadata: {
          bengali: ayah.bengali,
          urdu: ayah.urdu,
          audio: ayah.audio,
        } as any,
      });
    }

    return ayah;
  }

  /**
   * Get a complete surah
   */
  async getSurah(
    surahNo: number,
    apiProvider: ApiProvider = 'TEMPORARY_API'
  ): Promise<SurahResponse> {
    const surah = await this.apiClient.getSurah(surahNo);

    // Sync to database
    const dbSurah = await this.repository.upsertSurah(
      mapApiSurahToUpsert(surah, surahNo, apiProvider, { audio: surah.audio })
    );

    // Sync all ayahs
    for (let i = 0; i < surah.english.length; i++) {
      await this.repository.upsertAyah({
        surahId: dbSurah.id,
        surahNumber: surahNo,
        number: i + 1,
        apiProvider,
        arabicText: surah.arabic1[i],
        translationText: surah.english[i],
        transliteration: surah.arabic2[i],
        metadata: buildAyahMetadata(surah, i),
      });
    }

    return surah;
  }

  /**
   * Get tafsir for an ayah
   */
  async getTafsir(surahNo: number, ayahNo: number): Promise<any> {
    return this.apiClient.getTafsir(surahNo, ayahNo);
  }

  /**
   * Get audio for a verse
   */
  async getVerseAudio(surahNo: number, ayahNo: number): Promise<any> {
    return this.apiClient.getVerseAudio(surahNo, ayahNo);
  }

  /**
   * Get audio for a surah
   */
  async getSurahAudio(surahNo: number): Promise<any> {
    return this.apiClient.getSurahAudio(surahNo);
  }
}
