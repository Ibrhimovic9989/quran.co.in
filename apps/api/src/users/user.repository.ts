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
}
