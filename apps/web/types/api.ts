// API-related type definitions
// Supports multiple API providers

export enum ApiProvider {
  QURAN_COM = 'QURAN_COM',
  TEMPORARY_API = 'TEMPORARY_API',
  CUSTOM = 'CUSTOM',
}

export interface ApiConfiguration {
  id: string;
  provider: ApiProvider;
  apiKey?: string;
  baseUrl: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  syncVersion: number;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  provider: ApiProvider;
  timestamp: Date;
}
