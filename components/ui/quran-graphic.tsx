// Quran Graphic Component
// Beautiful, thoughtful 2D graphic representation of the Quran
// Follows Atomic Design - Atom component

'use client';

import { cn } from '@/lib/utils/cn';

interface QuranGraphicProps {
  className?: string;
}

export function QuranGraphic({ className }: QuranGraphicProps) {
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Geometric Islamic Pattern */}
            <path
              d="M200 50 L250 100 L200 150 L150 100 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-gray-800"
            />
            <path
              d="M200 150 L250 200 L200 250 L150 200 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-gray-800"
            />
            <path
              d="M200 250 L250 300 L200 350 L150 300 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-gray-800"
            />
            <path
              d="M200 350 L250 400 L200 450 L150 400 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-gray-800"
            />
          </svg>
        </div>

        {/* Central Quran Representation */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Book Cover - Stylized */}
          <div className="relative">
            {/* Main Book Shape */}
            <div className="w-64 h-80 md:w-80 md:h-96 bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 rounded-lg shadow-2xl transform perspective-1000 preserve-3d">
              {/* Book Cover Design */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                {/* Arabic Calligraphy Style Text */}
                <div className="text-white text-5xl md:text-6xl font-arabic mb-4 text-center leading-tight">
                  القرآن
                </div>
                <div className="text-emerald-200 text-sm md:text-base tracking-widest text-center font-medium">
                  THE HOLY QURAN
                </div>
                
                {/* Decorative Border */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-emerald-300 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-emerald-300 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-emerald-300 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-emerald-300 rounded-br-lg"></div>
              </div>

              {/* Pages Edge Effect */}
              <div className="absolute -right-2 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-r-lg shadow-lg"></div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-lg pointer-events-none opacity-30"
              style={{
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.4), 0 0 80px rgba(6, 182, 212, 0.2)',
              }}
            ></div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-emerald-100 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-100 rounded-full opacity-20 blur-xl"></div>
        </div>

        {/* Inspirational Text */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-gray-700 text-lg font-medium italic">
            "And We have certainly made the Quran easy for remembrance"
          </p>
          <p className="text-gray-500 text-sm">
            — Al-Qamar 54:17
          </p>
        </div>
      </div>
    </div>
  );
}
