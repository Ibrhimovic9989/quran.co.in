# Troubleshooting Guide

## Common Issues and Solutions

### 1. Redirect to localhost in Production

**Problem:** After clicking "Sign in with Google", you're redirected to `http://localhost:3000` instead of your Vercel domain.

**Cause:** The `NEXTAUTH_URL` environment variable is set to `http://localhost:3000` or is missing.

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. **Update it to your actual Vercel domain:**
   - Format: `https://your-project-name.vercel.app`
   - Example: `https://quran-co-in.vercel.app`
4. **Remove any `http://localhost:3000` value**
5. Save and redeploy

**Important:** 
- `NEXTAUTH_URL` must match your actual deployment URL
- Check your Vercel deployment URL in the Vercel dashboard
- If you have a custom domain, use that instead

### 2. Google OAuth Redirect URI Mismatch

**Problem:** Error: "redirect_uri_mismatch" when signing in.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-name.vercel.app/api/auth/callback/google
   ```
5. Make sure it matches your `NEXTAUTH_URL` + `/api/auth/callback/google`
6. Save changes

### 3. Build Timeout on Vercel

**Problem:** Build fails with "took more than 60 seconds" error.

**Solution:**
- Already fixed! Pages are now set to `dynamic = 'force-dynamic'`
- If you still see this, make sure the latest code is deployed

### 4. Database Connection Errors

**Problem:** "Authentication failed" or "Connection refused" errors.

**Solution:**
1. Verify `DATABASE_URL` and `DIRECT_URL` are set correctly
2. Check Supabase connection pooling settings
3. Ensure IP is whitelisted (if required)
4. Verify password is URL-encoded (use `%24` for `$`)

### 5. Environment Variables Not Working

**Problem:** Environment variables seem to be ignored.

**Solution:**
1. Make sure variables are set for the correct environment (Production/Preview/Development)
2. Redeploy after adding/changing environment variables
3. Check variable names match exactly (case-sensitive)
4. Remove any `@secret_name` references - use actual values

### 6. NextAuth Session Errors

**Problem:** "Failed to fetch session" or authentication not working.

**Solution:**
1. Verify `NEXTAUTH_SECRET` is set (required!)
2. Verify `NEXTAUTH_URL` matches your domain
3. Check Google OAuth credentials are correct
4. Ensure redirect URI is added in Google Console

## Quick Checklist

Before deploying to Vercel, ensure:

- [ ] `DATABASE_URL` is set (Supabase pooler URL)
- [ ] `DIRECT_URL` is set (Supabase direct URL)
- [ ] `NEXTAUTH_SECRET` is set (generate new one for production)
- [ ] `NEXTAUTH_URL` is set to your Vercel domain (NOT localhost!)
- [ ] `GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] Google OAuth redirect URI includes your Vercel domain
- [ ] All environment variables are set for Production environment

## Getting Your Vercel Domain

1. Go to Vercel Dashboard
2. Click on your project
3. Look at the deployment URL (e.g., `https://quran-co-in.vercel.app`)
4. Use this exact URL for `NEXTAUTH_URL`
