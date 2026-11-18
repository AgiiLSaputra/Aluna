import { useEffect } from 'react'
import { useIslandStore } from '../store/island'
import { useSettingsStore } from '../store/settings'

export function useClickThrough(): void {
  useEffect(() => {
    let lastX = 0
    let lastY = 0
    let frame = 0
    let lastIgnore: boolean | null = null

    const apply = (nextIgnoring: boolean): void => {
      if (lastIgnore === nextIgnoring) return
      lastIgnore = nextIgnoring
      window.api.setIgnoreMouse(nextIgnoring)
    }

    const evaluate = (): void => {
      frame = 0
      const state = useIslandStore.getState()
      if (state.locks > 0) {
        apply(false)
        return
      }
      if (lastX < 0 || lastY < 0) {
        apply(true)
        return
      }
      const element = document.elementFromPoint(lastX, lastY)
      const overIsland = Boolean(element?.closest('[data-island-surface]'))
      apply(!overIsland)
    }

    const scheduleEvaluate = (): void => {
      if (frame) return
      frame = window.requestAnimationFrame(evaluate)
    }

    const handlePosition = (x: number, y: number): void => {
      lastX = x
      lastY = y

      const state = useIslandStore.getState()
      const element = document.elementFromPoint(x, y)
      const overIsland = Boolean(element?.closest('[data-island-surface]'))

      if (overIsland) {
        if (!state.pointerInside) state.setPointerInside(true)
        if (state.phase !== 'expanded') state.expand()
        if (state.pinned) state.unpin()
      } else if (state.pointerInside) {
        state.setPointerInside(false)
      }

      scheduleEvaluate()
    }

    const handleLeave = (): void => {
      if (frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      lastX = -1
      lastY = -1
      const state = useIslandStore.getState()
      if (state.pointerInside) state.setPointerInside(false)
      if (state.locks === 0) apply(true)
    }

    const onPointerMove = (event: MouseEvent | PointerEvent): void => {
      handlePosition(event.clientX, event.clientY)
    }

    const onPointerUp = (): void => {
      window.setTimeout(scheduleEvaluate, 0)
    }

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        lastIgnore = null
        window.api.setIgnoreMouse(true)
      }
    }

    const unsubscribeStore = useIslandStore.subscribe((state, previous) => {
      if (previous.locks > 0 && state.locks === 0) scheduleEvaluate()
    })

    const unsubscribeCursor = window.api.onCursorPoint((point) => {
      if (point.x < 0 || point.y < 0) handleLeave()
      else handlePosition(point.x, point.y)
    })

    lastIgnore = true
    window.api.setIgnoreMouse(true)
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('blur', onPointerUp)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      unsubscribeStore()
      unsubscribeCursor()
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('blur', onPointerUp)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
}

export function useHoverCollapse(): void {
  const phase = useIslandStore((state) => state.phase)
  const pointerInside = useIslandStore((state) => state.pointerInside)
  const locks = useIslandStore((state) => state.locks)
  const focused = useIslandStore((state) => state.focused)
  const pinned = useIslandStore((state) => state.pinned)
  const collapseDelay = useSettingsStore((state) => state.settings.collapseDelay)

  useEffect(() => {
    if (phase !== 'expanded') return undefined
    if (pointerInside || locks > 0 || focused || pinned) return undefined

    const timer = window.setTimeout(() => {
      const state = useIslandStore.getState()
      if (!state.pointerInside && state.locks === 0 && !state.focused) {
        state.collapse()
      }
    }, collapseDelay * 1000)

    return () => window.clearTimeout(timer)
  }, [phase, pointerInside, locks, focused, pinned, collapseDelay])
}

export function useFocusTracking(): void {
  useEffect(() => {
    const isFocusKept = (): boolean => {
      const active = document.activeElement
      return active instanceof Element && Boolean(active.closest('[data-keep-expanded]'))
    }

    const refresh = (): void => {
      useIslandStore.getState().setFocused(isFocusKept())
    }

    const onFocusOut = (): void => {
      window.setTimeout(refresh, 0)
    }

    // Saat window kehilangan fokus (mis. pengguna pindah aplikasi),
    // island tidak boleh tertahan terbuka hanya karena input masih aktif.
    const onWindowBlur = (): void => {
      useIslandStore.getState().setFocused(false)
    }

    const onWindowFocus = (): void => {
      refresh()
    }

    document.addEventListener('focusin', refresh)
    document.addEventListener('focusout', onFocusOut)
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)
    return () => {
      document.removeEventListener('focusin', refresh)
      document.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('blur', onWindowBlur)
      window.removeEventListener('focus', onWindowFocus)
    }
  }, [])
}
