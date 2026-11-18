import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/player'
import { useIslandStore } from '../store/island'
import { clamp } from '../lib/format'

export function useAudioEngine(): void {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (!audioRef.current) {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio
  }
  const skipTimer = useRef<number | null>(null)

  const current = usePlayerStore((state) => state.current)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const volume = usePlayerStore((state) => state.volume)
  const muted = usePlayerStore((state) => state.muted)
  const seekVersion = usePlayerStore((state) => state.seekVersion)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    let lastPositionUpdate = 0

    const updatePositionState = (): void => {
      const store = usePlayerStore.getState()
      if (!navigator.mediaSession || !navigator.mediaSession.metadata) return
      if (!Number.isFinite(store.duration) || store.duration <= 0) return
      if (typeof navigator.mediaSession.setPositionState !== 'function') return
      const now = Date.now()
      if (now - lastPositionUpdate < 900) return
      lastPositionUpdate = now
      try {
        navigator.mediaSession.setPositionState({
          duration: store.duration,
          playbackRate: audio.playbackRate || 1,
          position: Math.min(store.duration, Math.max(0, audio.currentTime || 0))
        })
      } catch {
        // Posisi belum valid menurut Chromium.
      }
    }

    const onLoadedMetadata = (): void => {
      const store = usePlayerStore.getState()
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        store.setDuration(audio.duration)
      }
      store.setLoading(false)
      updatePositionState()
    }

    const onTimeUpdate = (): void => {
      const store = usePlayerStore.getState()
      if (!store.seeking) {
        store.setCurrentTime(audio.currentTime)
        updatePositionState()
      }
    }

    const onEnded = (): void => {
      usePlayerStore.getState().next(true)
    }

    const onWaiting = (): void => {
      usePlayerStore.getState().setLoading(true)
    }

    const onPlaying = (): void => {
      const store = usePlayerStore.getState()
      store.setLoading(false)
      store.setPlaying(true)
      store.setError(null)
    }

    const onError = (): void => {
      const store = usePlayerStore.getState()
      const trackId = store.current?.id
      if (!trackId) return

      store.setLoading(false)
      store.setPlaying(false)

      if (!navigator.onLine) {
        const message = 'Tidak ada koneksi. Lagu berhenti dan bisa dicoba lagi saat internet kembali.'
        store.setError(message)
        useIslandStore.getState().showToast(message, 'error')
        return
      }

      useIslandStore
        .getState()
        .showToast('Lagu ini gagal dimuat. Mencoba lagu berikutnya...', 'error')

      if (skipTimer.current) window.clearTimeout(skipTimer.current)
      skipTimer.current = window.setTimeout(() => {
        skipTimer.current = null
        const latest = usePlayerStore.getState()
        if (latest.current?.id === trackId) latest.next(true)
      }, 1600)
    }

    const setHandler = (
      action: MediaSessionAction,
      handler: ((details: MediaSessionActionDetails) => void) | null
    ): void => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Aksi media tidak didukung di platform ini.
      }
    }

    setHandler('play', () => usePlayerStore.getState().play())
    setHandler('pause', () => usePlayerStore.getState().pause())
    setHandler('nexttrack', () => usePlayerStore.getState().next())
    setHandler('previoustrack', () => usePlayerStore.getState().previous())
    setHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') usePlayerStore.getState().seek(details.seekTime)
    })

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('canplay', onPlaying)
    audio.addEventListener('error', onError)

    return () => {
      if (skipTimer.current) window.clearTimeout(skipTimer.current)
      skipTimer.current = null
      setHandler('play', null)
      setHandler('pause', null)
      setHandler('nexttrack', null)
      setHandler('previoustrack', null)
      setHandler('seekto', null)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('canplay', onPlaying)
      audio.removeEventListener('error', onError)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!current) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      return
    }

    audio.pause()
    audio.src = current.streamUrl
    audio.load()
    audio.currentTime = 0

    if (usePlayerStore.getState().isPlaying) {
      const promise = audio.play()
      promise?.catch((error: DOMException) => {
        if (error.name === 'AbortError') return
        usePlayerStore.getState().setLoading(false)
        usePlayerStore.getState().setPlaying(false)
        useIslandStore
          .getState()
          .showToast('Lagu belum bisa diputar. Klik putar untuk mencoba lagi.', 'error')
      })
    }
  }, [current?.id, current?.source, current?.streamUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      if (audio.paused) {
        const promise = audio.play()
        promise?.catch((error: DOMException) => {
          if (error.name === 'AbortError') return
          usePlayerStore.getState().setLoading(false)
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = clamp(volume, 0, 1)
    audio.muted = muted
  }, [volume, muted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const time = usePlayerStore.getState().currentTime
    if (Number.isFinite(time)) {
      audio.currentTime = Math.max(0, time)
    }
  }, [seekVersion])

  useEffect(() => {
    if (!navigator.mediaSession) return

    if (!current) {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.playbackState = 'none'
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      album: 'Dynamic Island Music',
      artwork: current.coverUrl
        ? [{ src: current.coverUrl, sizes: '480x480', type: 'image/jpeg' }]
        : []
    })
  }, [current])

  useEffect(() => {
    if (!navigator.mediaSession) return
    navigator.mediaSession.playbackState = current ? (isPlaying ? 'playing' : 'paused') : 'none'
  }, [current, isPlaying])
}
