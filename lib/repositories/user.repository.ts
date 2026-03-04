// User Repository - Data Access Layer
// Handles all user-related database operations

import { prisma } from '@/lib/prisma';
import type { User, UserCreateInput, UserUpdateInput } from '@/types/user';

export class UserRepository {
  /**
   * Find user by Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) return null;
    return {
      ...user,
      imageUrl: user.imageUrl || undefined,
    } as User;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      ...user,
      imageUrl: user.imageUrl || undefined,
    } as User;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      ...user,
      imageUrl: user.imageUrl || undefined,
    } as User;
  }

  /**
   * Create a new user
   */
  async create(data: UserCreateInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
    return {
      ...user,
      imageUrl: user.imageUrl || undefined,
    } as User;
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: UserUpdateInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
    return {
      ...user,
      imageUrl: user.imageUrl || undefined,
    } as User;
  }

  /**
   * Update user by Clerk ID
   */
  async updateByClerkId(clerkId: string, data: UserUpdateInput): Promise<User> {
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
    return {
      ...user,
      imageUrl: user.imageUrl || undefined,
    } as User;
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
