import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapAudiusTrack } from '../audius'
import { cacheSize, cached, clearCache } from '../cache'
import { MusicApiError, friendlyError } from '../errors'

describe('mapAudiusTrack', () => {
  it('memetakan track Audius ke kontrak Track', () => {
    const track = mapAudiusTrack({
      id: 'abc123',
      title: 'Lagu Uji',
      duration: 180,
      permalink: '/artis/lagu-uji',
      is_streamable: true,
      artwork: { '480x480': 'https://cdn.example/cover.jpg' },
      user: { name: 'Artis Uji' }
    })

    expect(track).toMatchObject({
      id: 'abc123',
      title: 'Lagu Uji',
      artist: 'Artis Uji',
      coverUrl: 'https://cdn.example/cover.jpg',
      duration: 180,
      source: 'audius',
      sourceUrl: 'https://audius.co/artis/lagu-uji'
    })
    expect(track?.streamUrl).toContain('/v1/tracks/abc123/stream')
    expect(track?.streamUrl).toContain('app_name=DynamicIslandMusic')
  })

  it('menolak track yang tidak bisa di-stream', () => {
    expect(
      mapAudiusTrack({ id: 'x', title: 'Tidak bisa', is_streamable: false, user: { name: 'A' } })
    ).toBeNull()
  })

  it('memakai fallback handle artis dan cover 150px', () => {
    const track = mapAudiusTrack({
      id: 'y',
      title: 'Fallback',
      artwork: { '150x150': 'https://cdn.example/150.jpg' },
      user: { handle: 'handle_artis' }
    })
    expect(track?.artist).toBe('handle_artis')
    expect(track?.coverUrl).toBe('https://cdn.example/150.jpg')
  })
})

describe('cache', () => {
  beforeEach(() => {
    clearCache()
    vi.useRealTimers()
  })

  it('mengembalikan nilai cache tanpa memanggil loader dua kali', async () => {
    let calls = 0
    const loader = async (): Promise<string> => {
      calls += 1
      return 'nilai'
    }

    expect(await cached('kunci', loader)).toBe('nilai')
    expect(await cached('kunci', loader)).toBe('nilai')
    expect(calls).toBe(1)
    expect(cacheSize()).toBe(1)
  })

  it('memuat ulang setelah TTL 10 menit', async () => {
    vi.useFakeTimers()
    let calls = 0
    const loader = async (): Promise<number> => {
      calls += 1
      return calls
    }

    expect(await cached('ttl', loader)).toBe(1)
    vi.advanceTimersByTime(10 * 60 * 1000 + 1)
    expect(await cached('ttl', loader)).toBe(2)
  })
})

describe('friendlyError', () => {
  it('memberi pesan Indonesia untuk error yang dikenal', () => {
    expect(friendlyError(new MusicApiError('auth', 'Client ID salah.'))).toContain('Client ID')
    expect(friendlyError(new MusicApiError('quota', ''))).toContain('Kuota')
    expect(friendlyError(new MusicApiError('network', ''))).toContain('Tidak ada koneksi')
    expect(friendlyError(new TypeError('fetch failed'))).toContain('Tidak ada koneksi')
  })
})
