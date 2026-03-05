// Audio Player Component
// Displays audio controls for Quran recitation with ayah-only vs whole surah options

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

type PlayMode = 'ayah' | 'surah';

export function AudioPlayer({
  audioData,
  surahNo,
  ayahNo,
  className,
}: AudioPlayerProps) {
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>(ayahNo ? 'ayah' : 'surah');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ayahAudioData, setAyahAudioData] = useState<AudioReciters | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reciters = Object.entries(audioData).map(([id, data]) => ({
    id,
    ...data,
  }));

  // Fetch ayah-specific audio when mode changes to 'ayah'
  useEffect(() => {
    if (playMode === 'ayah' && ayahNo && !ayahAudioData) {
      setIsLoadingAudio(true);
      fetch(`/api/quran/audio/${surahNo}/${ayahNo}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.audio) {
            setAyahAudioData(data.audio);
          }
        })
        .catch((err) => {
          console.error('Error fetching ayah audio:', err);
        })
        .finally(() => {
          setIsLoadingAudio(false);
        });
    }
  }, [playMode, ayahNo, surahNo, ayahAudioData]);

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
    if (playMode === 'ayah' && ayahAudioData) {
      return ayahAudioData;
    }
    return audioData; // Surah audio
  };

  const handlePlay = () => {
    const currentAudio = getCurrentAudioData();
    
    if (!selectedReciter) {
      // Auto-select first reciter if none selected
      const firstReciterId = Object.keys(currentAudio)[0];
      if (firstReciterId) {
        setSelectedReciter(firstReciterId);
        playAudio(firstReciterId, currentAudio);
      }
      return;
    }

    const reciter = currentAudio[selectedReciter];
    if (!reciter) return;

    if (audioRef.current && isPlaying) {
      // Pause if playing
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Play audio
      playAudio(selectedReciter, currentAudio);
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

    const audioUrl = reciter.originalUrl || reciter.url;
    const audio = new Audio(audioUrl);
    
    // If playing ayah-only, calculate start/end times (if possible)
    // For now, we'll just play the full audio and let the user control
    // In future, we can add time-based seeking for ayah-only mode
    
    audioRef.current = audio;
    setSelectedReciter(reciterId);
    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    });
    setIsPlaying(true);
  };

  const handleReciterChange = (reciterId: string) => {
    setSelectedReciter(reciterId);
    if (isPlaying) {
      // If already playing, switch to new reciter
      const currentAudio = getCurrentAudioData();
      playAudio(reciterId, currentAudio);
    }
  };

  const handleModeChange = (mode: PlayMode) => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setPlayMode(mode);
    setSelectedReciter(null); // Reset reciter selection
  };

  const currentAudioData = getCurrentAudioData();
  const availableReciters = Object.entries(currentAudioData).map(([id, data]) => ({
    id,
    ...data,
  }));

  return (
    <div className={className}>
      <Text className="text-sm text-gray-400 mb-3">Audio Recitation</Text>
      
      {/* Play Mode Selector */}
      {ayahNo && (
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => handleModeChange('ayah')}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${
              playMode === 'ayah'
                ? 'bg-white text-black border-white'
                : 'bg-gray-900 text-white border-gray-700 hover:border-gray-600'
            }`}
          >
            Ayah Only
          </button>
          <button
            onClick={() => handleModeChange('surah')}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${
              playMode === 'surah'
                ? 'bg-white text-black border-white'
                : 'bg-gray-900 text-white border-gray-700 hover:border-gray-600'
            }`}
          >
            Whole Surah
          </button>
        </div>
      )}

      {/* Reciter Dropdown */}
      <div className="mb-3">
        <select
          value={selectedReciter || ''}
          onChange={(e) => handleReciterChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:border-white"
          disabled={isLoadingAudio}
        >
          <option value="">Select Reciter</option>
          {availableReciters.map((reciter) => (
            <option key={reciter.id} value={reciter.id}>
              {reciter.reciter}
            </option>
          ))}
        </select>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={handlePlay}
        disabled={!selectedReciter || isLoadingAudio}
        className={`w-full px-4 py-2 rounded text-sm border transition-colors ${
          isPlaying
            ? 'bg-white text-black border-white'
            : 'bg-gray-900 text-white border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isLoadingAudio ? (
          'Loading...'
        ) : isPlaying ? (
          '⏸️ Pause'
        ) : (
          '▶️ Play'
        )}
      </button>
    </div>
  );
}
