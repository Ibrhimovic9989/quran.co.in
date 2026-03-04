# Database Setup Guide

This guide explains how to set up the database for Quran.co.in with Supabase and Prisma.

## 🗄️ Database Architecture

The database schema is designed to be:
- **Modular**: Each table has a single responsibility
- **Extensible**: Supports multiple API providers without schema changes
- **Future-proof**: Uses JSON metadata fields for API-specific data
- **RAG-ready**: Includes pgvector support for embeddings

## 📋 Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project
3. **Database URL**: Get your connection string from Supabase

## 🚀 Setup Steps

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created

### 2. Enable pgvector Extension

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Or use the migration file:
```bash
# Copy the SQL from prisma/migrations/0_enable_pgvector.sql
# Paste it in Supabase SQL Editor and run
```

### 3. Get Database Connection String

1. Go to Project Settings → Database
2. Copy the "Connection string" under "Connection pooling"
3. Use the format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres?sslmode=require`

### 4. Configure Environment Variables

Create `.env.local` file:

```env
# Database URLs
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
```

**Note**: 
- `DATABASE_URL` is for connection pooling (recommended for production)
- `DIRECT_URL` is for migrations (direct connection)

### 5. Install Dependencies

```bash
npm install
```

### 6. Generate Prisma Client

```bash
npm run db:generate
```

### 7. Run Migrations

```bash
npm run db:migrate
```

This will:
- Create all tables
- Set up indexes
- Create relationships

### 8. Verify Setup

```bash
npm run db:studio
```

This opens Prisma Studio where you can view and manage your database.

## 📊 Schema Overview

### Core Tables

1. **users** - User accounts (linked to Clerk)
2. **surahs** - Quran chapters/surahs
3. **ayahs** - Quran verses/ayahs
4. **bookmarks** - User bookmarks
5. **notes** - User notes
6. **reading_history** - User reading progress
7. **api_configurations** - API provider settings
8. **verse_embeddings** - Vector embeddings for RAG

### Multi-API Support

The schema supports multiple API providers through:
- `apiProvider` enum field (QURAN_COM, TEMPORARY_API, CUSTOM)
- `apiSourceId` for external API IDs
- `metadata` JSON field for API-specific data
- Unique constraints on `(number, apiProvider)` combinations

### Extensibility Features

1. **JSON Metadata**: Each table has optional `metadata` JSON fields
2. **Optional Fields**: Many fields are optional to support different APIs
3. **Versioning**: `syncVersion` in ApiConfiguration for API changes
4. **Soft Relationships**: Foreign keys are optional where appropriate

## 🔧 Database Operations

### Using Repositories

The codebase uses a repository pattern for data access:

```typescript
import { UserRepository, QuranRepository } from '@/lib/repositories';

const userRepo = new UserRepository();
const user = await userRepo.findByClerkId('clerk_123');

const quranRepo = new QuranRepository();
const surah = await quranRepo.findSurahByNumber(1, 'TEMPORARY_API');
```

### Direct Prisma Access

For complex queries:

```typescript
import { prisma } from '@/lib/prisma';

const users = await prisma.user.findMany({
  where: { email: { contains: '@gmail.com' } },
});
```

## 🔄 Migrations

### Create New Migration

```bash
npm run db:migrate
# Enter migration name when prompted
```

### Apply Migrations

```bash
npm run db:migrate
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

**Warning**: This will delete all data!

## 🧪 Testing Database Connection

```typescript
import { checkDatabaseConnection } from '@/lib/utils/db-helpers';

const isConnected = await checkDatabaseConnection();
console.log('Database connected:', isConnected);
```

## 📝 Notes

- **pgvector**: Required for future RAG features. Must be enabled before migrations.
- **Connection Pooling**: Use `DATABASE_URL` for application connections
- **Direct Connection**: Use `DIRECT_URL` for migrations only
- **SSL Mode**: Always use `sslmode=require` for Supabase

## 🐛 Troubleshooting

### Migration Fails

1. Check `DIRECT_URL` is correct
2. Verify pgvector extension is enabled
3. Check Supabase project is active

### Connection Errors

1. Verify `DATABASE_URL` format
2. Check password is correct
3. Ensure IP is allowed (Supabase settings)

### pgvector Not Found

1. Run the SQL in `prisma/migrations/0_enable_pgvector.sql`
2. Verify in Supabase SQL Editor: `SELECT * FROM pg_extension WHERE extname = 'vector';`

## 🔐 Security

- Never commit `.env.local` to git
- Use environment variables for all secrets
- Rotate database passwords regularly
- Use connection pooling in production
