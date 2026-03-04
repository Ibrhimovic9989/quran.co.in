# Quran.co.in - Quranic Application

A modern, feature-rich Quranic application built with Next.js, featuring authentication, search capabilities, and future RAG (Retrieval-Augmented Generation) support.

## 🎯 Project Overview

This application provides users with access to the Quran with a beautiful, modern interface. The application is designed to scale and will eventually support RAG capabilities for advanced Quranic search and AI-powered features.

## 🛠️ Tech Stack

### Frontend & Framework
- **Next.js** (Latest version) - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React** - UI library

### Authentication
- **NextAuth v5** (Auth.js) - Next.js authentication framework
- **Google OAuth 2.0** - Google sign-in provider
- **JWT Sessions** - Secure session management

### Database & ORM
- **Supabase** - PostgreSQL database with real-time capabilities
- **Prisma** - Type-safe ORM for database access
- **pgvector** - Vector extension for future RAG implementation

### API Integration
- **Quran API** (Temporary) - Initial API for Quranic data
- **Quran.com API** (Future) - Will migrate once API key is available

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📋 Features Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and documentation
- [x] Next.js project initialization
- [x] Tailwind CSS configuration
- [x] Project structure setup

### Phase 2: Authentication ✅
- [x] NextAuth v5 integration
- [x] Google OAuth setup
- [x] User session management
- [x] Protected routes implementation
- [x] Authentication components
- [x] Database schema updated for NextAuth

### Phase 3: Database Setup ✅
- [x] Supabase project creation (completed)
- [x] Prisma schema design (modular, multi-API support)
- [x] Database migrations setup
- [x] pgvector extension setup (enabled)
- [x] Repository pattern implementation
- [x] Database tables created and synced

### Phase 4: Landing Page
- [ ] Beautiful, modern landing page design
- [ ] Responsive layout
- [ ] Hero section
- [ ] Features showcase
- [ ] Call-to-action sections

### Phase 5: Quran Integration ✅
- [x] Quran API integration (temporary)
- [x] API client with multi-provider support
- [x] Service layer for Quran operations
- [x] Database sync functionality
- [ ] Quran.com API integration (future)
- [ ] Surah/chapter display components
- [ ] Ayah/verse display components
- [ ] Search functionality

### Phase 6: Future Enhancements
- [ ] RAG implementation
- [ ] Vector embeddings
- [ ] AI-powered search
- [ ] User bookmarks/favorites
- [ ] Reading history
- [ ] Notes and annotations

## 🏗️ Project Structure

```
quran.co.in/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   └── quran/            # Quran-specific components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth utilities
│   └── api/              # API client functions
├── prisma/               # Prisma configuration
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── .env.local           # Environment variables
├── .env.example         # Example environment variables
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## 🗄️ Database Schema (Planned)

### Users Table
- `id` - UUID (Primary Key)
- `clerk_id` - String (Unique, from Clerk)
- `email` - String (Unique)
- `name` - String
- `image_url` - String (Optional)
- `created_at` - DateTime
- `updated_at` - DateTime

### Bookmarks Table
- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key)
- `surah_number` - Integer
- `ayah_number` - Integer
- `created_at` - DateTime

### Notes Table
- `id` - UUID (Primary Key)
- `user_id` - UUID (Foreign Key)
- `surah_number` - Integer
- `ayah_number` - Integer
- `note_text` - Text
- `created_at` - DateTime
- `updated_at` - DateTime

### Quran Verses Table (for RAG)
- `id` - UUID (Primary Key)
- `surah_number` - Integer
- `ayah_number` - Integer
- `arabic_text` - Text
- `translation_text` - Text
- `embedding` - Vector (pgvector) - For future RAG
- `created_at` - DateTime

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication (NextAuth with Google OAuth)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-generate-with-openssl-rand-base64-32"

# Quran API (Temporary)
QURAN_API_URL="https://quranapi.pages.dev/api"
# Note: No API key required for temporary API

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Google Cloud Console account (for OAuth credentials)
- Quran API access (temporary)

### Installation Steps

1. **Clone and install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all required values

3. **Set up Supabase**
   - Create a new Supabase project
   - Enable pgvector extension
   - Copy connection string to `DATABASE_URL`

4. **Set up Prisma**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all files
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Write clean, maintainable code
- Add comments for complex logic

### Git Workflow
- Create feature branches for new features
- Write descriptive commit messages
- Keep commits atomic and focused

### Testing
- Write tests for critical functionality
- Test authentication flows
- Test API integrations

## 🔄 API Integration

### Current: Temporary Quran API
- Basic Quran data fetching
- Surah and Ayah retrieval

### Future: Quran.com API
- Full API integration once key is available
- Enhanced data and features

## 🎨 Design Principles

- **Modern & Clean**: Minimalist design with focus on content
- **Responsive**: Mobile-first approach
- **Accessible**: WCAG compliance
- **Fast**: Optimized performance
- **Beautiful**: Engaging visual design

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

## 🤝 Contributing

This is a personal project, but contributions and suggestions are welcome!

## 📄 License

[To be determined]

---

**Note**: This project is in active development. Features and structure may evolve as development progresses.
