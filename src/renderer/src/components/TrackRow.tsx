import type { JSX, KeyboardEvent, MouseEvent } from 'react'
import type { Track } from '@shared/types'
import { formatTime, sourceLabels } from '../lib/format'
import { Cover, Equalizer } from './Media'
import { ExternalIcon, PauseIcon, PlayIcon } from './Icons'

interface TrackRowProps {
  track: Track
  isCurrent: boolean
  isPlaying: boolean
  onSelect: () => void
}

export function TrackRow({ track, isCurrent, isPlaying, onSelect }: TrackRowProps): JSX.Element {
  const openSource = (event: MouseEvent): void => {
    event.stopPropagation()
    void window.api.openExternal(track.sourceUrl)
  }

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 text-left outline-none transition-colors ${
        isCurrent ? 'bg-white/[0.07]' : 'hover:bg-white/[0.055] focus-visible:bg-white/[0.055]'
      }`}
      aria-label={`Putar ${track.title} oleh ${track.artist}`}
    >
      <div className="relative h-11 w-11 shrink-0">
        <Cover src={track.coverUrl} alt="" className="h-full w-full rounded-xl" />
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 transition-opacity ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          {isCurrent && isPlaying ? (
            <Equalizer />
          ) : (
            <PlayIcon width={15} height={15} className="ml-0.5 text-white" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold text-white/90">
          {isCurrent && isPlaying ? <span className="text-accent-soft">{track.title}</span> : track.title}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[10.5px] text-white/45">
          <span className="truncate">{track.artist}</span>
          <span className="text-white/15">•</span>
          <span className="shrink-0 text-white/35">{sourceLabels[track.source]}</span>
        </div>
      </div>

      <span className="shrink-0 text-[10px] tabular-nums text-white/35">
        {formatTime(track.duration)}
      </span>

      <button
        type="button"
        onClick={openSource}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/25 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Buka halaman ${track.title} di ${sourceLabels[track.source]}`}
        title={`Buka di ${sourceLabels[track.source]}`}
        tabIndex={-1}
      >
        <ExternalIcon width={12} height={12} />
      </button>
    </div>
  )
}
