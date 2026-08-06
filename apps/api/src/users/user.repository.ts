// User repository — ported from apps/web/lib/repositories/user.repository.ts.
// Returns Prisma User models directly (the old custom User-type mapping was
// cosmetic).

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserCreateInput {
  authProviderId: string;
  email: string;
  name: string;
  imageUrl?: string;
}

export interface UserUpdateInput {
  name?: string;
  imageUrl?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByAuthProviderId(authProviderId: string) {
    return this.prisma.user.findUnique({ where: { authProviderId } });
  }

  async create(data: UserCreateInput) {
    return this.prisma.user.create({
      data: {
        authProviderId: data.authProviderId,
        email: data.email,
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  async update(id: string, data: UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data: { name: data.name, imageUrl: data.imageUrl },
    });
  }

  // ── Ask (AI) developer-access gate ──────────────────────────────────────
  private static readonly askSelect = {
    askAccess: true,
    askUseCase: true,
    askRequestedAt: true,
    askDecidedAt: true,
  } as const;

  getAskAccess(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: UserRepository.askSelect,
    });
  }

  requestAskAccess(userId: string, useCase: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        askAccess: 'pending',
        askUseCase: useCase,
        askRequestedAt: new Date(),
        askDecidedAt: null,
      },
      select: UserRepository.askSelect,
    });
  }

  decideAskAccess(userId: string, decision: 'approved' | 'denied') {
    return this.prisma.user.update({
      where: { id: userId },
      data: { askAccess: decision, askDecidedAt: new Date() },
      select: { id: true, email: true, name: true, askAccess: true },
    });
  }

  /** Every developer who has ever requested Ask, pending first. Owner-only view. */
  listAskRequests() {
    return this.prisma.user.findMany({
      where: { askAccess: { in: ['pending', 'approved', 'denied'] } },
      orderBy: [{ askAccess: 'asc' }, { askRequestedAt: 'desc' }],
      select: {
        id: true,
        email: true,
        name: true,
        askAccess: true,
        askUseCase: true,
        askRequestedAt: true,
        askDecidedAt: true,
      },
    });
  }
}
