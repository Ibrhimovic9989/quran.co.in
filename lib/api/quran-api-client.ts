// Quran API Client
// Client for the temporary Quran API (quranapi.pages.dev)

import type {
  SurahInfo,
  AyahResponse,
  SurahResponse,
  TafsirResponse,
  RecitersResponse,
  AudioVerseResponse,
  AudioSurahResponse,
} from '@/types/quran-api';

const API_BASE_URL = 'https://quranapi.pages.dev';

export class QuranApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get list of all surahs
   */
  async getSurahs(): Promise<SurahInfo[]> {
    // According to docs: https://quranapi.pages.dev/api/surah.json
    const url = `${this.baseUrl}/api/surah.json`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.statusText} (${response.status})`);
    }
    
    return response.json();
  }

  /**
   * Get a specific ayah
   */
  async getAyah(surahNo: number, ayahNo: number): Promise<AyahResponse> {
    const response = await fetch(`${this.baseUrl}/api/${surahNo}/${ayahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ayah: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get a complete surah
   */
  async getSurah(surahNo: number): Promise<SurahResponse> {
    const response = await fetch(`${this.baseUrl}/api/${surahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get tafsir for a specific ayah
   */
  async getTafsir(surahNo: number, ayahNo: number): Promise<TafsirResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/tafsir/${surahNo}_${ayahNo}.json`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch tafsir: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get full translation dump
   */
  async getFullTranslation(
    translationName: string
  ): Promise<SurahResponse[]> {
    const response = await fetch(`${this.baseUrl}/api/${translationName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch translation: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get list of available reciters
   */
  async getReciters(): Promise<RecitersResponse> {
    const response = await fetch(`${this.baseUrl}/api/reciters.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reciters: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get audio for a specific verse
   */
  async getVerseAudio(
    surahNo: number,
    ayahNo: number
  ): Promise<AudioVerseResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/audio/${surahNo}/${ayahNo}.json`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch verse audio: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get audio for a complete surah
   */
  async getSurahAudio(surahNo: number): Promise<AudioSurahResponse> {
    const response = await fetch(`${this.baseUrl}/api/audio/${surahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah audio: ${response.statusText}`);
    }
    return response.json();
  }
}
