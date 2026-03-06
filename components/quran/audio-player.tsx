// Audio Player Component
// Displays audio controls for Quran recitation with ayah-only vs whole surah options

'use client';

import { useState, useRef, useEffect } from 'react';
import { Text } from '@/components/ui/typography';
import { Select } from '@/components/ui/atoms';
import { PlayButton } from '@/components/ui/molecules';
import { cn } from '@/lib/utils/cn';
import type { AudioReciters } from '@/types/quran-api';
import { useOptionalSurahPlayback } from './surah-playback-provider';

function isPlaybackAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

interface AudioPlayerProps {
  audioData: AudioReciters;
  surahNo: number;
  ayahNo?: number;
  className?: string;
  selectedReciter?: string | null; // Reciter selected at surah level
  onReciterChange?: (reciterId: string) => void; // Callback when reciter changes
  enableSharedPlayback?: boolean;
  minimal?: boolean;
}

type PlayMode = 'ayah' | 'surah';

export function AudioPlayer({
  audioData,
  surahNo,
  ayahNo,
  className,
  selectedReciter: propSelectedReciter,
  onReciterChange,
  enableSharedPlayback = false,
  minimal = false,
}: AudioPlayerProps) {
  const sharedPlayback = useOptionalSurahPlayback();
  const useSharedPlayback = Boolean(enableSharedPlayback && sharedPlayback);

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
  
  // Storage key for saving playback position (only for surah-level playback)
  const getStorageKey = (reciterId: string) => {
    if (ayahNo) return null; // Don't save position for ayah-level playback
    return `audio-position-${surahNo}-${reciterId}`;
  };

  const reciters = Object.entries(audioData).map(([id, data]) => ({
    id,
    ...data,
  }));

  // Fetch ayah-specific audio when at ayah level (always fetch for ayah level)
  useEffect(() => {
    if (useSharedPlayback) return;
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
  }, [ayahNo, surahNo, ayahAudioData, useSharedPlayback]);

  useEffect(() => {
    if (useSharedPlayback) return;
    const audio = audioRef.current;
    if (audio) {
      // Save position periodically while playing (only for surah-level)
      const savePosition = () => {
        if (!ayahNo && selectedReciter) {
          const storageKey = getStorageKey(selectedReciter);
          if (storageKey && audio.currentTime > 0) {
            localStorage.setItem(storageKey, audio.currentTime.toString());
          }
        }
      };
      
      // Save position every 2 seconds while playing
      const interval = setInterval(() => {
        if (isPlaying && audio) {
          savePosition();
        }
      }, 2000);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        // Clear saved position when audio ends
        if (!ayahNo && selectedReciter) {
          const storageKey = getStorageKey(selectedReciter);
          if (storageKey) {
            localStorage.removeItem(storageKey);
          }
        }
      });
      
      // Save position on pause
      audio.addEventListener('pause', savePosition);
      
      return () => {
        clearInterval(interval);
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.removeEventListener('pause', savePosition);
      };
    }
  }, [isPlaying, selectedReciter, ayahNo, surahNo, useSharedPlayback]);

  const getCurrentAudioData = (): AudioReciters => {
    // At ayah level, always use ayah audio if available
    if (ayahNo && ayahAudioData) {
      return ayahAudioData;
    }
    // At surah level or if ayah audio not available, use surah audio
    return audioData;
  };

  const handlePlay = () => {
    if (useSharedPlayback && sharedPlayback) {
      handleSharedPlay();
      return;
    }

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
      // Pause if playing the same reciter (position is saved automatically via event listener)
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play audio with selected reciter
      playAudio(reciterToUse, currentAudio);
    }
  };

  const handleSharedPlay = () => {
    if (!sharedPlayback) return;

    let reciterToUse = selectedReciter;
    if (!reciterToUse) {
      const firstReciterId = Object.keys(audioData)[0];
      if (!firstReciterId) return;
      reciterToUse = firstReciterId;
      if (isSurahLevel && onReciterChange) {
        onReciterChange(firstReciterId);
      } else if (!isSurahLevel) {
        setLocalReciter(firstReciterId);
      }
    }

    if (!reciterToUse) return;

    if (ayahNo) {
      sharedPlayback.toggleAyahPlayback(ayahNo, reciterToUse).catch((error) => {
        console.error('Error toggling shared ayah playback:', error);
      });
      return;
    }

    sharedPlayback.toggleSurahPlayback(reciterToUse, sharedPlayback.activeAyahNumber ?? 1).catch((error) => {
      console.error('Error toggling shared surah playback:', error);
    });
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
    
    // Restore saved position if available (only for surah-level playback)
    if (!ayahNo) {
      const storageKey = getStorageKey(reciterId);
      if (storageKey) {
        const savedPosition = localStorage.getItem(storageKey);
        if (savedPosition) {
          const position = parseFloat(savedPosition);
          audio.currentTime = position;
        }
      }
    }
    
    audioRef.current = audio;
    if (!isSurahLevel) {
      setLocalReciter(reciterId);
    }
    
    // Wait for audio to be ready before playing
    audio.addEventListener('loadedmetadata', () => {
      // Restore position after metadata is loaded
      if (!ayahNo) {
        const storageKey = getStorageKey(reciterId);
        if (storageKey) {
          const savedPosition = localStorage.getItem(storageKey);
          if (savedPosition) {
            const position = parseFloat(savedPosition);
            if (position < audio.duration) {
              audio.currentTime = position;
            }
          }
        }
      }
    });
    
    audio.play().catch((err) => {
      if (isPlaybackAbortError(err)) return;
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
  const sharedIsPlaying = useSharedPlayback && sharedPlayback
    ? ayahNo
      ? sharedPlayback.playbackScope === 'ayah' &&
        sharedPlayback.activeAyahNumber === ayahNo &&
        sharedPlayback.isPlaying
      : sharedPlayback.playbackScope === 'surah' && sharedPlayback.isPlaying
    : false;

  return (
    <div className={cn(minimal ? 'space-y-0' : 'space-y-3', className)}>
      {!minimal && (
        <>
          <Text className="mb-3 text-sm text-gray-400">Audio Recitation</Text>

          {ayahNo ? (
            <div className="mb-3">
              <Text className="text-xs text-gray-500">Plays this ayah only</Text>
            </div>
          ) : (
            <div className="mb-3">
              <Text className="text-xs text-gray-500">Plays entire surah</Text>
            </div>
          )}
        </>
      )}

      <div className={cn('flex flex-wrap items-center gap-2', minimal ? 'pt-1' : 'w-full')}>
        {!isSurahLevel && (
          <div className={cn(minimal ? 'min-w-[10rem] flex-1 sm:flex-none' : 'mb-3 w-full')}>
            <Select
              value={selectedReciter || ''}
              onChange={(e) => handleReciterChange(e.target.value)}
              options={availableReciters.map((reciter) => ({
                value: reciter.id,
                label: reciter.reciter,
              }))}
              placeholder="Select Reciter"
              disabled={isLoadingAudio}
              className={cn(
                minimal &&
                  'h-9 rounded-full border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700 focus:border-stone-400'
              )}
            />
          </div>
        )}

        <PlayButton
          isPlaying={useSharedPlayback ? sharedIsPlaying : isPlaying}
          isLoading={isLoadingAudio}
          onClick={handlePlay}
          className={cn(
            minimal &&
              'rounded-full border-stone-200 bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-800'
          )}
        />
      </div>
    </div>
  );
}
