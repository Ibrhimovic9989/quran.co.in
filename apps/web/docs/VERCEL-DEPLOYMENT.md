# Vercel Deployment Guide

## Prerequisites

1. GitHub repository pushed (✅ Done)
2. Vercel account (sign up at https://vercel.com)
3. Environment variables ready

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `Ibrhimovic9989/quran.co.in`
4. Vercel will auto-detect Next.js

### 2. Configure Environment Variables

**Important:** Set environment variables directly in Vercel Dashboard, NOT as secrets.

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments:

#### Required Environment Variables

**Database:**
- `DATABASE_URL` - Your Supabase connection string (pooler)
  - Example: `postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- `DIRECT_URL` - Your Supabase direct connection string
  - Example: `postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres`

**NextAuth:**
- `NEXTAUTH_SECRET` - Your secret key (generate a new one for production)
  - Generate: `openssl rand -base64 32`
  - Or use: https://generate-secret.vercel.app/32
- `NEXTAUTH_URL` - **CRITICAL: Your production URL**
  - **MUST be set to your actual Vercel domain**
  - **DO NOT use `http://localhost:3000` in production**
  - Format: `https://your-project-name.vercel.app`
  - Example: `https://quran-co-in.vercel.app`
  - **This must match exactly what you see in your Vercel deployment URL**
  - If you have a custom domain, use that instead

**Google OAuth:**
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret

#### Optional Environment Variables

- `NEXT_PUBLIC_APP_URL` - Your production URL (same as NEXTAUTH_URL)
- `QURAN_API_URL` - Quran API base URL (defaults to `https://quranapi.pages.dev`)

**Note:** Do NOT use the `@secret_name` syntax. Enter the actual values directly.

### 3. Update Google OAuth Settings

In Google Cloud Console, add your Vercel domain to authorized redirect URIs:
- `https://your-domain.vercel.app/api/auth/callback/google`

### 4. Deploy

1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Run `npm run build`
   - Deploy to production

### 5. Run Database Migrations

After first deployment, run migrations:

```bash
# Option 1: Via Vercel CLI
vercel env pull .env.local
npm run db:migrate

# Option 2: Via Supabase Dashboard
# Run the migration SQL directly in Supabase SQL Editor
```

### 6. Post-Deployment

1. **Generate Prisma Client** (if needed):
   ```bash
   npm run db:generate
   ```

2. **Sync Quran Data** (optional):
   ```bash
   npm run sync:quran
   ```

## Vercel Configuration

The project includes `vercel.json` with:
- Build command: `npm run build`
- Framework: Next.js (auto-detected)
- Region: `iad1` (US East)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase pooler connection | ✅ |
| `DIRECT_URL` | Supabase direct connection | ✅ |
| `NEXTAUTH_SECRET` | JWT signing secret | ✅ |
| `NEXTAUTH_URL` | Production URL | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public app URL | ⚠️ |
| `QURAN_API_URL` | Quran API base URL | ❌ |

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify `package.json` scripts are correct

### Database Connection Issues

1. Verify `DATABASE_URL` and `DIRECT_URL` are correct
2. Check Supabase connection pooling settings
3. Ensure IP is whitelisted (if required)

### Authentication Issues

1. Verify `NEXTAUTH_URL` matches your Vercel domain
2. Check Google OAuth redirect URIs
3. Ensure `NEXTAUTH_SECRET` is set

## Continuous Deployment

Vercel automatically deploys on:
- Push to `main` branch
- Pull request merges
- Manual deployments from dashboard

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable
