// Single source of truth for the Quran API base URL per provider.
// Previously this switch was copy-pasted across the service and cache layers
// (and disagreed on the trailing "/api" segment, a latent double-"/api" bug).

import type { ApiProvider } from '@prisma/client';

export const DEFAULT_QURAN_API_BASE_URL = 'https://quranapi.pages.dev';

export function getApiBaseUrl(provider: ApiProvider): string {
  switch (provider) {
    case 'QURAN_COM':
      return process.env.QURAN_COM_API_URL || DEFAULT_QURAN_API_BASE_URL;
    case 'CUSTOM':
    case 'TEMPORARY_API':
    default:
      return DEFAULT_QURAN_API_BASE_URL;
  }
}
