// Reading History Repository - Data Access Layer
// Handles all reading history-related database operations

import { prisma } from '@/lib/prisma';

export interface ReadingHistoryCreateInput {
  userId: string;
  surahNumber: number;
  ayahNumber?: number;
}

export class ReadingHistoryRepository {
  /**
   * Create or update reading history
   */
  async upsert(data: ReadingHistoryCreateInput) {
    // Find surah and ayah IDs if needed
    const surah = await prisma.surah.findUnique({
      where: { number: data.surahNumber },
    });

    let ayah = null;
    if (data.ayahNumber) {
      ayah = await prisma.ayah.findFirst({
        where: {
          surahNumber: data.surahNumber,
          number: data.ayahNumber,
        },
      });
    }

    // Check if history exists
    const existing = await prisma.readingHistory.findFirst({
      where: {
        userId: data.userId,
        surahNumber: data.surahNumber,
        ayahNumber: data.ayahNumber ?? undefined,
      },
    });

    if (existing) {
      // Update existing record
      return prisma.readingHistory.update({
        where: { id: existing.id },
        data: {
          readAt: new Date(),
        },
        include: {
          surah: true,
          ayah: true,
        },
      });
    }

    // Create new record
    return prisma.readingHistory.create({
      data: {
        userId: data.userId,
        surahId: surah?.id,
        surahNumber: data.surahNumber,
        ayahId: ayah?.id,
        ayahNumber: data.ayahNumber,
      },
      include: {
        surah: true,
        ayah: true,
      },
    });
  }

  /**
   * Get latest reading history for a user
   */
  async getLatest(userId: string) {
    return prisma.readingHistory.findFirst({
      where: { userId },
      include: {
        surah: true,
        ayah: true,
      },
      orderBy: { readAt: 'desc' },
    });
  }

  /**
   * Get all reading history for a user
   */
  async findByUserId(userId: string, limit?: number) {
    return prisma.readingHistory.findMany({
      where: { userId },
      include: {
        surah: true,
        ayah: true,
      },
      orderBy: { readAt: 'desc' },
      take: limit,
    });
  }
}
