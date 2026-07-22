// Client for the external temporary Quran API (quranapi.pages.dev).
// Ported from apps/web/lib/api/quran-api-client.ts.

import type {
  SurahInfo,
  AyahResponse,
  SurahResponse,
  TafsirResponse,
  RecitersResponse,
  AudioVerseResponse,
  AudioSurahResponse,
} from '../common/types/quran-api.types';
import { DEFAULT_QURAN_API_BASE_URL } from './api-base-url';

export class QuranApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = DEFAULT_QURAN_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getSurahs(): Promise<SurahInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/surah.json`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.statusText} (${response.status})`);
    }
    return response.json() as Promise<SurahInfo[]>;
  }

  async getAyah(surahNo: number, ayahNo: number): Promise<AyahResponse> {
    const response = await fetch(`${this.baseUrl}/api/${surahNo}/${ayahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ayah: ${response.statusText}`);
    }
    return response.json() as Promise<AyahResponse>;
  }

  async getSurah(surahNo: number): Promise<SurahResponse> {
    const response = await fetch(`${this.baseUrl}/api/${surahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah: ${response.statusText}`);
    }
    return response.json() as Promise<SurahResponse>;
  }

  async getTafsir(surahNo: number, ayahNo: number): Promise<TafsirResponse> {
    const response = await fetch(`${this.baseUrl}/api/tafsir/${surahNo}_${ayahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tafsir: ${response.statusText}`);
    }
    return response.json() as Promise<TafsirResponse>;
  }

  async getReciters(): Promise<RecitersResponse> {
    const response = await fetch(`${this.baseUrl}/api/reciters.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reciters: ${response.statusText}`);
    }
    return response.json() as Promise<RecitersResponse>;
  }

  async getVerseAudio(surahNo: number, ayahNo: number): Promise<AudioVerseResponse> {
    const response = await fetch(`${this.baseUrl}/api/audio/${surahNo}/${ayahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch verse audio: ${response.statusText}`);
    }
    return response.json() as Promise<AudioVerseResponse>;
  }

  async getSurahAudio(surahNo: number): Promise<AudioSurahResponse> {
    const response = await fetch(`${this.baseUrl}/api/audio/${surahNo}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch surah audio: ${response.statusText}`);
    }
    return response.json() as Promise<AudioSurahResponse>;
  }
}
