// Database helper utilities
// Provides common database operations and utilities

import { prisma } from '@/lib/prisma';
import type { ApiProvider } from '@prisma/client';

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const [userCount, surahCount, ayahCount] = await Promise.all([
    prisma.user.count(),
    prisma.surah.count(),
    prisma.ayah.count(),
  ]);

  return {
    users: userCount,
    surahs: surahCount,
    ayahs: ayahCount,
  };
}

/**
 * Check if pgvector extension is enabled
 */
export async function checkPgVectorExtension(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ extname: string }>>`
      SELECT extname FROM pg_extension WHERE extname = 'vector'
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Error checking pgvector extension:', error);
    return false;
  }
}

/**
 * Get active API providers
 */
export async function getActiveApiProviders(): Promise<ApiProvider[]> {
  const configs = await prisma.apiConfiguration.findMany({
    where: { isActive: true },
    select: { provider: true },
  });
  return configs.map((config) => config.provider);
}

/**
 * Disconnect Prisma client (useful for cleanup)
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
