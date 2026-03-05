// Audio Player Component
// Displays audio controls for Quran recitation with ayah-only vs whole surah options

'use client';

import { useState, useRef, useEffect } from 'react';
import { Text } from '@/components/ui/typography';
import { Select } from '@/components/ui/atoms';
import { PlayButton } from '@/components/ui/molecules';
import type { AudioReciters } from '@/types/quran-api';

interface AudioPlayerProps {
  audioData: AudioReciters;
  surahNo: number;
  ayahNo?: number;
  className?: string;
  selectedReciter?: string | null; // Reciter selected at surah level
  onReciterChange?: (reciterId: string) => void; // Callback when reciter changes
}

type PlayMode = 'ayah' | 'surah';

export function AudioPlayer({
  audioData,
  surahNo,
  ayahNo,
  className,
  selectedReciter: propSelectedReciter,
  onReciterChange,
}: AudioPlayerProps) {
  // Use prop reciter if provided (surah level), otherwise manage locally
  const isSurahLevel = propSelectedReciter !== undefined;
  const [localReciter, setLocalReciter] = useState<string | null>(null);
  const selectedReciter = isSurahLevel ? propSelectedReciter : localReciter;
  
  // Default to 'ayah' mode if ayahNo is provided, otherwise 'surah' mode
  const [playMode, setPlayMode] = useState<PlayMode>(ayahNo ? 'ayah' : 'surah');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ayahAudioData, setAyahAudioData] = useState<AudioReciters | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reciters = Object.entries(audioData).map(([id, data]) => ({
    id,
    ...data,
  }));

  // Fetch ayah-specific audio when at ayah level (always fetch for ayah level)
  useEffect(() => {
    if (ayahNo && !ayahAudioData) {
      setIsLoadingAudio(true);
      fetch(`/api/quran/audio/${surahNo}/${ayahNo}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch audio: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.audio && Object.keys(data.audio).length > 0) {
            setAyahAudioData(data.audio);
          } else {
            // Audio not available for this ayah, will fallback to surah audio
            console.warn('Ayah audio not available, using surah audio');
          }
        })
        .catch((err) => {
          console.error('Error fetching ayah audio:', err);
          // Don't set ayahAudioData, will fallback to surah audio
        })
        .finally(() => {
          setIsLoadingAudio(false);
        });
    }
  }, [ayahNo, surahNo, ayahAudioData]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const getCurrentAudioData = (): AudioReciters => {
    // At ayah level, always use ayah audio if available
    if (ayahNo && ayahAudioData) {
      return ayahAudioData;
    }
    // At surah level or if ayah audio not available, use surah audio
    return audioData;
  };

  const handlePlay = () => {
    const currentAudio = getCurrentAudioData();
    
    // Determine which reciter to use
    let reciterToUse = selectedReciter;
    
    // If no reciter selected, try to use the first available one
    if (!reciterToUse) {
      const firstReciterId = Object.keys(currentAudio)[0];
      if (firstReciterId) {
        reciterToUse = firstReciterId;
        // If surah level, notify parent to set the reciter
        if (isSurahLevel && onReciterChange) {
          onReciterChange(firstReciterId);
        } else if (!isSurahLevel) {
          // Only set local reciter if not surah level
          setLocalReciter(firstReciterId);
        }
      } else {
        // No reciters available
        return;
      }
    }

    const reciter = currentAudio[reciterToUse];
    if (!reciter) return;

    // Check if we're already playing the same reciter
    if (audioRef.current && isPlaying && selectedReciter === reciterToUse) {
      // Pause if playing the same reciter
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play audio with selected reciter
      playAudio(reciterToUse, currentAudio);
    }
  };

  const playAudio = (reciterId: string, audioDataToUse: AudioReciters) => {
    const reciter = audioDataToUse[reciterId];
    if (!reciter) return;

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Determine which audio URL to use based on play mode
    let audioUrl: string;
    
    if (playMode === 'ayah' && ayahNo && ayahAudioData) {
      // Use ayah-specific audio if available and mode is 'ayah'
      const ayahReciter = ayahAudioData[reciterId];
      if (ayahReciter) {
        audioUrl = ayahReciter.originalUrl || ayahReciter.url;
      } else {
        // Fallback to surah audio if ayah audio not available
        audioUrl = reciter.originalUrl || reciter.url;
      }
    } else {
      // Use surah audio (whole surah) - either surah level or ayah level with 'surah' mode
      audioUrl = reciter.originalUrl || reciter.url;
    }
    
    const audio = new Audio(audioUrl);
    
    audioRef.current = audio;
    if (!isSurahLevel) {
      setLocalReciter(reciterId);
    }
    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    });
    setIsPlaying(true);
  };

  const handleReciterChange = (reciterId: string) => {
    if (isSurahLevel && onReciterChange) {
      // Surah level - notify parent
      onReciterChange(reciterId);
    } else {
      // Local level (shouldn't happen for ayahs, but keep for backward compat)
      setLocalReciter(reciterId);
    }
    if (isPlaying) {
      // If already playing, switch to new reciter
      const currentAudio = getCurrentAudioData();
      playAudio(reciterId, currentAudio);
    }
  };

  // At ayah level, always use 'ayah' mode - no need for mode change handler
  // This function is kept for potential future use but not called for ayah level
  const handleModeChange = (mode: PlayMode) => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setPlayMode(mode);
    // Reset reciter selection (only if not surah level)
    if (!isSurahLevel) {
      setLocalReciter(null);
    } else if (onReciterChange) {
      onReciterChange('');
    }
  };

  const currentAudioData = getCurrentAudioData();
  const availableReciters = Object.entries(currentAudioData).map(([id, data]) => ({
    id,
    ...data,
  }));

  return (
    <div className={className}>
      <Text className="text-sm text-gray-400 mb-3">Audio Recitation</Text>
      
      {/* At ayah level, always play ayah only - no mode selector needed */}
      {ayahNo && (
        <div className="mb-3">
          <Text className="text-xs text-gray-500">Plays this ayah only</Text>
        </div>
      )}
      
      {/* At surah level (no ayahNo), show info that it plays whole surah */}
      {!ayahNo && (
        <div className="mb-3">
          <Text className="text-xs text-gray-500">Plays entire surah</Text>
        </div>
      )}

      {/* Reciter Dropdown - Only show if not surah level (surah level handles it) */}
      {!isSurahLevel && (
        <div className="mb-3">
          <Select
            value={selectedReciter || ''}
            onChange={(e) => handleReciterChange(e.target.value)}
            options={availableReciters.map((reciter) => ({
              value: reciter.id,
              label: reciter.reciter,
            }))}
            placeholder="Select Reciter"
            disabled={isLoadingAudio}
          />
        </div>
      )}

      {/* Play/Pause Button - Using PlayButton molecule */}
      <div className="w-full">
        <PlayButton
          isPlaying={isPlaying}
          isLoading={isLoadingAudio}
          onClick={handlePlay}
        />
      </div>
    </div>
  );
}
