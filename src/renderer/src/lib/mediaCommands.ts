import type { MediaCommand } from '@shared/types'
import { usePlayerStore } from '../store/player'
import { useIslandStore } from '../store/island'

let lastCommand: MediaCommand | null = null
let lastAt = 0

export function dispatchMediaCommand(command: MediaCommand): void {
  const now = Date.now()
  if (command === lastCommand && now - lastAt < 450) return
  lastCommand = command
  lastAt = now

  const player = usePlayerStore.getState()
  if (!player.current && command !== 'next' && command !== 'previous') {
    useIslandStore.getState().expand()
    useIslandStore.getState().setPanel('library')
    return
  }

  if (command === 'toggle') player.toggle()
  if (command === 'next') player.next()
  if (command === 'previous') player.previous()
}
