import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  screen,
  session,
  shell,
  globalShortcut
} from 'electron'
import { join } from 'node:path'
import Store from 'electron-store'
import { DEFAULT_SETTINGS, type AppSettings, type CursorPoint, type MediaCommand } from '../shared/types'

// Musik boleh mulai dari antrean atau tombol media tanpa gestur klik.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')
// Jangan simpan cache media besar ke disk.
app.commandLine.appendSwitch('disk-cache-size', '1')

const WINDOW_WIDTH = 840
const WINDOW_HEIGHT = 640

const store = new Store<{ settings: AppSettings }>({
  name: 'dynamic-island-music',
  defaults: { settings: DEFAULT_SETTINGS }
})

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let cursorTimer: ReturnType<typeof setInterval> | null = null

const CURSOR_OUTSIDE: CursorPoint = { x: -1, y: -1 }
const CURSOR_POLL_MS = 50

/**
 * Windows tidak selalu meneruskan mousemove ke window yang click-through,
 * jadi posisi kursor dibaca langsung dari OS lalu dikirim ke renderer.
 */
function startCursorTracking(): void {
  if (cursorTimer) return
  cursorTimer = setInterval(() => {
    const win = mainWindow
    if (!win || !win.isVisible() || win.webContents.isLoading()) return

    const point = screen.getCursorScreenPoint()
    const bounds = win.getBounds()
    const x = point.x - bounds.x
    const y = point.y - bounds.y
    const inside = x >= 0 && y >= 0 && x < bounds.width && y < bounds.height
    const next: CursorPoint = inside ? { x, y } : CURSOR_OUTSIDE

    win.webContents.send('cursor:point', next)
  }, CURSOR_POLL_MS)
}

function getSettings(): AppSettings {
  const saved = store.get('settings', DEFAULT_SETTINGS)
  return { ...DEFAULT_SETTINGS, ...saved }
}

function sanitizeSettings(patch: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const next: AppSettings = { ...current }

  if (typeof patch.collapseDelay === 'number' && Number.isFinite(patch.collapseDelay)) {
    next.collapseDelay = Math.min(30, Math.max(2, Math.round(patch.collapseDelay)))
  }
  if (typeof patch.verticalOffset === 'number' && Number.isFinite(patch.verticalOffset)) {
    next.verticalOffset = Math.min(200, Math.max(0, Math.round(patch.verticalOffset)))
  }
  if (patch.musicSource === 'jamendo' || patch.musicSource === 'audius') {
    next.musicSource = patch.musicSource
  }
  if (typeof patch.volume === 'number' && Number.isFinite(patch.volume)) {
    next.volume = Math.min(1, Math.max(0, patch.volume))
  }
  if (typeof patch.muted === 'boolean') next.muted = patch.muted
  if (typeof patch.autoStart === 'boolean') next.autoStart = patch.autoStart
  if (typeof patch.jamendoClientId === 'string') {
    next.jamendoClientId = patch.jamendoClientId.trim().slice(0, 200)
  }
  if (typeof patch.audiusApiKey === 'string') {
    next.audiusApiKey = patch.audiusApiKey.trim().slice(0, 300)
  }

  return next
}

function assetPath(file: string): string {
  return app.isPackaged ? join(process.resourcesPath, file) : join(app.getAppPath(), 'build', file)
}

function positionWindow(): void {
  if (!mainWindow) return
  const display = screen.getPrimaryDisplay()
  const { x, y, width } = display.workArea
  const settings = getSettings()
  mainWindow.setPosition(
    Math.round(x + (width - WINDOW_WIDTH) / 2),
    Math.round(y + settings.verticalOffset)
  )
}

function applyAutoStart(enabled: boolean): void {
  if (!app.isPackaged) return
  app.setLoginItemSettings({ openAtLogin: enabled, path: process.execPath })
}

function sendMediaCommand(command: MediaCommand): void {
  mainWindow?.webContents.send('media:command', command)
}

function registerMediaKeys(): void {
  const bindings: Array<[string, MediaCommand]> = [
    ['MediaPlayPause', 'toggle'],
    ['MediaNextTrack', 'next'],
    ['MediaPreviousTrack', 'previous']
  ]

  for (const [accelerator, command] of bindings) {
    try {
      globalShortcut.register(accelerator, () => sendMediaCommand(command))
    } catch {
      // Tombol media tidak selalu tersedia di semua keyboard/driver.
    }
  }
}

function showWindow(): void {
  if (!mainWindow) return
  mainWindow.show()
  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setIgnoreMouseEvents(true, { forward: true })
  positionWindow()
}

function showSettings(): void {
  if (!mainWindow) return
  showWindow()
  mainWindow.focus()
  mainWindow.webContents.send('app:open-settings')
}

function rebuildTrayMenu(): void {
  if (!tray) return
  const visible = mainWindow?.isVisible() ?? false
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: visible ? 'Sembunyikan Island' : 'Tampilkan Island',
        click: () => {
          if (!mainWindow) return
          if (mainWindow.isVisible()) mainWindow.hide()
          else showWindow()
          rebuildTrayMenu()
        }
      },
      { label: 'Pengaturan', click: showSettings },
      { type: 'separator' },
      {
        label: 'Keluar',
        click: () => {
          app.quit()
        }
      }
    ])
  )
}

function createTray(): void {
  const image = nativeImage.createFromPath(assetPath('tray.png'))
  tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image)
  tray.setToolTip('Dynamic Island Music')
  tray.on('double-click', showWindow)
  rebuildTrayMenu()
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    icon: assetPath('icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false
    }
  })

  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  mainWindow.on('ready-to-show', () => {
    positionWindow()
    mainWindow?.showInactive()
    mainWindow?.setIgnoreMouseEvents(true, { forward: true })
    rebuildTrayMenu()
  })

  mainWindow.on('show', () => {
    rebuildTrayMenu()
  })
  mainWindow.on('hide', () => {
    mainWindow?.setIgnoreMouseEvents(true, { forward: true })
    rebuildTrayMenu()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) void shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const current = mainWindow?.webContents.getURL() ?? ''
    if (url !== current) {
      event.preventDefault()
      if (url.startsWith('https://') || url.startsWith('http://')) void shell.openExternal(url)
    }
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    void mainWindow.loadURL(rendererUrl)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  ipcMain.handle('settings:get', () => getSettings())

  ipcMain.handle('settings:update', (_event, patch: Partial<AppSettings>) => {
    const next = sanitizeSettings(patch ?? {})
    store.set('settings', next)
    positionWindow()
    applyAutoStart(next.autoStart)
    return next
  })

  ipcMain.on('window:set-ignore', (_event, ignore: boolean) => {
    mainWindow?.setIgnoreMouseEvents(Boolean(ignore), { forward: true })
  })

  ipcMain.on('window:hide', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('shell:open-external', async (_event, url: string) => {
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        await shell.openExternal(parsed.toString())
        return true
      }
    } catch {
      // URL tidak valid.
    }
    return false
  })

  ipcMain.handle('app:version', () => app.getVersion())
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showWindow()
  })

  app.whenReady().then(() => {
    app.setAppUserModelId('com.agiil.dynamicisland')
    void session.defaultSession.clearCache()
    registerIpc()
    createWindow()
    createTray()
    startCursorTracking()
    applyAutoStart(getSettings().autoStart)
    registerMediaKeys()

    screen.on('display-metrics-changed', positionWindow)
    screen.on('display-added', positionWindow)
    screen.on('display-removed', positionWindow)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
      else showWindow()
    })
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('before-quit', () => {
    if (cursorTimer) {
      clearInterval(cursorTimer)
      cursorTimer = null
    }
    globalShortcut.unregisterAll()
    void session.defaultSession.clearCache()
  })
}
