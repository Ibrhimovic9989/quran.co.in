// Splash Screen Component
// Shows shader animation on first visit only (not for authenticated users)
// Follows Atomic Design - Organism component

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShaderAnimation } from './shader-animation';
import { Heading, Text } from './typography';

const SPLASH_STORAGE_KEY = 'quran-app-splash-shown';

export function SplashScreen() {
  const { data: session, status } = useSession();
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen splash before
    const hasSeenSplash = localStorage.getItem(SPLASH_STORAGE_KEY) === 'true';
    
    // Wait for session to load
    if (status === 'loading') {
      return;
    }

    // Show splash only if:
    // 1. User hasn't seen it before
    // 2. User is not authenticated
    if (!hasSeenSplash && status === 'unauthenticated') {
      setShowSplash(true);
      setIsLoading(false);
      
      // Mark splash as shown after 3 seconds
      const timer = setTimeout(() => {
        localStorage.setItem(SPLASH_STORAGE_KEY, 'true');
        setShowSplash(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [status, session]);

  // Don't render anything if loading or shouldn't show
  if (isLoading || !showSplash) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ShaderAnimation />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <Heading level={1} className="text-6xl md:text-7xl font-semibold tracking-tighter text-white mb-4 text-center">
          Quran.co.in
        </Heading>
        <Text className="text-lg md:text-xl text-gray-300 text-center">
          Your Gateway to the Holy Quran
        </Text>
      </div>
    </div>
  );
}
