import { useRef, useState, type CSSProperties, type JSX } from 'react'
import { usePlayerStore } from '../store/player'
import { useIslandStore } from '../store/island'
import { formatTime } from '../lib/format'
import { MuteIcon, VolumeIcon } from './Icons'

export function ProgressBar(): JSX.Element | null {
  const current = usePlayerStore((state) => state.current)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const seek = usePlayerStore((state) => state.seek)
  const setSeeking = usePlayerStore((state) => state.setSeeking)
  const lock = useIslandStore((state) => state.lock)
  const unlock = useIslandStore((state) => state.unlock)

  const [dragValue, setDragValue] = useState<number | null>(null)
  const lockedRef = useRef(false)

  if (!current) return null

  const value = dragValue ?? currentTime
  const percent = duration > 0 ? Math.min(100, Math.max(0, (value / duration) * 100)) : 0

  const start = (): void => {
    if (!lockedRef.current) {
      lockedRef.current = true
      lock()
    }
    setSeeking(true)
  }

  const finish = (commitValue?: number): void => {
    if (commitValue !== undefined) seek(commitValue)
    setDragValue(null)
    setSeeking(false)
    if (lockedRef.current) {
      lockedRef.current = false
      unlock()
    }
  }

  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="w-9 text-right text-[10px] font-medium tabular-nums text-white/45">
        {formatTime(value)}
      </span>
      <input
        type="range"
        min={0}
        max={Math.max(duration, 0.1)}
        step={0.1}
        value={Math.min(value, Math.max(duration, 0.1))}
        className="island-slider flex-1"
        style={{ '--progress': `${percent}%` } as CSSProperties}
        onPointerDown={start}
        onChange={(event) => {
          if (lockedRef.current) setDragValue(Number(event.currentTarget.value))
          else seek(Number(event.currentTarget.value))
        }}
        onPointerUp={(event) => finish(Number(event.currentTarget.value))}
        onPointerCancel={() => finish(dragValue ?? currentTime)}
        onKeyDown={start}
        onKeyUp={(event) => finish(Number(event.currentTarget.value))}
        aria-label="Posisi lagu"
      />
      <span className="w-9 text-[10px] font-medium tabular-nums text-white/45">
        {formatTime(duration)}
      </span>
    </div>
  )
}

interface VolumeControlProps {
  compact?: boolean
}

export function VolumeControl({ compact = false }: VolumeControlProps): JSX.Element {
  const volume = usePlayerStore((state) => state.volume)
  const muted = usePlayerStore((state) => state.muted)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const setMuted = usePlayerStore((state) => state.setMuted)
  const lock = useIslandStore((state) => state.lock)
  const unlock = useIslandStore((state) => state.unlock)
  const lockedRef = useRef(false)

  const effective = muted ? 0 : volume
  const percent = Math.round(effective * 100)

  const start = (): void => {
    if (!lockedRef.current) {
      lockedRef.current = true
      lock()
    }
  }

  const finish = (): void => {
    if (lockedRef.current) {
      lockedRef.current = false
      unlock()
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setMuted(!muted)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/8 hover:text-white"
        aria-label={muted ? 'Bunyikan' : 'Matikan suara'}
        title={muted ? 'Bunyikan' : 'Matikan suara'}
        tabIndex={-1}
      >
        {muted || volume === 0 ? <MuteIcon width={17} height={17} /> : <VolumeIcon width={17} height={17} />}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effective}
        className={`island-slider volume-slider ${compact ? 'w-16' : 'w-20'}`}
        style={{ '--progress': `${percent}%` } as CSSProperties}
        onPointerDown={start}
        onPointerUp={finish}
        onPointerCancel={finish}
        onBlur={finish}
        onChange={(event) => setVolume(Number(event.currentTarget.value))}
        aria-label="Volume"
        title={`Volume ${percent}%`}
      />
    </div>
  )
}
