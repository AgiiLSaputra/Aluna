import { create } from 'zustand'
import type { Track } from '@shared/types'

interface PlayerState {
  current: Track | null
  queue: Track[]
  index: number
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  error: string | null
  seekVersion: number
  seeking: boolean
  playTrack: (track: Track, list: Track[]) => void
  toggle: () => void
  play: () => void
  pause: () => void
  next: (automatic?: boolean) => void
  previous: () => void
  seek: (time: number) => void
  setSeeking: (seeking: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setLoading: (loading: boolean) => void
  setPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  initializeVolume: (volume: number, muted: boolean) => void
  setError: (error: string | null) => void
  stop: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  current: null,
  queue: [],
  index: -1,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 0.75,
  muted: false,
  error: null,
  seekVersion: 0,
  seeking: false,

  playTrack: (track, list) => {
    const queue = list.length > 0 ? list : [track]
    const index = Math.max(
      0,
      queue.findIndex((item) => item.id === track.id && item.source === track.source)
    )
    set({
      current: track,
      queue,
      index,
      currentTime: 0,
      duration: track.duration || 0,
      isPlaying: true,
      isLoading: true,
      error: null
    })
  },

  toggle: () => {
    const { current, isPlaying } = get()
    if (!current) return
    set({ isPlaying: !isPlaying })
  },

  play: () => {
    if (!get().current) return
    set({ isPlaying: true })
  },

  pause: () => set({ isPlaying: false }),

  next: (automatic = false) => {
    const { queue, index, duration } = get()
    if (index >= 0 && index < queue.length - 1) {
      const nextTrack = queue[index + 1]
      set({
        current: nextTrack,
        index: index + 1,
        currentTime: 0,
        duration: nextTrack.duration || 0,
        isPlaying: true,
        isLoading: true,
        error: null
      })
    } else if (automatic) {
      set({ isPlaying: false, currentTime: duration })
    } else {
      set({ isPlaying: false })
    }
  },

  previous: () => {
    const { currentTime, index, queue } = get()
    if (currentTime > 3) {
      set({ currentTime: 0, seekVersion: get().seekVersion + 1 })
      return
    }
    if (index > 0) {
      const previousTrack = queue[index - 1]
      set({
        current: previousTrack,
        index: index - 1,
        currentTime: 0,
        duration: previousTrack.duration || 0,
        isPlaying: true,
        isLoading: true,
        error: null
      })
    } else {
      set({ currentTime: 0, seekVersion: get().seekVersion + 1 })
    }
  },

  seek: (time) =>
    set({ currentTime: Math.max(0, time), seekVersion: get().seekVersion + 1 }),
  setSeeking: (seeking) => set({ seeking }),
  setCurrentTime: (time) => set({ currentTime: Math.max(0, time) }),
  setDuration: (duration) => set({ duration: Math.max(0, duration) }),
  setLoading: (isLoading) => set({ isLoading }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume: Math.min(1, Math.max(0, volume)), muted: false }),
  setMuted: (muted) => set({ muted }),
  initializeVolume: (volume, muted) => set({ volume, muted }),
  setError: (error) => set({ error }),
  stop: () => set({ isPlaying: false, currentTime: 0 })
}))
