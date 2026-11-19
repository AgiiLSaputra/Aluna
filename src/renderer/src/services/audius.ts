import type { Track } from '@shared/types'
import { cached } from './cache'
import { MusicApiError, requestJson } from './errors'

const API_BASE = 'https://api.audius.co/v1'
const APP_NAME = 'DynamicIslandMusic'
const LIMIT = 30

interface AudiusUser {
  name?: string
  handle?: string
}

export interface AudiusApiTrack {
  id?: string
  track_id?: number
  title?: string
  duration?: number
  permalink?: string
  is_streamable?: boolean
  is_available?: boolean
  is_delete?: boolean
  artwork?: Record<string, string> | null
  user?: AudiusUser
}

interface AudiusResponse {
  data?: AudiusApiTrack[]
}

function artworkUrl(track: AudiusApiTrack): string {
  const artwork = track.artwork
  if (!artwork) return ''
  return artwork['480x480'] ?? artwork['150x150'] ?? artwork['1000x1000'] ?? ''
}

function withApiKey(params: URLSearchParams, apiKey: string): URLSearchParams {
  params.set('app_name', APP_NAME)
  if (apiKey.trim()) params.set('api_key', apiKey.trim())
  return params
}

export function mapAudiusTrack(track: AudiusApiTrack, apiKey = ''): Track | null {
  const id = track.id ?? (track.track_id ? String(track.track_id) : '')
  if (!id || !track.title) return null
  if (track.is_streamable === false || track.is_available === false || track.is_delete) return null

  const streamParams = withApiKey(new URLSearchParams(), apiKey)
  const artist = track.user?.name ?? track.user?.handle ?? 'Artis tidak diketahui'
  const permalink = track.permalink ?? ''

  return {
    id,
    title: track.title,
    artist,
    coverUrl: artworkUrl(track),
    streamUrl: `${API_BASE}/tracks/${encodeURIComponent(id)}/stream?${streamParams.toString()}`,
    duration: Number(track.duration) || 0,
    source: 'audius',
    sourceUrl: permalink ? `https://audius.co${permalink}` : 'https://audius.co'
  }
}

function mapList(response: AudiusResponse, apiKey: string): Track[] {
  if (!Array.isArray(response.data)) {
    throw new MusicApiError('unknown', 'Format respons Audius tidak dikenali.')
  }
  const seen = new Set<string>()
  const tracks: Track[] = []
  for (const item of response.data) {
    const track = mapAudiusTrack(item, apiKey)
    if (track && !seen.has(track.id)) {
      seen.add(track.id)
      tracks.push(track)
    }
  }
  return tracks
}

export async function audiusTrending(apiKey: string, signal?: AbortSignal): Promise<Track[]> {
  const key = `audius:trending:${apiKey}`
  return cached(key, async () => {
    const params = withApiKey(new URLSearchParams(), apiKey)
    params.set('time', 'week')
    params.set('limit', String(LIMIT))
    const response = await requestJson<AudiusResponse>(`${API_BASE}/tracks/trending?${params}`, signal)
    return mapList(response, apiKey)
  })
}

export async function audiusSearch(
  query: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<Track[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const key = `audius:search:${apiKey}:${normalized}`
  return cached(key, async () => {
    const params = withApiKey(new URLSearchParams(), apiKey)
    params.set('query', query.trim())
    params.set('limit', String(LIMIT))
    const response = await requestJson<AudiusResponse>(`${API_BASE}/tracks/search?${params}`, signal)
    return mapList(response, apiKey)
  })
}
