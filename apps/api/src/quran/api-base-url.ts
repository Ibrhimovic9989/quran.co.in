// Single source of truth for the external Quran API base URL per provider.
// Ported from apps/web/lib/api/api-base-url.ts.

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
