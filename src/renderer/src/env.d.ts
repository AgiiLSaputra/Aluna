import type { IslandApi } from '@shared/types'

declare global {
  interface Window {
    api: IslandApi
  }
}

export {}
