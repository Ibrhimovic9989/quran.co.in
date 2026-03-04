// User-related type definitions

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  clerkId: string;
  email: string;
  name: string;
  imageUrl?: string;
}

export interface UserUpdateInput {
  name?: string;
  imageUrl?: string;
}
