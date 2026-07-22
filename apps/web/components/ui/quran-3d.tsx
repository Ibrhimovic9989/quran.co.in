// 3D Quran Component
// CSS-based 3D representation of the Holy Quran
// Follows Atomic Design - Atom component

'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface Quran3DProps {
  className?: string;
  autoRotate?: boolean;
}

export function Quran3D({ className, autoRotate = true }: Quran3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!autoRotate || isHovered) return;

    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.5;
      setRotation({ x: 0, y: angle });
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate, isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / 10;
    const deltaY = (e.clientY - centerY) / 10;
    
    setRotation({ x: -deltaY, y: deltaX });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (autoRotate) {
      setRotation({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full flex items-center justify-center perspective-1000', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative w-32 h-40 md:w-64 md:h-80 preserve-3d transition-transform duration-300"
        style={{
          transform: `rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`,
        }}
      >
        {/* Front Cover */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-lg shadow-2xl border-2 md:border-4 border-emerald-700"
          style={{
            transform: 'translateZ(10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 25px rgba(16, 185, 129, 0.1)',
          }}
        >
          {/* Decorative Pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {/* Arabic Calligraphy Style Text - Smaller on mobile */}
              <div className="text-white font-arabic text-xl md:text-4xl mb-1 md:mb-2" style={{ direction: 'rtl' }}>
                القرآن الكريم
              </div>
              <div className="text-emerald-200 text-[8px] md:text-sm font-semibold tracking-wider">
                THE HOLY QURAN
              </div>
            </div>
          </div>
          
          {/* Corner Decorations - Smaller on mobile */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4 w-6 h-6 md:w-12 md:h-12 border border-emerald-400 md:border-2 border-emerald-400 rounded-lg opacity-50"></div>
          <div className="absolute top-2 right-2 md:top-4 md:right-4 w-6 h-6 md:w-12 md:h-12 border border-emerald-400 md:border-2 border-emerald-400 rounded-lg opacity-50"></div>
          <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 w-6 h-6 md:w-12 md:h-12 border border-emerald-400 md:border-2 border-emerald-400 rounded-lg opacity-50"></div>
          <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-6 h-6 md:w-12 md:h-12 border border-emerald-400 md:border-2 border-emerald-400 rounded-lg opacity-50"></div>
        </div>

        {/* Spine - Smaller on mobile */}
        <div
          className="absolute w-4 md:w-8 h-full bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-l-lg border-l-2 md:border-l-4 border-emerald-600"
          style={{
            transform: 'rotateY(-90deg) translateZ(10px)',
            left: '-20px',
            boxShadow: 'inset -5px 0 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-emerald-200 text-[6px] md:text-xs font-bold writing-vertical" style={{ transform: 'rotate(180deg)' }}>
              QURAN
            </div>
          </div>
        </div>

        {/* Back Cover - Smaller on mobile */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 rounded-lg border-2 md:border-4 border-emerald-800"
          style={{
            transform: 'translateZ(-10px)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Decorative Pattern on Back */}
          <div className="absolute inset-2 md:inset-4 border border-emerald-700 md:border-2 border-emerald-700 rounded-lg opacity-30"></div>
        </div>

        {/* Pages Edge - Smaller on mobile */}
        <div
          className="absolute w-4 md:w-8 h-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-l-lg"
          style={{
            transform: 'rotateY(-90deg) translateZ(0px)',
            left: '-20px',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Page lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-gray-300 opacity-20"
              style={{ top: `${(i + 1) * 5}%` }}
            />
          ))}
        </div>

        {/* Glow Effect - Smaller on mobile */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            transform: 'translateZ(12px)',
            filter: 'blur(10px)',
          }}
        />
      </div>
    </div>
  );
}
