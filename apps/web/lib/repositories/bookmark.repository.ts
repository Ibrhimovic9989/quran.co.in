// Bookmark Repository - Data Access Layer
// Handles all bookmark-related database operations

import { prisma } from '@/lib/prisma';

export interface BookmarkCreateInput {
  userId: string;
  surahNumber: number;
  ayahNumber?: number;
  note?: string;
}

export interface BookmarkUpdateInput {
  note?: string;
}

export class BookmarkRepository {
  /**
   * Create a bookmark
   */
  async create(data: BookmarkCreateInput) {
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

    return prisma.bookmark.create({
      data: {
        userId: data.userId,
        surahId: surah?.id,
        surahNumber: data.surahNumber,
        ayahId: ayah?.id,
        ayahNumber: data.ayahNumber,
        note: data.note,
      },
      include: {
        surah: true,
        ayah: true,
      },
    });
  }

  /**
   * Find bookmark by user, surah, and ayah
   */
  async findByUserAndAyah(userId: string, surahNumber: number, ayahNumber?: number) {
    return prisma.bookmark.findUnique({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber,
          ayahNumber: (ayahNumber !== undefined ? ayahNumber : null) as number,
        },
      },
      include: {
        surah: true,
        ayah: true,
      },
    });
  }

  /**
   * Get all bookmarks for a user
   */
  async findByUserId(userId: string) {
    return prisma.bookmark.findMany({
      where: { userId },
      include: {
        surah: true,
        ayah: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a bookmark
   */
  async delete(userId: string, surahNumber: number, ayahNumber?: number) {
    return prisma.bookmark.delete({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber,
          ayahNumber: (ayahNumber ?? null) as number,
        },
      },
    });
  }

  /**
   * Update a bookmark
   */
  async update(
    userId: string,
    surahNumber: number,
    ayahNumber: number | undefined,
    data: BookmarkUpdateInput
  ) {
    return prisma.bookmark.update({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber,
          ayahNumber: (ayahNumber ?? null) as number,
        },
      },
      data,
      include: {
        surah: true,
        ayah: true,
      },
    });
  }

  /**
   * Delete all bookmarks for a user in a specific surah
   */
  async deleteAllInSurah(userId: string, surahNumber: number) {
    return prisma.bookmark.deleteMany({
      where: {
        userId,
        surahNumber,
      },
    });
  }
}
