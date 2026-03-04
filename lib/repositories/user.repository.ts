// User Repository - Data Access Layer
// Handles all user-related database operations

import { prisma } from '@/lib/prisma';
import type { User, UserCreateInput, UserUpdateInput } from '@/types/user';

export class UserRepository {
  /**
   * Find user by Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   */
  async create(data: UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  /**
   * Update user by Clerk ID
   */
  async updateByClerkId(clerkId: string, data: UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { clerkId },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Check if user exists by Clerk ID
   */
  async existsByClerkId(clerkId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    return user !== null;
  }
}
