"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Music2, Pause, Play, Repeat2, Search, Shuffle, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MusicTrack, useMusic } from "@/components/providers/music-provider";

const playlists = [
  {
    name: "Heavy Lift",
    emoji: "🔥",
    description: "Maximum intent for your strongest sets",
    accent: "from-rose-500 via-orange-400 to-amber-300",
  },
  {
    name: "Morning Energy",
    emoji: "⚡",
    description: "Bright momentum for an early start",
    accent: "from-yellow-400 to-amber-500",
  },
  {
    name: "Cardio Blast",
    emoji: "🏃",
    description: "Fast, focused intervals",
    accent: "from-cyan-400 to-blue-500",
  },
  {
    name: "Muscle Gain",
    emoji: "💪",
    description: "Steady sets and progressive overload",
    accent: "from-violet-500 to-purple-600",
  },
  {
    name: "Fat Burn",
    emoji: "🔥",
    description: "Push the pace and keep your rhythm",
    accent: "from-pink-500 to-rose-600",
  },
  {
    name: "Cycling",
    emoji: "🚴",
    description: "Cadence-driven endurance",
    accent: "from-lime-400 to-emerald-600",
  },
  {
    name: "Yoga & Stretching",
    emoji: "🧘",
    description: "Breathe, mobilize, and reset",
    accent: "from-teal-400 to-cyan-600",
  },
  {
    name: "Cool Down",
    emoji: "😌",
    description: "A softer landing after training",
    accent: "from-indigo-400 to-slate-600",
  },
] as const;

const formatTime = (time: number) => {
  if (!Number.isFinite(time) || time <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export function MusicView() {
  const music = useMusic();
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/music")
      .then((response) => response.json())
      .then((data: { tracks: MusicTrack[] }) => {
        if (isMounted) {
          music.setTracks(data.tracks);
        }
      })
      .catch(() => {
        if (isMounted) {
          music.setTracks([]);
        }
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTracks = useMemo(
    () => music.tracks.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(query.toLowerCase())),
    [music.tracks, query],
  );

  const choosePlaylist = (name: string) => {
    setSelectedPlaylist(name);
    setPrompt(true);
  };

  const startSelectedPlaylist = () => {
    if (!selectedPlaylist) {
      return;
    }

    const playlistTracks = music.tracks.filter((track) => track.playlist === selectedPlaylist);
    if (playlistTracks.length) {
      music.startPlaylist(playlistTracks, selectedPlaylist);
    }
    setPrompt(false);
  };

  const currentPlaylistTracks = selectedPlaylist ? music.tracks.filter((track) => track.playlist === selectedPlaylist) : [];
  const heroTrack = music.current ?? music.tracks[0];

  const playlistDetails = (name: string) => {
    const tracks = music.tracks.filter((track) => track.playlist === name);
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration ?? 0), 0);
    return { tracks, totalDuration };
  };

  return (
    <div className="space-y-6 pb-32">
      <GlassCard className="overflow-hidden bg-gradient-to-br from-[#293d74] via-[#1a1a25] to-[#111115]" glow>
        <div className="flex flex-col gap-6 p-2 md:flex-row md:items-end">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4d8eff] via-[#8c61ff] to-[#f05a8a] text-7xl shadow-2xl">
            {heroTrack ? "🎧" : "🏋️"}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#adc6ff]">Titan Sound System</p>
            <h2 className="mt-2 text-3xl font-black text-white">Workout Music</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Premium playlists for every training block, from heavy lifts to cool-down flow, with playback that follows you across every route.
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Now playing</p>
              <h3 className="mt-1 text-xl font-bold text-white">{music.current?.title ?? "Choose a track"}</h3>
              <p className="text-xs text-white/50">
                {music.current ? `${music.current.artist} · ${music.current.album}` : "Drop a few MP3s into public/music to start your training library."}
              </p>
            </div>
            <button aria-label="Favorite" className="rounded-full border border-white/10 p-2 text-white/45">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="relative aspect-square max-h-80 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#4d8eff] via-[#8c61ff] to-[#f05a8a] p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_40%)]" />
            <div className="relative flex h-full items-end justify-between rounded-[24px] border border-white/15 bg-black/10 p-5 backdrop-blur-md">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">{music.activePlaylist ?? "Fresh Session"}</p>
                <p className="mt-2 text-2xl font-black text-white">{music.current?.title ?? "Ready to train"}</p>
                <p className="text-sm text-white/70">{music.current?.artist ?? "Select a workout playlist"}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90">
                {music.current ? formatTime(music.current.duration ?? music.duration) : "0:00"}
              </div>
            </div>
          </div>

          <div className="flex h-8 items-end justify-center gap-1">
            {Array.from({ length: 32 }).map((_, index) => (
              <motion.span
                key={index}
                animate={music.playing ? { height: [5, 10 + (index % 6) * 3, 5] } : { height: 6 }}
                transition={{ repeat: Infinity, duration: 0.5 + (index % 5) * 0.07 }}
                className="w-1 rounded-full bg-[#adc6ff]"
              />
            ))}
          </div>

          <div className="space-y-2">
            <input
              aria-label="Seek track"
              type="range"
              min="0"
              max={music.duration || 1}
              value={music.currentTime}
              onChange={(event) => music.seek(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#adc6ff]"
            />
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/40">
              <span>{formatTime(music.currentTime)}</span>
              <span>{formatTime(music.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => music.setShuffle(!music.shuffle)} className={music.shuffle ? "text-[#adc6ff]" : "text-white/50"}>
                <Shuffle className="h-5 w-5" />
              </button>
              <button onClick={music.previous} className="text-white/80">
                <SkipBack className="h-6 w-6" />
              </button>
              <button onClick={music.toggle} disabled={!music.current} className="grid h-14 w-14 place-items-center rounded-full bg-[#adc6ff] text-[#121217] shadow-lg shadow-[#adc6ff]/20 disabled:opacity-40">
                {music.playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}
              </button>
              <button onClick={music.next} className="text-white/80">
                <SkipForward className="h-6 w-6" />
              </button>
              <button onClick={() => music.setRepeat(!music.repeat)} className={music.repeat ? "text-[#adc6ff]" : "text-white/50"}>
                <Repeat2 className="h-5 w-5" />
              </button>
            </div>
            <label className="flex items-center gap-2 text-white/50">
              <Volume2 className="h-4 w-4" />
              <input
                aria-label="Volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={music.volume}
                onChange={(event) => music.setVolume(Number(event.target.value))}
                className="w-24 accent-[#adc6ff]"
              />
            </label>
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your music library"
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-3 text-sm text-white outline-none"
              />
            </div>

            <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
              {visibleTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => music.playTrack(track, true)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${music.current?.id === track.id ? "bg-[#adc6ff]/15" : "hover:bg-white/5"}`}
                >
                  <Music2 className="h-4 w-4 text-[#adc6ff]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">{track.title}</span>
                    <span className="block truncate text-xs text-white/45">{track.artist}</span>
                  </span>
                  <span className="text-xs text-white/40">{formatTime(track.duration ?? 0)}</span>
                </button>
              ))}

              {!visibleTracks.length && (
                <p className="rounded-xl border border-dashed border-white/15 p-5 text-center text-xs text-white/45">
                  No MP3 files were found yet. Add audio files to public/music and reopen Music Mode.
                </p>
              )}
            </div>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2">
            {playlists.map((playlist) => {
              const details = playlistDetails(playlist.name);
              return (
                <motion.button
                  whileHover={{ y: -3, scale: 1.01 }}
                  key={playlist.name}
                  onClick={() => choosePlaylist(playlist.name)}
                  className={`rounded-[24px] bg-gradient-to-br ${playlist.accent} p-4 text-left shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{playlist.emoji}</span>
                    <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
                      {details.tracks.length} songs
                    </span>
                  </div>
                  <p className="mt-6 font-black text-white">{playlist.name}</p>
                  <p className="mt-1 text-xs text-white/75">{playlist.description}</p>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80">
                    {formatTime(details.totalDuration)} · {details.tracks.length > 0 ? "ready to launch" : "empty"}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {prompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
            <GlassCard className="max-w-sm space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#adc6ff]">{selectedPlaylist}</p>
              <h3 className="text-xl font-bold text-white">Would you like to start your workout playlist?</h3>
              <p className="text-sm text-white/55">
                We will launch the matching training mix and keep it playing while you move between views.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setPrompt(false)} className="rounded-xl px-4 py-2 text-sm text-white/60">
                  Not now
                </button>
                <button onClick={startSelectedPlaylist} disabled={!currentPlaylistTracks.length} className="rounded-xl bg-[#adc6ff] px-4 py-2 text-sm font-bold text-[#121217] disabled:opacity-40">
                  Start playlist
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {music.current && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-white/15 bg-[#16161bd9] p-3 shadow-2xl backdrop-blur-xl">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#adc6ff]/15 text-xl">🎵</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{music.current.title}</p>
            <p className="truncate text-xs text-white/45">{music.current.artist}</p>
          </div>
          <button onClick={music.previous} className="text-white/70">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={music.toggle} className="grid h-9 w-9 place-items-center rounded-full bg-[#adc6ff] text-[#121217]">
            {music.playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>
          <button onClick={music.next} className="text-white/70">
            <SkipForward className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}