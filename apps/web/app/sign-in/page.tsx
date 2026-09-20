// Sign In Page
// Modern split-screen design with Quran graphic and sign-in form
// Follows Atomic Design principles

'use client';

import { Suspense } from 'react';
import { QuranGraphic } from '@/components/ui/quran-graphic';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { ShimmerButton } from '@/components/ui/atoms';
import { signIn, useSession } from '@/components/auth/auth-client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function normalizeCallbackUrl(rawCallbackUrl: string | null) {
  if (!rawCallbackUrl) return '/quran';

  if (typeof window === 'undefined') {
    return rawCallbackUrl.startsWith('/') ? rawCallbackUrl : '/quran';
  }

  try {
    const resolvedUrl = new URL(rawCallbackUrl, window.location.origin);
    if (resolvedUrl.origin !== window.location.origin) {
      return '/quran';
    }

    return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}` || '/quran';
  } catch {
    return rawCallbackUrl.startsWith('/') ? rawCallbackUrl : '/quran';
  }
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get callbackUrl from URL or default to /quran
  const callbackUrl = useMemo(
    () => normalizeCallbackUrl(searchParams.get('callbackUrl')),
    [searchParams]
  );


  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const handleSignIn = () => {
    setIsLoading(true);
    signIn('google', {
      callbackUrl: callbackUrl,
    });
  };

  // Show loading state while checking session - Mobile optimized
  if (status === 'loading') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent md:mb-4"></div>
          <p className="text-[13px] text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-54px)] flex-col bg-paper lg:flex-row">
      {/* Left Side - Quran Graphic - Desktop only */}
      <div className="hidden items-center justify-center bg-[linear-gradient(115deg,var(--tint-sage),var(--tint-sky))] p-8 lg:flex lg:w-1/2 lg:p-12">
        <QuranGraphic />
      </div>

      {/* Right Side - Sign In Form - Mobile First */}
      <div className="flex flex-1 items-center justify-center bg-paper p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="rounded-[22px] border border-line bg-surface p-0 shadow-none">
            <div className="space-y-5 p-6 md:p-8">
              {/* Header - Mobile optimized */}
              <div className="space-y-2">
                <Heading level={1} className="font-heading text-[clamp(24px,3vw,32px)] font-bold leading-[1.2] tracking-[-0.035em] text-ink">
                  Welcome Back
                </Heading>
                <Text className="text-[13px] leading-[1.7] text-muted">
                  Sign in to continue your Quranic journey
                </Text>
              </div>

              {/* Sign In Button - Mobile optimized */}
              <div className="pt-1">
                <ShimmerButton
                  background="var(--accent)"
                  shimmerColor="#ffffff"
                  borderRadius="10px"
                  className="w-full px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </span>
                </ShimmerButton>
              </div>

              {/* Additional Info - Mobile optimized */}
              <div className="border-t border-line pt-4">
                <Text className="text-center text-[11px] leading-[1.8] text-muted">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="font-medium text-accent-strong hover:underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="font-medium text-accent-strong hover:underline">
                    Privacy Policy
                  </a>
                </Text>
              </div>

              {/* Trust Indicators - Mobile optimized */}
              <div className="flex items-center justify-center gap-5 pt-1 text-[11px] text-muted">
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No Ads</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center bg-paper px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent md:mb-4"></div>
          <p className="text-[13px] text-muted">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
