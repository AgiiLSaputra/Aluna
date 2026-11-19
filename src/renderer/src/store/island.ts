import { create } from 'zustand'

export type IslandPhase = 'collapsed' | 'expanded'
export type IslandPanel = 'none' | 'library' | 'settings'
export type ToastKind = 'info' | 'error' | 'success'

export interface IslandToast {
  id: number
  message: string
  kind: ToastKind
}

interface IslandState {
  phase: IslandPhase
  panel: IslandPanel
  pointerInside: boolean
  locks: number
  focused: boolean
  pinned: boolean
  toast: IslandToast | null
  searchFocusRequest: number
  expand: () => void
  collapse: () => void
  setPanel: (panel: IslandPanel) => void
  togglePanel: (panel: Exclude<IslandPanel, 'none'>) => void
  requestSearchFocus: () => void
  setPointerInside: (inside: boolean) => void
  lock: () => void
  unlock: () => void
  setFocused: (focused: boolean) => void
  pin: () => void
  unpin: () => void
  showToast: (message: string, kind?: ToastKind) => void
  dismissToast: (id?: number) => void
}

let toastId = 0

export const useIslandStore = create<IslandState>((set, get) => ({
  phase: 'collapsed',
  panel: 'library',
  pointerInside: false,
  locks: 0,
  focused: false,
  pinned: false,
  toast: null,
  searchFocusRequest: 0,

  expand: () => {
    if (get().phase !== 'expanded') set({ phase: 'expanded' })
  },

  collapse: () => {
    if (get().phase !== 'collapsed') set({ phase: 'collapsed', pointerInside: false })
  },

  setPanel: (panel) => set({ panel }),

  togglePanel: (panel) => {
    set({ panel: get().panel === panel ? 'none' : panel })
  },

  requestSearchFocus: () =>
    set({ panel: 'library', searchFocusRequest: get().searchFocusRequest + 1 }),

  setPointerInside: (inside) => set({ pointerInside: inside }),

  lock: () => set({ locks: get().locks + 1 }),

  unlock: () => set({ locks: Math.max(0, get().locks - 1) }),

  setFocused: (focused) => set({ focused }),

  pin: () => set({ pinned: true }),
  unpin: () => set({ pinned: false }),

  showToast: (message, kind = 'info') => {
    const id = ++toastId
    set({ toast: { id, message, kind } })
    window.setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 4200)
  },

  dismissToast: (id) => {
    if (id === undefined || get().toast?.id === id) set({ toast: null })
  }
}))
