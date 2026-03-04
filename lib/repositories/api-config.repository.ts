// API Configuration Repository
// Manages API provider configurations

import { prisma } from '@/lib/prisma';
import type { ApiProvider } from '@prisma/client';

export class ApiConfigRepository {
  /**
   * Get active API configuration by provider
   */
  async getActiveConfig(provider: ApiProvider) {
    return prisma.apiConfiguration.findUnique({
      where: { provider },
    });
  }

  /**
   * Get all API configurations
   */
  async getAllConfigs() {
    return prisma.apiConfiguration.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Create or update API configuration
   */
  async upsertConfig(data: {
    provider: ApiProvider;
    apiKey?: string;
    baseUrl: string;
    isActive?: boolean;
    config?: Record<string, unknown>;
  }) {
    return prisma.apiConfiguration.upsert({
      where: { provider: data.provider },
      update: {
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        isActive: data.isActive ?? true,
        config: data.config as any,
        updatedAt: new Date(),
      },
      create: {
        provider: data.provider,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        isActive: data.isActive ?? true,
        config: data.config as any,
      },
    });
  }

  /**
   * Update last sync time
   */
  async updateLastSync(provider: ApiProvider) {
    return prisma.apiConfiguration.update({
      where: { provider },
      data: {
        lastSyncedAt: new Date(),
      },
    });
  }

  /**
   * Toggle API provider active status
   */
  async toggleActive(provider: ApiProvider, isActive: boolean) {
    return prisma.apiConfiguration.update({
      where: { provider },
      data: { isActive },
    });
  }
}
