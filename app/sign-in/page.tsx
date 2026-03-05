// Sign In Page
// Modern split-screen design with Quran graphic and sign-in form
// Follows Atomic Design principles

'use client';

import { QuranGraphic } from '@/components/ui/quran-graphic';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { ShimmerButton } from '@/components/ui/atoms';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/quran');
    }
  }, [session, status, router]);

  const handleSignIn = () => {
    setIsLoading(true);
    signIn('google', {
      callbackUrl: '/quran',
    });
  };

  // Show loading state while checking session - Mobile optimized
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="w-6 h-6 md:w-8 md:h-8 border-3 md:border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Quran Graphic - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-blue-50 items-center justify-center p-8 lg:p-12">
        <QuranGraphic />
      </div>

      {/* Right Side - Sign In Form - Mobile First */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          <Card className="border border-gray-200 shadow-lg">
            <div className="p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6">
              {/* Header - Mobile optimized */}
              <div className="text-center space-y-1.5 md:space-y-2">
                <Heading level={1} className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Welcome Back
                </Heading>
                <Text className="text-xs sm:text-sm md:text-base text-gray-600">
                  Sign in to continue your Quranic journey
                </Text>
              </div>

              {/* Sign In Button - Mobile optimized */}
              <div className="pt-2 md:pt-4">
                <ShimmerButton
                  background="rgba(0, 0, 0, 1)"
                  shimmerColor="#ffffff"
                  borderRadius="8px"
                  className="w-full text-white font-semibold px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base disabled:opacity-50"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center gap-2 md:gap-3 relative z-10">
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
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
              <div className="pt-2 md:pt-4 border-t border-gray-200">
                <Text className="text-center text-[10px] sm:text-xs md:text-sm text-gray-500 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-gray-900 hover:underline font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-gray-900 hover:underline font-medium">
                    Privacy Policy
                  </a>
                </Text>
              </div>

              {/* Trust Indicators - Mobile optimized */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 pt-2 md:pt-4 text-[10px] sm:text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
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
