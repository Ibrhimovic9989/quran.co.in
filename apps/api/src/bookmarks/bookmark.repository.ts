// Bookmark repository — ported from apps/web/lib/repositories/bookmark.repository.ts.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface BookmarkCreateInput {
  userId: string;
  surahNumber: number;
  ayahNumber?: number;
  note?: string;
}

export interface BookmarkUpdateInput {
  note?: string;
}

@Injectable()
export class BookmarkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: BookmarkCreateInput) {
    const surah = await this.prisma.surah.findUnique({
      where: { number: data.surahNumber },
    });

    let ayah = null;
    if (data.ayahNumber) {
      ayah = await this.prisma.ayah.findFirst({
        where: { surahNumber: data.surahNumber, number: data.ayahNumber },
      });
    }

    return this.prisma.bookmark.create({
      data: {
        userId: data.userId,
        surahId: surah?.id,
        surahNumber: data.surahNumber,
        ayahId: ayah?.id,
        ayahNumber: data.ayahNumber,
        note: data.note,
      },
      include: { surah: true, ayah: true },
    });
  }

  async findByUserAndAyah(userId: string, surahNumber: number, ayahNumber?: number) {
    return this.prisma.bookmark.findUnique({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber,
          ayahNumber: (ayahNumber !== undefined ? ayahNumber : null) as number,
        },
      },
      include: { surah: true, ayah: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: { surah: true, ayah: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(userId: string, surahNumber: number, ayahNumber?: number) {
    return this.prisma.bookmark.delete({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber,
          ayahNumber: (ayahNumber ?? null) as number,
        },
      },
    });
  }

  async update(
    userId: string,
    surahNumber: number,
    ayahNumber: number | undefined,
    data: BookmarkUpdateInput,
  ) {
    return this.prisma.bookmark.update({
      where: {
        userId_surahNumber_ayahNumber: {
          userId,
          surahNumber,
          ayahNumber: (ayahNumber ?? null) as number,
        },
      },
      data,
      include: { surah: true, ayah: true },
    });
  }

  async deleteAllInSurah(userId: string, surahNumber: number) {
    return this.prisma.bookmark.deleteMany({ where: { userId, surahNumber } });
  }
}
