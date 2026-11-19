import { create } from 'zustand'
import type { AppSettings } from '@shared/types'
import { DEFAULT_SETTINGS } from '@shared/types'
import { clearCache } from '../services/cache'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<AppSettings>) => Promise<AppSettings>
}

let saveChain: Promise<unknown> = Promise.resolve()

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    try {
      const settings = await window.api.getSettings()
      set({ settings, loaded: true })
    } catch {
      set({ settings: DEFAULT_SETTINGS, loaded: true })
    }
  },

  update: async (patch) => {
    const previous = get().settings
    const optimistic = { ...previous, ...patch }
    set({ settings: optimistic })

    const run = saveChain
      .catch(() => undefined)
      .then(() => window.api.updateSettings(patch))

    saveChain = run

    try {
      const saved = await run
      const sourceChanged =
        previous.musicSource !== saved.musicSource ||
        previous.jamendoClientId !== saved.jamendoClientId ||
        previous.audiusApiKey !== saved.audiusApiKey

      if (sourceChanged) clearCache()
      set({ settings: saved, loaded: true })
      return saved
    } catch {
      set({ settings: previous })
      return previous
    }
  }
}))
