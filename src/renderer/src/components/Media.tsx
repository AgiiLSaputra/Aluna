import { useEffect, useRef, useState, type JSX } from 'react'
import { MusicIcon } from './Icons'

interface CoverProps {
  src: string
  alt: string
  className?: string
}

export function Cover({ src, alt, className = '' }: CoverProps): JSX.Element {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-white/12 via-white/5 to-accent/20 ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/45">
          <MusicIcon width={28} height={28} />
        </div>
      )}
    </div>
  )
}

export function Equalizer(): JSX.Element {
  return (
    <span className="flex h-3.5 items-end gap-[2px] text-accent-soft" aria-hidden="true">
      <span className="equalizer-bar h-full" style={{ animationDelay: '0ms' }} />
      <span className="equalizer-bar h-full" style={{ animationDelay: '180ms' }} />
      <span className="equalizer-bar h-full" style={{ animationDelay: '360ms' }} />
      <span className="equalizer-bar h-full" style={{ animationDelay: '90ms' }} />
    </span>
  )
}

interface MarqueeProps {
  text: string
  className?: string
}

export function Marquee({ text, className = '' }: MarqueeProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const element = containerRef.current
    const measureElement = measureRef.current
    if (!element || !measureElement) return undefined

    const measure = (): void => {
      const textWidth = measureElement.getBoundingClientRect().width
      setOverflowing(textWidth > element.clientWidth + 2)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    observer.observe(measureElement)
    return () => observer.disconnect()
  }, [text])

  return (
    <div
      ref={containerRef}
      className={`marquee relative ${overflowing ? 'is-overflowing' : ''} ${className}`}
    >
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute whitespace-nowrap"
      >
        {text}
      </span>
      <div className="marquee-track">
        <span className="shrink-0">{text}</span>
        {overflowing && (
          <span className="shrink-0" aria-hidden="true">
            {text}
          </span>
        )}
      </div>
    </div>
  )
}
