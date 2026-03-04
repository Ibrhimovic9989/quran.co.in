// Audio Player Component
// Displays audio controls for Quran recitation

'use client';

import { useState, useRef, useEffect } from 'react';
import { Text } from '@/components/ui/typography';
import type { AudioReciters } from '@/types/quran-api';

interface AudioPlayerProps {
  audioData: AudioReciters;
  surahNo: number;
  ayahNo?: number;
  className?: string;
}

export function AudioPlayer({
  audioData,
  surahNo,
  ayahNo,
  className,
}: AudioPlayerProps) {
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reciters = Object.entries(audioData).map(([id, data]) => ({
    id,
    ...data,
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audioRef.current?.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const handlePlay = (reciterId: string) => {
    const reciter = audioData[reciterId];
    if (!reciter) return;

    if (selectedReciter === reciterId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(reciter.originalUrl || reciter.url);
      audioRef.current = audio;
      setSelectedReciter(reciterId);
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={className}>
      <Text className="text-sm text-gray-400 mb-2">Audio Recitation</Text>
      <div className="flex flex-wrap gap-2">
        {reciters.map((reciter) => (
          <button
            key={reciter.id}
            onClick={() => handlePlay(reciter.id)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${
              selectedReciter === reciter.id && isPlaying
                ? 'bg-white text-black border-white'
                : 'bg-gray-900 text-white border-gray-700 hover:border-gray-600'
            }`}
          >
            {selectedReciter === reciter.id && isPlaying ? '⏸️' : '▶️'} {reciter.reciter}
          </button>
        ))}
      </div>
    </div>
  );
}
