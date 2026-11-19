import { create } from 'zustand'
import type { AppSettings, Track } from '@shared/types'
import { friendlyError } from '../services/errors'
import { getProvider } from '../services/musicSource'

interface LibraryState {
  trending: Track[]
  results: Track[]
  query: string
  activeQuery: string
  source: AppSettings['musicSource'] | null
  isLoading: boolean
  error: string | null
  loadTrending: (settings: AppSettings, signal?: AbortSignal, force?: boolean) => Promise<void>
  search: (query: string, settings: AppSettings, signal?: AbortSignal) => Promise<void>
  setQuery: (query: string) => void
  clearSearch: () => void
  clearResults: () => void
  reset: () => void
}

let requestSequence = 0

export const useLibraryStore = create<LibraryState>((set, get) => ({
  trending: [],
  results: [],
  query: '',
  activeQuery: '',
  source: null,
  isLoading: false,
  error: null,

  loadTrending: async (settings, signal, force = false) => {
    const state = get()
    if (!force && state.source === settings.musicSource && state.trending.length > 0) return

    const sequence = ++requestSequence
    set({ isLoading: true, error: null, source: settings.musicSource })

    const provider = getProvider(settings.musicSource)
    if (!provider.isConfigured(settings)) {
      set({
        isLoading: false,
        trending: settings.musicSource === 'jamendo' ? [] : get().trending,
        error:
          settings.musicSource === 'jamendo'
            ? 'Client ID Jamendo belum diisi. Buka Pengaturan untuk menambahkannya, atau pilih sumber Audius.'
            : 'Sumber musik belum siap. Buka Pengaturan.'
      })
      return
    }

    try {
      const tracks = await provider.trending(settings, signal)
      if (sequence !== requestSequence) return
      set({ trending: tracks, isLoading: false, error: null })
    } catch (error) {
      if (signal?.aborted) return
      if (sequence !== requestSequence) return
      set({ isLoading: false, error: friendlyError(error) })
    }
  },

  search: async (query, settings, signal) => {
    const trimmed = query.trim()
    if (!trimmed) {
      set({ results: [], activeQuery: '', isLoading: false, error: null })
      return
    }

    const sequence = ++requestSequence
    set({ isLoading: true, error: null, activeQuery: trimmed, source: settings.musicSource })

    const provider = getProvider(settings.musicSource)
    if (!provider.isConfigured(settings)) {
      set({
        isLoading: false,
        results: [],
        error:
          settings.musicSource === 'jamendo'
            ? 'Client ID Jamendo belum diisi. Buka Pengaturan untuk menambahkannya, atau pilih sumber Audius.'
            : 'Sumber musik belum siap. Buka Pengaturan.'
      })
      return
    }

    try {
      const tracks = await provider.search(trimmed, settings, signal)
      if (sequence !== requestSequence) return
      set({ results: tracks, isLoading: false, error: null })
    } catch (error) {
      if (signal?.aborted) return
      if (sequence !== requestSequence) return
      set({ isLoading: false, error: friendlyError(error) })
    }
  },

  setQuery: (query) => set({ query }),

  clearSearch: () => set({ query: '', results: [], activeQuery: '', error: null }),

  clearResults: () => set({ results: [], activeQuery: '', error: null, isLoading: false }),

  reset: () => {
    requestSequence += 1
    set({
      trending: [],
      results: [],
      query: '',
      activeQuery: '',
      source: null,
      isLoading: false,
      error: null
    })
  }
}))
