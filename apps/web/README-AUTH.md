# Authentication Setup Guide

This guide explains how to set up Google OAuth authentication using NextAuth (Auth.js) for the Quran.co.in application.

## 🔐 Authentication Stack

- **NextAuth v5** (Auth.js) - Next.js authentication framework
- **Google OAuth 2.0** - Google sign-in provider
- **Prisma** - Database session management
- **JWT** - Session strategy

## 📋 Prerequisites

1. **Google Cloud Console Account**
   - Create a project at [Google Cloud Console](https://console.cloud.google.com)
   - Enable Google+ API

2. **OAuth 2.0 Credentials**
   - Create OAuth 2.0 Client ID
   - Configure authorized redirect URIs

## 🚀 Setup Steps

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   For production, also add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
7. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use an online generator: [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

### 3. Update Database Schema

The Prisma schema includes NextAuth tables. Push changes:

```bash
npm run db:generate
npx dotenv-cli -e .env.local -- npx prisma db push
```

This creates:
- `accounts` - OAuth account connections
- `sessions` - User sessions
- `verification_tokens` - Email verification tokens
- Updates `users` table with NextAuth fields

### 4. Test Authentication

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/sign-in`
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected to `/dashboard`

## 🏗️ Architecture

### Authentication Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects back to `/api/auth/callback/google`
4. NextAuth creates/updates user in database
5. Session created and stored
6. User redirected to dashboard

### File Structure

```
lib/auth/
  ├── config.ts          # NextAuth configuration
  ├── session.ts         # Session utilities
  └── index.ts           # Barrel exports

app/api/auth/
  └── [...nextauth]/
      └── route.ts       # NextAuth API route

components/auth/
  ├── sign-in-button.tsx
  ├── sign-out-button.tsx
  ├── user-profile.tsx
  └── auth-provider.tsx

middleware.ts            # Route protection
```

## 🔒 Protected Routes

Routes are protected using Next.js middleware:

```typescript
// middleware.ts protects:
- /dashboard/*
- /api/protected/*
```

### Using Protected Routes

```typescript
// Server Component
import { getCurrentUser } from '@/lib/auth/session';

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return <div>Protected content</div>;
}
```

### Client Components

```typescript
'use client';
import { useSession } from 'next-auth/react';

export function ProtectedComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Please sign in</div>;
  
  return <div>Protected content</div>;
}
```

## 🛠️ Available Components

### SignInButton
```tsx
import { SignInButton } from '@/components/auth';

<SignInButton className="custom-class">
  Custom Text
</SignInButton>
```

### SignOutButton
```tsx
import { SignOutButton } from '@/components/auth';

<SignOutButton callbackUrl="/">
  Sign Out
</SignOutButton>
```

### UserProfile
```tsx
import { UserProfile } from '@/components/auth';

<UserProfile />
```

## 📝 User Repository Integration

Users are automatically synced to the `users` table:

```typescript
import { UserRepository } from '@/lib/repositories';

const userRepo = new UserRepository();
const user = await userRepo.findByEmail('user@example.com');
```

## 🔄 Session Management

### Get Current Session (Server)
```typescript
import { getCurrentSession, getCurrentUser } from '@/lib/auth/session';

const session = await getCurrentSession();
const user = await getCurrentUser();
```

### Get Current Session (Client)
```typescript
'use client';
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
```

## 🐛 Troubleshooting

### "Invalid credentials" error
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check redirect URI matches exactly in Google Console

### Session not persisting
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Database errors
- Ensure Prisma schema is pushed: `npx prisma db push`
- Check database connection in `.env.local`
- Verify NextAuth tables exist

### Redirect loop
- Check middleware configuration
- Verify callback URL is correct
- Ensure `NEXTAUTH_URL` is set correctly

## 🔐 Security Best Practices

1. **Never commit secrets** - Keep `.env.local` in `.gitignore`
2. **Use HTTPS in production** - Required for OAuth
3. **Rotate secrets regularly** - Change `NEXTAUTH_SECRET` periodically
4. **Validate redirect URIs** - Only allow trusted domains
5. **Monitor sessions** - Implement session timeout

## 📚 Resources

- [NextAuth Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
