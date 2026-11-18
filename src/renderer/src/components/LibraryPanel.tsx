import { useEffect, useMemo, useRef, type JSX } from 'react'
import { useLibraryStore } from '../store/library'
import { usePlayerStore } from '../store/player'
import { useSettingsStore } from '../store/settings'
import { useIslandStore } from '../store/island'
import { getProvider } from '../services/musicSource'
import { sourceLabels } from '../lib/format'
import { TrackRow } from './TrackRow'
import {
  CloseIcon,
  ExternalIcon,
  LoaderIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  WifiOffIcon
} from './Icons'

let handledSearchFocus = 0

const sourceLinks = {
  jamendo: 'https://www.jamendo.com',
  audius: 'https://audius.co'
} as const

function SkeletonRows(): JSX.Element {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-3 px-2 py-2">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="h-2 w-1/4 animate-pulse rounded-full bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LibraryPanel(): JSX.Element {
  const settings = useSettingsStore((state) => state.settings)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const updateSettings = useSettingsStore((state) => state.update)
  const trending = useLibraryStore((state) => state.trending)
  const results = useLibraryStore((state) => state.results)
  const query = useLibraryStore((state) => state.query)
  const activeQuery = useLibraryStore((state) => state.activeQuery)
  const isLoading = useLibraryStore((state) => state.isLoading)
  const error = useLibraryStore((state) => state.error)
  const loadTrending = useLibraryStore((state) => state.loadTrending)
  const search = useLibraryStore((state) => state.search)
  const setQuery = useLibraryStore((state) => state.setQuery)
  const clearSearch = useLibraryStore((state) => state.clearSearch)
  const clearResults = useLibraryStore((state) => state.clearResults)

  const searchFocusRequest = useIslandStore((state) => state.searchFocusRequest)
  const setPanel = useIslandStore((state) => state.setPanel)

  const current = usePlayerStore((state) => state.current)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const playTrack = usePlayerStore((state) => state.playTrack)
  const toggle = usePlayerStore((state) => state.toggle)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const provider = useMemo(() => getProvider(settings.musicSource), [settings.musicSource])
  const isConfigured = provider.isConfigured(settings)
  const tracks = activeQuery ? results : trending
  const heading = activeQuery ? `Hasil untuk “${activeQuery}”` : 'Populer minggu ini'

  useEffect(() => {
    if (!settingsLoaded) return undefined
    const controller = new AbortController()
    void loadTrending(settings, controller.signal, true)
    return () => controller.abort()
  }, [
    settings.musicSource,
    settings.jamendoClientId,
    settings.audiusApiKey,
    settingsLoaded,
    loadTrending
  ])

  useEffect(() => {
    if (!query.trim()) {
      clearResults()
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void search(query, settings, controller.signal)
    }, 400)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [
    query,
    settings.musicSource,
    settings.jamendoClientId,
    settings.audiusApiKey,
    search,
    clearResults
  ])

  useEffect(() => {
    if (searchFocusRequest > handledSearchFocus) {
      handledSearchFocus = searchFocusRequest
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [searchFocusRequest])

  const retry = (): void => {
    if (activeQuery) void search(activeQuery, settings)
    else void loadTrending(settings, undefined, true)
  }

  const selectTrack = (trackId: string): void => {
    const track = tracks.find((item) => item.id === trackId)
    if (!track) return
    if (current?.id === track.id) {
      toggle()
      return
    }
    playTrack(track, tracks)
  }

  const openSource = (): void => {
    void window.api.openExternal(sourceLinks[settings.musicSource])
  }

  return (
    <section className="flex h-[420px] flex-col">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <div className="flex h-10 flex-1 items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.055] px-3.5 transition focus-within:border-accent/45 focus-within:bg-white/[0.075]">
          <SearchIcon width={15} height={15} className="shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation()
                if (query) clearSearch()
                else inputRef.current?.blur()
              }
            }}
            placeholder="Cari lagu, artis, atau genre..."
            className="h-full min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/30"
            data-keep-expanded
            spellCheck={false}
            aria-label="Cari lagu"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
              aria-label="Hapus pencarian"
              tabIndex={-1}
            >
              <CloseIcon width={12} height={12} />
            </button>
          )}
          {isLoading && <LoaderIcon width={14} height={14} className="shrink-0 text-accent-soft" />}
        </div>

        <button
          type="button"
          onClick={() => setPanel('none')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/8 hover:text-white"
          aria-label="Tutup daftar lagu"
          title="Tutup daftar lagu"
          tabIndex={-1}
        >
          <CloseIcon width={15} height={15} />
        </button>
      </div>

      <div className="flex items-end justify-between px-5 pb-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-[0.02em] text-white/70">{heading}</p>
          <p className="mt-0.5 text-[10px] text-white/35">
            {isLoading && tracks.length === 0
              ? 'Memuat lagu...'
              : `${tracks.length} lagu • ${sourceLabels[settings.musicSource]}`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!activeQuery && (
            <button
              type="button"
              onClick={() => void loadTrending(settings, undefined, true)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/35 transition hover:bg-white/8 hover:text-white disabled:opacity-40"
              aria-label="Muat ulang daftar populer"
              title="Muat ulang"
              disabled={isLoading}
              tabIndex={-1}
            >
              <RefreshIcon width={14} height={14} />
            </button>
          )}
          <button
            type="button"
            onClick={openSource}
            className="flex h-7 items-center gap-1 rounded-full px-2 text-[10px] text-white/35 transition hover:bg-white/8 hover:text-white/70"
            title={`Buka ${sourceLabels[settings.musicSource]}`}
            tabIndex={-1}
          >
            {sourceLabels[settings.musicSource]}
            <ExternalIcon width={10} height={10} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-3 mb-2 rounded-2xl border border-red-400/20 bg-red-500/[0.09] px-3.5 py-2.5">
          <div className="flex items-start gap-2">
            <WifiOffIcon width={15} height={15} className="mt-0.5 shrink-0 text-red-300/80" />
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] leading-[1.45] text-red-100/85">{error}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80 transition hover:bg-white/15"
                >
                  Coba lagi
                </button>
                {settings.musicSource === 'jamendo' && (
                  <button
                    type="button"
                    onClick={() => void updateSettings({ musicSource: 'audius' })}
                    className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium text-accent-soft transition hover:bg-accent/25"
                  >
                    Pakai Audius
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPanel('settings')}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-white/45 transition hover:text-white/80"
                >
                  <SettingsIcon width={11} height={11} />
                  Pengaturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="track-list min-h-0 flex-1 overflow-y-auto px-2 pb-1">
        {isLoading && tracks.length === 0 ? (
          <SkeletonRows />
        ) : tracks.length === 0 && !error ? (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 pb-8 text-center">
            <SearchIcon width={22} height={22} className="text-white/20" />
            <p className="text-[12px] font-medium text-white/55">
              {activeQuery ? 'Lagu tidak ditemukan' : 'Belum ada lagu'}
            </p>
            <p className="max-w-[260px] text-[10px] leading-relaxed text-white/30">
              {activeQuery
                ? 'Coba kata kunci lain atau periksa ejaan.'
                : isConfigured
                  ? 'Klik muat ulang untuk mengambil daftar populer.'
                  : 'Sumber musik perlu dikonfigurasi di Pengaturan.'}
            </p>
          </div>
        ) : (
          tracks.map((track) => (
            <TrackRow
              key={`${track.source}-${track.id}`}
              track={track}
              isCurrent={current?.id === track.id && current.source === track.source}
              isPlaying={isPlaying}
              onSelect={() => selectTrack(track.id)}
            />
          ))
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-white/6 px-5 py-2 text-[9.5px] text-white/28">
        <span>Kredit artis selalu ditampilkan.</span>
        <span className="flex items-center gap-1">
          Musik dari
          <button
            type="button"
            onClick={openSource}
            className="inline-flex items-center gap-0.5 text-white/45 transition hover:text-accent-soft"
          >
            {sourceLabels[settings.musicSource]}
            <ExternalIcon width={9} height={9} />
          </button>
        </span>
      </footer>
    </section>
  )
}
