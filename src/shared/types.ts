export type MusicSource = 'jamendo' | 'audius'

export interface Track {
  id: string
  title: string
  artist: string
  coverUrl: string
  streamUrl: string
  duration: number
  source: MusicSource
  sourceUrl: string
}

export interface AppSettings {
  /** Detik sebelum island mengecil setelah kursor keluar. */
  collapseDelay: number
  /** Jarak vertikal island dari tepi atas layar (px). */
  verticalOffset: number
  musicSource: MusicSource
  /** Volume terakhir (0 - 1). */
  volume: number
  muted: boolean
  autoStart: boolean
  jamendoClientId: string
  audiusApiKey: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  collapseDelay: 5,
  verticalOffset: 10,
  musicSource: 'audius',
  volume: 0.75,
  muted: false,
  autoStart: false,
  jamendoClientId: '',
  audiusApiKey: ''
}

export type MediaCommand = 'toggle' | 'next' | 'previous'

/** Posisi kursor relatif terhadap window, dalam piksel CSS. */
export interface CursorPoint {
  x: number
  y: number
}

export interface OpenSettingsPayload {
  section: 'umum'
}

export interface IslandApi {
  getSettings: () => Promise<AppSettings>
  updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>
  setIgnoreMouse: (ignore: boolean) => void
  hideIsland: () => void
  openExternal: (url: string) => Promise<boolean>
  getVersion: () => Promise<string>
  onMediaCommand: (callback: (command: MediaCommand) => void) => () => void
  onOpenSettings: (callback: () => void) => () => void
  onCursorPoint: (callback: (point: CursorPoint) => void) => () => void
}
