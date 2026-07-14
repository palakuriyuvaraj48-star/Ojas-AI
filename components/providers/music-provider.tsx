"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  duration?: number;
  playlist?: string;
  cover?: string;
}

interface MusicState {
  tracks: MusicTrack[];
  current: MusicTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  activePlaylist: string | null;
  setTracks: (tracks: MusicTrack[]) => void;
  playTrack: (track: MusicTrack, autoplay?: boolean) => void;
  startPlaylist: (tracks: MusicTrack[], playlistName?: string | null) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: boolean) => void;
  setActivePlaylist: (playlist: string | null) => void;
}

const MusicContext = createContext<MusicState | undefined>(undefined);
const STORAGE_KEY = "fitness-music-state";

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracksState] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState<MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);

  const play = useCallback(async () => {
    if (!audioRef.current) {
      return;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const playTrack = useCallback((track: MusicTrack, autoplay = false) => {
    setCurrent(track);
    setCurrentTime(0);
    setPlaying(autoplay);
  }, []);

  const startPlaylist = useCallback((playlistTracks: MusicTrack[], playlistName: string | null = null) => {
    if (!playlistTracks.length) {
      return;
    }

    setActivePlaylist(playlistName);
    setCurrent(playlistTracks[0]);
    setCurrentTime(0);
    setPlaying(true);
  }, []);

  const next = useCallback(() => {
    if (!tracks.length) {
      return;
    }

    const source = activePlaylist
      ? tracks.filter((track) => track.playlist === activePlaylist)
      : tracks;

    if (!source.length) {
      return;
    }

    const currentIndex = current ? source.findIndex((track) => track.id === current.id) : -1;
    const nextIndex = shuffle
      ? (() => {
          const randomIndex = Math.floor(Math.random() * source.length);
          return source.length > 1 && randomIndex === currentIndex ? (randomIndex + 1) % source.length : randomIndex;
        })()
      : (currentIndex + 1 + source.length) % source.length;

    const nextTrack = source[nextIndex];
    if (nextTrack) {
      setCurrent(nextTrack);
      setCurrentTime(0);
      setPlaying(true);
    }
  }, [activePlaylist, current, shuffle, tracks]);

  const previous = useCallback(() => {
    if (!tracks.length) {
      return;
    }

    const source = activePlaylist
      ? tracks.filter((track) => track.playlist === activePlaylist)
      : tracks;

    if (!source.length) {
      return;
    }

    const currentIndex = current ? source.findIndex((track) => track.id === current.id) : 0;
    const previousIndex = (currentIndex - 1 + source.length) % source.length;
    const previousTrack = source[previousIndex];

    if (previousTrack) {
      setCurrent(previousTrack);
      setCurrentTime(0);
      setPlaying(true);
    }
  }, [activePlaylist, current, tracks]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.volume = volume;
    audioRef.current = audio;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        void play();
      } else {
        next();
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [next, play, repeat, volume]);

  useEffect(() => {
    if (!audioRef.current || !current) {
      return;
    }

    const audio = audioRef.current;
    audio.src = current.src;
    audio.load();
    setDuration(current.duration ?? 0);
    setCurrentTime(0);

    if (playing) {
      void play();
    } else {
      audio.pause();
    }
  }, [current, play, playing]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        if (audioRef.current?.paused) {
          void play();
        } else {
          audioRef.current?.pause();
          setPlaying(false);
        }
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        next();
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
    };

    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [next, play, previous]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        currentId?: string;
        currentTime?: number;
        volume?: number;
        shuffle?: boolean;
        repeat?: boolean;
        activePlaylist?: string | null;
      };

      if (typeof parsed.volume === "number") {
        setVolumeState(parsed.volume);
      }
      if (typeof parsed.shuffle === "boolean") {
        setShuffle(parsed.shuffle);
      }
      if (typeof parsed.repeat === "boolean") {
        setRepeat(parsed.repeat);
      }
      if (typeof parsed.currentTime === "number") {
        setCurrentTime(parsed.currentTime);
      }
      if (parsed.activePlaylist) {
        setActivePlaylist(parsed.activePlaylist);
      }
      if (parsed.currentId) {
        const restoredTrack = tracks.find((track) => track.id === parsed.currentId);
        if (restoredTrack) {
          setCurrent(restoredTrack);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [tracks]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = {
      currentId: current?.id ?? null,
      currentTime,
      volume,
      shuffle,
      repeat,
      activePlaylist,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [activePlaylist, current, currentTime, repeat, shuffle, volume]);

  useEffect(() => {
    if (!tracks.length) {
      return;
    }

    const audio = new Audio();
    const pendingDurations = tracks.map((track) => {
      return new Promise<void>((resolve) => {
        audio.src = track.src;
        audio.preload = "metadata";
        const handleLoaded = () => {
          const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
          setTracksState((currentTracks) =>
            currentTracks.map((currentTrack) => (currentTrack.id === track.id ? { ...currentTrack, duration } : currentTrack)),
          );
          resolve();
        };

        audio.addEventListener("loadedmetadata", handleLoaded, { once: true });
        audio.load();
      });
    });

    void Promise.all(pendingDurations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  const state = useMemo(
    () => ({
      tracks,
      current,
      playing,
      currentTime,
      duration,
      volume,
      shuffle,
      repeat,
      activePlaylist,
      setTracks: (nextTracks: MusicTrack[]) => setTracksState(nextTracks),
      playTrack,
      startPlaylist,
      toggle: () => {
        if (!audioRef.current || !current) {
          return;
        }

        if (audioRef.current.paused) {
          void play();
        } else {
          audioRef.current.pause();
          setPlaying(false);
        }
      },
      next,
      previous,
      seek: (time: number) => {
        if (audioRef.current) {
          audioRef.current.currentTime = time;
        }
        setCurrentTime(time);
      },
      setVolume: setVolumeState,
      setShuffle,
      setRepeat,
      setActivePlaylist,
    }),
    [activePlaylist, current, currentTime, duration, next, play, playing, playTrack, previous, repeat, shuffle, startPlaylist, tracks, volume],
  );

  return <MusicContext.Provider value={state}>{children}</MusicContext.Provider>;
}

export const useMusic = () => {
  const state = useContext(MusicContext);
  if (!state) {
    throw new Error("useMusic must be used within MusicProvider");
  }

  return state;
};
