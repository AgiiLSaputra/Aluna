import { useEffect, type JSX } from 'react'
import { Island } from './components/Island'
import { Toast } from './components/Toast'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useClickThrough, useFocusTracking, useHoverCollapse } from './hooks/useIslandBehavior'
import { dispatchMediaCommand } from './lib/mediaCommands'
import { useIslandStore } from './store/island'
import { usePlayerStore } from './store/player'
import { useSettingsStore } from './store/settings'

export default function App(): JSX.Element {
  const load = useSettingsStore((state) => state.load)
  const loaded = useSettingsStore((state) => state.loaded)
  const settings = useSettingsStore((state) => state.settings)
  const initializeVolume = usePlayerStore((state) => state.initializeVolume)
  const volume = usePlayerStore((state) => state.volume)
  const muted = usePlayerStore((state) => state.muted)

  useAudioEngine()
  useClickThrough()
  useFocusTracking()
  useHoverCollapse()

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (loaded) initializeVolume(settings.volume, settings.muted)
    // Volume hanya dipulihkan sekali saat pengaturan selesai dimuat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  useEffect(() => {
    if (!loaded) return undefined
    const timer = window.setTimeout(() => {
      const state = useSettingsStore.getState()
      if (state.settings.volume !== volume || state.settings.muted !== muted) {
        void state.update({ volume, muted })
      }
    }, 600)
    return () => window.clearTimeout(timer)
  }, [volume, muted, loaded])

  useEffect(() => {
    const offMedia = window.api.onMediaCommand(dispatchMediaCommand)
    const offSettings = window.api.onOpenSettings(() => {
      const state = useIslandStore.getState()
      state.expand()
      state.setPanel('settings')
      state.pin()
    })
    return () => {
      offMedia()
      offSettings()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      const state = useIslandStore.getState()
      if (state.phase !== 'expanded') return
      if (state.panel !== 'none') {
        state.setPanel('none')
      } else {
        state.collapse()
      }
    }

    const onOnline = (): void => {
      useIslandStore.getState().showToast('Koneksi kembali. Lagu bisa diputar lagi.', 'success')
    }
    const onOffline = (): void => {
      useIslandStore
        .getState()
        .showToast('Tidak ada koneksi. Periksa internet lalu coba lagi.', 'error')
    }
    const onBlur = (): void => {
      useIslandStore.getState().unpin()
    }

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        const state = useIslandStore.getState()
        state.setPointerInside(false)
        state.unpin()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <div className="app-shell">
      <Island />
      <Toast />
    </div>
  )
}
