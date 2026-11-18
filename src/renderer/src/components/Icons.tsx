import type { JSX, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps): IconProps {
  return {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props
  }
}

export function PlayIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M8 5.4v13.2c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L9.8 4.4C9 3.9 8 4.5 8 5.4Z" />
    </svg>
  )
}

export function PauseIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <rect x="6.5" y="4.5" width="4" height="15" rx="1.4" />
      <rect x="13.5" y="4.5" width="4" height="15" rx="1.4" />
    </svg>
  )
}

export function PrevIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M7 5.5a1 1 0 0 1 2 0v5l8.4-5.2c.7-.4 1.6.1 1.6.9v11.6c0 .8-.9 1.3-1.6.9L9 13.5v5a1 1 0 0 1-2 0Z" />
    </svg>
  )
}

export function NextIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M17 5.5a1 1 0 0 0-2 0v5L6.6 5.2C5.9 4.8 5 5.3 5 6.1v11.6c0 .8.9 1.3 1.6.9L15 13.5v5a1 1 0 0 0 2 0Z" />
    </svg>
  )
}

export function SearchIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  )
}

export function ListIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M4 6h11M4 12h11M4 18h7" />
      <circle cx="18.5" cy="16.5" r="2.5" />
      <path d="M21 16.5V9.8l-4 1" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.2 14.4a1.6 1.6 0 0 0 .34 1.78l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.78-.34 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.78.34l-.06.06A2 2 0 1 1 4.2 17l.06-.06a1.6 1.6 0 0 0 .34-1.78 1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.34-1.78L4.2 7.3A2 2 0 1 1 7 4.46l.06.06a1.6 1.6 0 0 0 1.78.34H9a1.6 1.6 0 0 0 .97-1.47V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 .97 1.46 1.6 1.6 0 0 0 1.78-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.34 1.78V9a1.6 1.6 0 0 0 1.47.97H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.7 1.43Z" />
    </svg>
  )
}

export function VolumeIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="M15.4 9a4.2 4.2 0 0 1 0 6M18 6.6a7.8 7.8 0 0 1 0 10.8" />
    </svg>
  )
}

export function MuteIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="m16 10 5 5M21 10l-5 5" />
    </svg>
  )
}

export function ExternalIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  )
}

export function CloseIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function RefreshIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 5v6h-6" />
    </svg>
  )
}

export function LoaderIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)} className={`spin-slow ${props.className ?? ''}`}>
      <path d="M12 3a9 9 0 1 0 9 9" opacity="0.9" />
    </svg>
  )
}

export function MusicIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M9 18V6.4L19 4v11.6" />
      <circle cx="6.4" cy="18" r="2.6" />
      <circle cx="16.4" cy="15.6" r="2.6" />
    </svg>
  )
}

export function WifiOffIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18M8.5 8.5A11 11 0 0 1 21 9M2.8 9a16 16 0 0 1 3.2-1.7M5 13a11 11 0 0 1 4-1.7M8.5 17a5 5 0 0 1 7 0" />
      <circle cx="12" cy="20" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function EyeIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function EyeOffIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.4 4.1M6.2 6.2A17 17 0 0 0 2.5 12S6 18 12 18a9.9 9.9 0 0 0 4.2-.9" />
      <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
    </svg>
  )
}

export function CheckIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 4.5 4.5L19.5 6.5" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  )
}

export function HideIcon(props: IconProps): JSX.Element {
  return (
    <svg {...base(props)}>
      <path d="M4 4h16v16H4z" opacity="0.4" />
      <path d="M8 12h8" />
    </svg>
  )
}
