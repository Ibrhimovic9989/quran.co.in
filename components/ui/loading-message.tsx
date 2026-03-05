// Loading Message Component
// Displays meaningful Islamic content during loading states
// Follows Atomic Design - Molecule component

'use client';

import { useEffect, useState } from 'react';
import { Text, Heading } from './typography';
import { getRandomLoadingMessage, type LoadingMessage } from '@/lib/data/loading-messages';
import { BookOpen, Heart, Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingMessageProps {
  className?: string;
  showIcon?: boolean;
}

const typeIcons = {
  quran: BookOpen,
  istighfar: Heart,
  dua: Sparkles,
  reminder: Lightbulb,
};

const typeColors = {
  quran: 'text-blue-600',
  istighfar: 'text-emerald-600',
  dua: 'text-purple-600',
  reminder: 'text-amber-600',
};

export function LoadingMessage({ className, showIcon = true }: LoadingMessageProps) {
  const [message, setMessage] = useState<LoadingMessage | null>(null);

  useEffect(() => {
    // Get a random message on mount
    setMessage(getRandomLoadingMessage());
  }, []);

  if (!message) {
    return null;
  }

  const Icon = typeIcons[message.type];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center max-w-2xl mx-auto px-4", className)}>
      {showIcon && Icon && (
        <div className={cn("flex items-center justify-center w-12 h-12 rounded-full bg-gray-100", typeColors[message.type])}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="space-y-2">
        <Text className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
          "{message.text}"
        </Text>
        <Text className="text-sm text-gray-600 font-medium">
          — {message.source}
        </Text>
      </div>
    </div>
  );
}
