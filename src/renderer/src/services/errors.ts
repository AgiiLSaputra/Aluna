export type MusicErrorCode = 'auth' | 'quota' | 'network' | 'notfound' | 'unknown'

export class MusicApiError extends Error {
  readonly code: MusicErrorCode
  readonly status?: number

  constructor(code: MusicErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'MusicApiError'
    this.code = code
    this.status = status
  }
}

export function friendlyError(error: unknown): string {
  if (error instanceof MusicApiError) {
    switch (error.code) {
      case 'auth':
        return error.message || 'Kunci API belum diatur atau tidak valid. Buka Pengaturan.'
      case 'quota':
        return 'Kuota API habis atau sedang dibatasi. Coba lagi nanti atau ganti sumber musik.'
      case 'network':
        return 'Tidak ada koneksi. Periksa internet lalu coba lagi.'
      case 'notfound':
        return 'Lagu tidak ditemukan.'
      default:
        return error.message || 'Terjadi kesalahan saat mengambil lagu.'
    }
  }

  if (error instanceof TypeError) {
    return 'Tidak ada koneksi. Periksa internet lalu coba lagi.'
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return ''
  }

  return 'Terjadi kesalahan saat mengambil lagu.'
}

export async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new MusicApiError('network', 'Tidak ada koneksi.')
  }

  if (response.status === 429) {
    throw new MusicApiError('quota', 'Kuota API habis.', response.status)
  }

  if (response.status === 401 || response.status === 403) {
    throw new MusicApiError('auth', 'Kunci API ditolak oleh server musik.', response.status)
  }

  if (!response.ok) {
    throw new MusicApiError('unknown', `Server musik membalas ${response.status}.`, response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new MusicApiError('unknown', 'Respons musik tidak dapat dibaca.')
  }
}
