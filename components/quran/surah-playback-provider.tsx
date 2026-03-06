'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AudioReciters } from '@/types/quran-api';

type PlaybackScope = 'ayah' | 'surah' | null;

interface SurahPlaybackContextValue {
  activeAyahNumber: number | null;
  activeReciterId: string | null;
  isPlaying: boolean;
  playbackScope: PlaybackScope;
  toggleAyahPlayback: (ayahNumber: number, reciterId: string) => Promise<void>;
  toggleSurahPlayback: (reciterId: string, startAyah?: number) => Promise<void>;
}

interface SurahPlaybackProviderProps {
  surahNo: number;
  totalAyahs: number;
  children: ReactNode;
}

const SurahPlaybackContext = createContext<SurahPlaybackContextValue | null>(null);

function isPlaybackAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function SurahPlaybackProvider({
  surahNo,
  totalAyahs,
  children,
}: SurahPlaybackProviderProps) {
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [activeReciterId, setActiveReciterId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackScope, setPlaybackScope] = useState<PlaybackScope>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackScopeRef = useRef<PlaybackScope>(null);
  const activeAyahRef = useRef<number | null>(null);
  const activeReciterRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const ayahAudioCacheRef = useRef<Map<number, AudioReciters | null>>(new Map());

  const getSharedAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  const finishPlayback = useCallback(() => {
    requestIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.onplay = null;
      audioRef.current.onpause = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }

    setIsPlaying(false);
    setPlaybackScope(null);
    setActiveAyahNumber(null);
    setActiveReciterId(null);

    playbackScopeRef.current = null;
    activeAyahRef.current = null;
    activeReciterRef.current = null;
  }, []);

  const pausePlayback = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const resumePlayback = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      if (isPlaybackAbortError(error)) return;
      console.error('Error resuming surah playback:', error);
    }
  }, []);

  const fetchAyahAudio = useCallback(
    async (ayahNumber: number) => {
      if (ayahAudioCacheRef.current.has(ayahNumber)) {
        return ayahAudioCacheRef.current.get(ayahNumber) ?? null;
      }

      try {
        const response = await fetch(`/api/quran/audio/${surahNo}/${ayahNumber}`);
        if (!response.ok) {
          ayahAudioCacheRef.current.set(ayahNumber, null);
          return null;
        }

        const data = (await response.json()) as { audio?: AudioReciters | null };
        const audio = data.audio && Object.keys(data.audio).length > 0 ? data.audio : null;
        ayahAudioCacheRef.current.set(ayahNumber, audio);
        return audio;
      } catch (error) {
        console.error('Error fetching ayah audio for shared playback:', error);
        ayahAudioCacheRef.current.set(ayahNumber, null);
        return null;
      }
    },
    [surahNo]
  );

  const startAyahPlayback = useCallback(
    async (ayahNumber: number, reciterId: string, scope: Exclude<PlaybackScope, null>) => {
      const requestId = ++requestIdRef.current;
      const ayahAudio = await fetchAyahAudio(ayahNumber);

      if (requestId !== requestIdRef.current) return;
      if (!ayahAudio || !ayahAudio[reciterId]) {
        finishPlayback();
        return;
      }

      const reciter = ayahAudio[reciterId];
      const nextAudio = getSharedAudio();

      nextAudio.pause();
      nextAudio.src = reciter.originalUrl || reciter.url;
      nextAudio.currentTime = 0;

      nextAudio.onplay = () => setIsPlaying(true);
      nextAudio.onpause = () => setIsPlaying(false);
      nextAudio.onerror = () => finishPlayback();
      nextAudio.onended = async () => {
        if (playbackScopeRef.current !== 'surah') {
          finishPlayback();
          return;
        }

        const currentAyah = activeAyahRef.current;
        const currentReciter = activeReciterRef.current;
        if (!currentAyah || !currentReciter || currentAyah >= totalAyahs) {
          finishPlayback();
          return;
        }

        await startAyahPlayback(currentAyah + 1, currentReciter, 'surah');
      };

      playbackScopeRef.current = scope;
      activeAyahRef.current = ayahNumber;
      activeReciterRef.current = reciterId;

      setPlaybackScope(scope);
      setActiveAyahNumber(ayahNumber);
      setActiveReciterId(reciterId);

      try {
        await nextAudio.play();
        setIsPlaying(true);
      } catch (error) {
        if (requestId !== requestIdRef.current || isPlaybackAbortError(error)) {
          return;
        }
        console.error('Error starting shared ayah playback:', error);
        finishPlayback();
      }
    },
    [fetchAyahAudio, finishPlayback, getSharedAudio, totalAyahs]
  );

  const toggleAyahPlayback = useCallback(
    async (ayahNumber: number, reciterId: string) => {
      const isSameAyah = activeAyahRef.current === ayahNumber;
      const isSameReciter = activeReciterRef.current === reciterId;
      const isSameScope = playbackScopeRef.current === 'ayah';

      if (isSameAyah && isSameReciter && isSameScope && audioRef.current) {
        if (isPlaying) {
          pausePlayback();
        } else {
          await resumePlayback();
        }
        return;
      }

      await startAyahPlayback(ayahNumber, reciterId, 'ayah');
    },
    [isPlaying, pausePlayback, resumePlayback, startAyahPlayback]
  );

  const toggleSurahPlayback = useCallback(
    async (reciterId: string, startAyah = 1) => {
      const isSameReciter = activeReciterRef.current === reciterId;
      const isSameScope = playbackScopeRef.current === 'surah';

      if (isSameReciter && isSameScope && audioRef.current) {
        if (isPlaying) {
          pausePlayback();
        } else {
          await resumePlayback();
        }
        return;
      }

      const initialAyah =
        isSameScope && activeAyahRef.current && isSameReciter
          ? activeAyahRef.current
          : startAyah;

      await startAyahPlayback(initialAyah, reciterId, 'surah');
    },
    [isPlaying, pausePlayback, resumePlayback, startAyahPlayback]
  );

  const value = useMemo<SurahPlaybackContextValue>(
    () => ({
      activeAyahNumber,
      activeReciterId,
      isPlaying,
      playbackScope,
      toggleAyahPlayback,
      toggleSurahPlayback,
    }),
    [activeAyahNumber, activeReciterId, isPlaying, playbackScope, toggleAyahPlayback, toggleSurahPlayback]
  );

  return <SurahPlaybackContext.Provider value={value}>{children}</SurahPlaybackContext.Provider>;
}

export function useOptionalSurahPlayback() {
  return useContext(SurahPlaybackContext);
}
