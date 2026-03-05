// Page Loader Component
// Elegant initial loading experience with Arabic calligraphy
// Follows Atomic Design - Organism component

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';

interface PageLoaderProps {
  className?: string;
}

const SPLASH_STORAGE_KEY = 'quran-app-splash-shown';

export function PageLoader({ className }: PageLoaderProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show on homepage
    const isHomepage = pathname === '/';
    
    // Check if user has seen splash before
    const hasSeenSplash = typeof window !== 'undefined' 
      ? localStorage.getItem(SPLASH_STORAGE_KEY) === 'true'
      : false;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page-loader.tsx:23',message:'Page loader check',data:{isHomepage,hasSeenSplash,pathname,authStatus:status},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Don't show if not homepage or already seen (works for both authenticated and unauthenticated)
    if (!isHomepage || hasSeenSplash) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page-loader.tsx:33',message:'Hiding splash screen',data:{reason:!isHomepage?'not-homepage':'already-seen'},timestamp:Date.now(),runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setIsVisible(false);
      setIsLoading(false);
      return;
    }

    // Track when component mounted to ensure minimum display time
    const mountTime = Date.now();
    const DISPLAY_TIME = 3000; // 3 seconds display before fade starts
    const FADE_OUT_TIME = 1500; // 1.5 seconds fade = 4.5 seconds total

    // Function to start fade-out after display time
    const startFadeOut = () => {
      const elapsed = Date.now() - mountTime;
      const remainingTime = Math.max(0, DISPLAY_TIME - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
        // Mark as shown in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(SPLASH_STORAGE_KEY, 'true');
        }
        // Smooth fade out animation
        setTimeout(() => {
          setIsVisible(false);
        }, FADE_OUT_TIME);
      }, remainingTime);
    };

    // Wait for page to be interactive, then ensure minimum display time
    if (document.readyState === 'complete') {
      // Page already loaded, but still ensure minimum time
      startFadeOut();
    } else {
      // Wait for page load, then ensure minimum time
      const handleLoad = () => {
        startFadeOut();
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pathname, status]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-white',
        'transition-opacity duration-[1500ms] ease-in-out',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
    >
      {/* Subtle Ornamental Pattern Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="ornamental-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* Islamic geometric pattern */}
              <circle cx="20" cy="20" r="1.5" fill="currentColor" />
              <path
                d="M 20 0 L 20 40 M 0 20 L 40 20"
                stroke="currentColor"
                strokeWidth="0.3"
                opacity="0.5"
              />
              <circle cx="10" cy="10" r="0.8" fill="currentColor" opacity="0.6" />
              <circle cx="30" cy="30" r="0.8" fill="currentColor" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#ornamental-pattern)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Arabic Calligraphy - Bismillah with elegant styling */}
        <div className="mb-4 md:mb-6">
          <div
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-arabic',
              'text-gray-900 font-semibold',
              'text-center leading-relaxed',
              'animate-fade-in',
              'drop-shadow-sm'
            )}
            dir="rtl"
            style={{
              fontFamily: '"Amiri", "Noto Sans Arabic", "Arial", serif',
              letterSpacing: '0.05em',
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="mb-4 md:mb-6 flex items-center gap-3 animate-fade-in-delay">
          <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full" />
          <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent" />
        </div>

        {/* English Translation */}
        <div className="mb-6 md:mb-8">
          <p
            className={cn(
              'text-xs sm:text-sm md:text-base text-gray-600',
              'text-center max-w-sm md:max-w-md px-4',
              'font-light italic leading-relaxed',
              'animate-fade-in-delay'
            )}
          >
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </div>

        {/* Elegant Loading Indicator */}
        <div className="flex items-center gap-2 md:gap-2.5 animate-fade-in-delay-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-pulse" />
          <div
            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>

      {/* Subtle gradient overlay for depth - very minimal */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/20 pointer-events-none" />
    </div>
  );
}
