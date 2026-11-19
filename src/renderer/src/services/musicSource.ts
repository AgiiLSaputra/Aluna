import type { AppSettings, MusicSource, Track } from '@shared/types'
import { audiusSearch, audiusTrending } from './audius'
import { jamendoSearch, jamendoTrending } from './jamendo'

export interface MusicProvider {
  id: MusicSource
  label: string
  isConfigured: (settings: AppSettings) => boolean
  search: (query: string, settings: AppSettings, signal?: AbortSignal) => Promise<Track[]>
  trending: (settings: AppSettings, signal?: AbortSignal) => Promise<Track[]>
}

const jamendo: MusicProvider = {
  id: 'jamendo',
  label: 'Jamendo',
  isConfigured: (settings) => Boolean(settings.jamendoClientId.trim()),
  search: (query, settings, signal) => jamendoSearch(query, settings.jamendoClientId, signal),
  trending: (settings, signal) => jamendoTrending(settings.jamendoClientId, signal)
}

const audius: MusicProvider = {
  id: 'audius',
  label: 'Audius',
  isConfigured: () => true,
  search: (query, settings, signal) => audiusSearch(query, settings.audiusApiKey, signal),
  trending: (settings, signal) => audiusTrending(settings.audiusApiKey, signal)
}

const providers: Record<MusicSource, MusicProvider> = { jamendo, audius }

export function getProvider(source: MusicSource): MusicProvider {
  return providers[source]
}
