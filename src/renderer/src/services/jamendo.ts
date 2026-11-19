import type { Track } from '@shared/types'
import { cached } from './cache'
import { MusicApiError, requestJson } from './errors'

const API_BASE = 'https://api.jamendo.com/v3.0/tracks/'
const LIMIT = 30

export interface JamendoApiTrack {
  id?: string
  name?: string
  artist_name?: string
  image?: string
  audio?: string
  duration?: number
  shareurl?: string
}

interface JamendoResponse {
  headers?: {
    status?: string
    code?: number
    error_message?: string
  }
  results?: JamendoApiTrack[]
}

function ensureClientId(clientId: string): string {
  const trimmed = clientId.trim()
  if (!trimmed) {
    throw new MusicApiError(
      'auth',
      'Client ID Jamendo belum diisi. Tambahkan di Pengaturan atau pilih sumber Audius.'
    )
  }
  return trimmed
}

function mapResponse(response: JamendoResponse): Track[] {
  const status = response.headers?.status
  if (status && status !== 'success') {
    const message = response.headers?.error_message ?? 'Permintaan Jamendo gagal.'
    if (response.headers?.code === 5) {
      throw new MusicApiError('auth', 'Client ID Jamendo tidak valid.')
    }
    if (response.headers?.code === 429) {
      throw new MusicApiError('quota', 'Kuota API Jamendo habis.')
    }
    throw new MusicApiError('unknown', message)
  }

  const results = response.results
  if (!Array.isArray(results)) {
    throw new MusicApiError('unknown', 'Format respons Jamendo tidak dikenali.')
  }

  return results
    .filter((track) => track.audio && track.name && track.id)
    .map((track) => ({
      id: String(track.id),
      title: track.name as string,
      artist: track.artist_name || 'Artis tidak diketahui',
      coverUrl: track.image ?? '',
      streamUrl: track.audio as string,
      duration: Number(track.duration) || 0,
      source: 'jamendo' as const,
      sourceUrl: track.shareurl ?? 'https://www.jamendo.com'
    }))
}

function baseParams(clientId: string): URLSearchParams {
  return new URLSearchParams({
    client_id: ensureClientId(clientId),
    format: 'json',
    limit: String(LIMIT),
    audioformat: 'mp32',
    imagesize: '300',
    type: 'single albumtrack'
  })
}

export async function jamendoTrending(clientId: string, signal?: AbortSignal): Promise<Track[]> {
  const key = `jamendo:trending:${clientId}`
  return cached(key, async () => {
    const params = baseParams(clientId)
    params.set('order', 'popularity_week')
    const response = await requestJson<JamendoResponse>(`${API_BASE}?${params}`, signal)
    return mapResponse(response)
  })
}

export async function jamendoSearch(
  query: string,
  clientId: string,
  signal?: AbortSignal
): Promise<Track[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const key = `jamendo:search:${clientId}:${normalized}`
  return cached(key, async () => {
    const params = baseParams(clientId)
    params.set('search', query.trim())
    params.set('boost', 'popularity_month')
    const response = await requestJson<JamendoResponse>(`${API_BASE}?${params}`, signal)
    return mapResponse(response)
  })
}
