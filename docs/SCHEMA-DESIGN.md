# Database Schema Design Philosophy

## 🎯 Design Principles

### 1. Multi-API Support
The schema is designed to support multiple Quran API providers simultaneously:
- **Enum-based Provider System**: `ApiProvider` enum (QURAN_COM, TEMPORARY_API, CUSTOM)
- **Provider-specific IDs**: `apiSourceId` stores external API identifiers
- **Metadata Flexibility**: JSON `metadata` fields store API-specific data
- **Unique Constraints**: Composite unique keys on `(number, apiProvider)` prevent conflicts

### 2. Extensibility Without Breaking Changes
- **Optional Fields**: Many fields are optional to accommodate different API structures
- **JSON Metadata**: Flexible storage for API-specific data without schema changes
- **Versioning**: `syncVersion` in ApiConfiguration tracks API changes
- **Soft Relationships**: Foreign keys are optional where appropriate

### 3. Modularity
- **Single Responsibility**: Each table has one clear purpose
- **Normalized Design**: Proper relationships and foreign keys
- **Separation of Concerns**: User data, Quran data, and interactions are separate

### 4. Future-Proofing
- **RAG Ready**: pgvector support built-in for embeddings
- **Scalable Indexes**: Strategic indexes for performance
- **Audit Trails**: `createdAt` and `updatedAt` on all tables
- **Soft Deletes**: Can be added via `deletedAt` field if needed

## 📊 Schema Structure

### Core Entities

#### Users
- **Purpose**: User account management
- **Key Features**: Clerk integration, email uniqueness
- **Relationships**: One-to-many with bookmarks, notes, reading history

#### Surahs
- **Purpose**: Quran chapters
- **Key Features**: Multi-API support, flexible metadata
- **Relationships**: One-to-many with ayahs, bookmarks, notes

#### Ayahs
- **Purpose**: Quran verses
- **Key Features**: Multi-API support, vector embedding support
- **Relationships**: Many-to-one with surah, one-to-many with bookmarks/notes

### User Interaction Tables

#### Bookmarks
- **Purpose**: User bookmarks
- **Key Features**: Can bookmark surah or specific ayah
- **Flexibility**: Optional relationships allow surah-only bookmarks

#### Notes
- **Purpose**: User annotations
- **Key Features**: Privacy flag, flexible content
- **Relationships**: Linked to surah and/or ayah

#### Reading History
- **Purpose**: Track reading progress
- **Key Features**: Timestamp-based, supports analytics

### API Management

#### ApiConfiguration
- **Purpose**: Manage API provider settings
- **Key Features**: Active/inactive toggle, sync tracking
- **Flexibility**: JSON config for API-specific settings

#### VerseEmbedding
- **Purpose**: Vector embeddings for RAG
- **Key Features**: Separate table for embeddings, versioning support
- **Future**: Ready for semantic search

## 🔄 Multi-API Strategy

### How It Works

1. **Provider Enum**: All Quran data tables include `apiProvider` field
2. **Unique Constraints**: `(number, apiProvider)` ensures no conflicts
3. **Metadata Storage**: API-specific fields stored in JSON `metadata`
4. **Flexible Queries**: Repositories accept `apiProvider` parameter

### Example: Adding New API

```typescript
// 1. Add to enum (if needed)
enum ApiProvider {
  QURAN_COM
  TEMPORARY_API
  NEW_API  // Add here
}

// 2. Store API-specific data in metadata
{
  surahNumber: 1,
  apiProvider: 'NEW_API',
  metadata: {
    customField: 'value',
    apiSpecificId: '123'
  }
}

// 3. Query by provider
const surah = await quranRepo.findSurahByNumber(1, 'NEW_API');
```

### Benefits

- ✅ No schema changes when switching APIs
- ✅ Can run multiple APIs simultaneously
- ✅ Easy A/B testing of APIs
- ✅ Gradual migration between APIs
- ✅ API-specific features via metadata

## 🛡️ Preventing Schema Breakage

### Strategies Used

1. **Optional Fields**: Most fields are optional
2. **JSON Metadata**: Extensible without schema changes
3. **Versioning**: Track API versions
4. **Backward Compatibility**: New fields don't break existing queries
5. **Migration Safety**: Prisma migrations are reversible

### Adding New Fields

```prisma
// Safe addition - optional field
model Surah {
  // ... existing fields
  newOptionalField String?  // ✅ Safe
}

// Safe addition - with default
model Surah {
  // ... existing fields
  newFieldWithDefault String @default("")  // ✅ Safe
}

// Breaking change - avoid
model Surah {
  // ... existing fields
  newRequiredField String  // ❌ Breaking - use optional first
}
```

## 📈 Performance Considerations

### Indexes

- **User Lookups**: Indexed on `clerkId` and `email`
- **Quran Queries**: Indexed on `(surahNumber, number)` and `apiProvider`
- **User Interactions**: Indexed on `userId` and `(surahNumber, ayahNumber)`
- **Reading History**: Indexed on `userId` and `readAt` for time-based queries

### Query Optimization

- **Repository Pattern**: Centralized query logic
- **Selective Includes**: Only load needed relationships
- **Pagination Ready**: Schema supports cursor-based pagination

## 🔐 Security Considerations

- **User Isolation**: All user data scoped by `userId`
- **Privacy Flags**: Notes have `isPrivate` field
- **API Keys**: Stored in ApiConfiguration (encrypt in production)
- **Audit Trail**: Timestamps on all tables

## 🚀 Future Enhancements

### Planned Additions

1. **Translations Table**: Separate table for multiple translations
2. **Tafsir Table**: Commentary/exegesis support
3. **Audio Table**: Multiple recitation support
4. **Tags System**: User-defined tags for organization
5. **Sharing**: Public/private sharing of notes

### Schema Evolution

- All future additions will follow the same principles
- Backward compatibility maintained
- Migration scripts for data transformation
- Version tracking for schema changes

## 📝 Best Practices

1. **Always use repositories** for data access
2. **Never query Prisma directly** in components
3. **Use transactions** for multi-table operations
4. **Validate API provider** before queries
5. **Handle metadata** as typed objects, not `any`

## 🔍 Example Queries

### Get Surah with Multiple Providers

```typescript
const surahs = await prisma.surah.findMany({
  where: { number: 1 },
  include: { ayahs: true }
});
// Returns surah from all providers
```

### Get Specific Provider

```typescript
const surah = await quranRepo.findSurahByNumber(1, 'QURAN_COM');
// Returns only from quran.com API
```

### User Bookmarks Across Providers

```typescript
const bookmarks = await prisma.bookmark.findMany({
  where: { userId },
  include: {
    surah: true,
    ayah: { include: { surah: true } }
  }
});
```
