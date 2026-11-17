import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, CursorPoint, IslandApi, MediaCommand } from '../shared/types'

const api: IslandApi = {
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:update', patch),
  setIgnoreMouse: (ignore: boolean): void => {
    ipcRenderer.send('window:set-ignore', ignore)
  },
  hideIsland: (): void => {
    ipcRenderer.send('window:hide')
  },
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke('shell:open-external', url),
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  onMediaCommand: (callback: (command: MediaCommand) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, command: MediaCommand): void => callback(command)
    ipcRenderer.on('media:command', listener)
    return () => ipcRenderer.removeListener('media:command', listener)
  },
  onOpenSettings: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('app:open-settings', listener)
    return () => ipcRenderer.removeListener('app:open-settings', listener)
  },
  onCursorPoint: (callback: (point: CursorPoint) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, point: CursorPoint): void => callback(point)
    ipcRenderer.on('cursor:point', listener)
    return () => ipcRenderer.removeListener('cursor:point', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)
