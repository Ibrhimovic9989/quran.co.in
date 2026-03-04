// API Factory
// Factory pattern to create API clients for different providers

import { QuranApiClient } from './quran-api-client';
import type { ApiProvider } from '@prisma/client';

export interface IApiClient {
  getSurahs(): Promise<any>;
  getAyah(surahNo: number, ayahNo: number): Promise<any>;
  getSurah(surahNo: number): Promise<any>;
}

export class ApiClientFactory {
  /**
   * Create API client based on provider
   */
  static createClient(provider: ApiProvider): IApiClient {
    switch (provider) {
      case 'TEMPORARY_API':
        return new QuranApiClient(
          process.env.QURAN_API_URL || 'https://quranapi.pages.dev/api'
        );
      case 'QURAN_COM':
        // Future: Create QuranComApiClient
        throw new Error('Quran.com API client not yet implemented');
      case 'CUSTOM':
        // Future: Create CustomApiClient
        throw new Error('Custom API client not yet implemented');
      default:
        return new QuranApiClient(
          process.env.QURAN_API_URL || 'https://quranapi.pages.dev/api'
        );
    }
  }

  /**
   * Get base URL for provider
   */
  static getBaseUrl(provider: ApiProvider): string {
    switch (provider) {
      case 'TEMPORARY_API':
        // Use quranapi.pages.dev (not api.quran.com)
        return 'https://quranapi.pages.dev';
      case 'QURAN_COM':
        return process.env.QURAN_COM_API_URL || '';
      default:
        return 'https://quranapi.pages.dev';
    }
  }
}
