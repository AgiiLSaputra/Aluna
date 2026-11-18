import type { JSX } from 'react'
import { usePlayerStore } from '../store/player'
import { useIslandStore } from '../store/island'
import { useSettingsStore } from '../store/settings'
import { sourceLabels } from '../lib/format'
import { Cover, Equalizer, Marquee } from './Media'
import { ProgressBar, VolumeControl } from './PlayerControls'
import {
  ExternalIcon,
  ListIcon,
  LoaderIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  SearchIcon,
  SettingsIcon
} from './Icons'

function IconButton({
  label,
  onClick,
  active = false,
  children
}: {
  label: string
  onClick: () => void
  active?: boolean
  children: JSX.Element
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-white/12 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white'
      }`}
      aria-label={label}
      title={label}
      tabIndex={-1}
    >
      {children}
    </button>
  )
}

export function PlayerBar(): JSX.Element {
  const current = usePlayerStore((state) => state.current)
  const queue = usePlayerStore((state) => state.queue)
  const index = usePlayerStore((state) => state.index)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const isLoading = usePlayerStore((state) => state.isLoading)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const toggle = usePlayerStore((state) => state.toggle)
  const next = usePlayerStore((state) => state.next)
  const previous = usePlayerStore((state) => state.previous)
  const panel = useIslandStore((state) => state.panel)
  const togglePanel = useIslandStore((state) => state.togglePanel)
  const requestSearchFocus = useIslandStore((state) => state.requestSearchFocus)
  const source = useSettingsStore((state) => state.settings.musicSource)

  const hasPrevious = Boolean(current) && (index > 0 || currentTime > 3)
  const hasNext = Boolean(current) && index >= 0 && index < queue.length - 1

  const openSource = (): void => {
    if (current?.sourceUrl) void window.api.openExternal(current.sourceUrl)
  }

  return (
    <div className="flex h-full w-full items-center gap-3 px-4">
      <Cover
        src={current?.coverUrl ?? ''}
        alt={current ? `Cover ${current.title}` : 'Belum ada lagu'}
        className="cover-shadow h-[66px] w-[66px] shrink-0 rounded-[18px]"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Marquee
              text={current?.title ?? 'Pilih lagu untuk mulai'}
              className={`text-[15px] font-semibold leading-tight tracking-[-0.01em] ${
                current ? 'text-white text-glow' : 'text-white/55'
              }`}
            />
          </div>
          {current && isPlaying && <Equalizer />}
        </div>

        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/50">
          <span className="truncate">{current?.artist ?? 'Musik gratis dari Jamendo & Audius'}</span>
          {current && (
            <>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={openSource}
                className="flex shrink-0 items-center gap-1 rounded-md py-0.5 text-white/40 transition-colors hover:text-accent-soft"
                title={`Buka ${sourceLabels[current.source]} — kredit artis`}
              >
                {sourceLabels[current.source]}
                <ExternalIcon width={10} height={10} />
              </button>
            </>
          )}
        </div>

        <div className="mt-1">
          {current ? (
            <ProgressBar />
          ) : (
            <p className="text-[10px] leading-4 text-white/30">
              Buka daftar lagu di bawah. Sumber aktif: {sourceLabels[source]}.
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={previous}
          disabled={!hasPrevious}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/65 transition hover:bg-white/8 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
          aria-label="Lagu sebelumnya"
          title="Lagu sebelumnya"
        >
          <PrevIcon width={17} height={17} />
        </button>

        <button
          type="button"
          onClick={toggle}
          disabled={!current}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#ff4557] to-[#c91020] text-white shadow-[0_8px_22px_rgba(225,29,46,0.4)] transition hover:brightness-110 active:scale-95 disabled:cursor-default disabled:opacity-35 disabled:shadow-none"
          aria-label={isPlaying ? 'Jeda' : 'Putar'}
          title={isPlaying ? 'Jeda' : 'Putar'}
        >
          {isLoading ? (
            <LoaderIcon width={19} height={19} />
          ) : isPlaying ? (
            <PauseIcon width={19} height={19} />
          ) : (
            <PlayIcon width={19} height={19} className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => next()}
          disabled={!hasNext}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white/65 transition hover:bg-white/8 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
          aria-label="Lagu berikutnya"
          title="Lagu berikutnya"
        >
          <NextIcon width={17} height={17} />
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <VolumeControl compact />
        <span className="mx-1 h-5 w-px bg-white/10" />
        <IconButton label="Cari lagu" onClick={requestSearchFocus}>
          <SearchIcon width={17} height={17} />
        </IconButton>
        <IconButton
          label={panel === 'library' ? 'Tutup daftar lagu' : 'Daftar lagu'}
          active={panel === 'library'}
          onClick={() => togglePanel('library')}
        >
          <ListIcon width={17} height={17} />
        </IconButton>
        <IconButton
          label="Pengaturan"
          active={panel === 'settings'}
          onClick={() => togglePanel('settings')}
        >
          <SettingsIcon width={17} height={17} />
        </IconButton>
      </div>
    </div>
  )
}
