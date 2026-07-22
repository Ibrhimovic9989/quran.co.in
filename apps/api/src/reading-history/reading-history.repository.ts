// Reading history repository — ported from apps/web/lib/repositories/reading-history.repository.ts.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReadingHistoryCreateInput {
  userId: string;
  surahNumber: number;
  ayahNumber?: number;
}

@Injectable()
export class ReadingHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: ReadingHistoryCreateInput) {
    const surah = await this.prisma.surah.findUnique({
      where: { number: data.surahNumber },
    });

    let ayah = null;
    if (data.ayahNumber) {
      ayah = await this.prisma.ayah.findFirst({
        where: { surahNumber: data.surahNumber, number: data.ayahNumber },
      });
    }

    const existing = await this.prisma.readingHistory.findFirst({
      where: {
        userId: data.userId,
        surahNumber: data.surahNumber,
        ayahNumber: data.ayahNumber ?? undefined,
      },
    });

    if (existing) {
      return this.prisma.readingHistory.update({
        where: { id: existing.id },
        data: { readAt: new Date() },
        include: { surah: true, ayah: true },
      });
    }

    return this.prisma.readingHistory.create({
      data: {
        userId: data.userId,
        surahId: surah?.id,
        surahNumber: data.surahNumber,
        ayahId: ayah?.id,
        ayahNumber: data.ayahNumber,
      },
      include: { surah: true, ayah: true },
    });
  }

  async getLatest(userId: string) {
    return this.prisma.readingHistory.findFirst({
      where: { userId },
      include: { surah: true, ayah: true },
      orderBy: { readAt: 'desc' },
    });
  }

  async findByUserId(userId: string, limit?: number) {
    return this.prisma.readingHistory.findMany({
      where: { userId },
      include: { surah: true, ayah: true },
      orderBy: { readAt: 'desc' },
      take: limit,
    });
  }
}
