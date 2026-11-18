import { AnimatePresence, motion } from 'motion/react'
import type { JSX } from 'react'
import { useIslandStore } from '../store/island'
import { usePlayerStore } from '../store/player'
import { PlayerBar } from './PlayerBar'
import { LibraryPanel } from './LibraryPanel'
import { SettingsPanel } from './SettingsPanel'
import logoUrl from '../assets/logo.png'

const spring = { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.9 }

export function Island(): JSX.Element {
  const phase = useIslandStore((state) => state.phase)
  const panel = useIslandStore((state) => state.panel)
  const pinned = useIslandStore((state) => state.pinned)
  const expand = useIslandStore((state) => state.expand)
  const setPointerInside = useIslandStore((state) => state.setPointerInside)
  const unpin = useIslandStore((state) => state.unpin)
  const isPlaying = usePlayerStore((state) => state.isPlaying)

  const expanded = phase === 'expanded'

  const onEnter = (): void => {
    setPointerInside(true)
    expand()
    if (pinned) unpin()
  }

  const onLeave = (): void => {
    setPointerInside(false)
  }

  return (
    <div className="absolute top-0 flex flex-col items-center">
      <motion.div
        data-island-surface
        className={`island-surface relative flex shrink-0 items-center justify-center overflow-hidden ${
          expanded ? 'pill' : ''
        }`}
        animate={{
          width: expanded ? 740 : 72,
          height: expanded ? 102 : 56,
          borderRadius: expanded ? 34 : 26
        }}
        initial={false}
        transition={spring}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div
              key="expanded"
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.18, delay: 0.07 } }}
              exit={{ opacity: 0, transition: { duration: 0.07 } }}
            >
              <PlayerBar />
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              type="button"
              onClick={expand}
              className="pill relative flex h-10 w-14 items-center justify-center rounded-[18px]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, delay: 0.05 } }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.06 } }}
              aria-label="Buka Dynamic Island Music"
              title="Dynamic Island Music"
            >
              <img
                src={logoUrl}
                alt=""
                className="h-auto w-12 max-h-[22px] object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
                draggable={false}
              />
              {isPlaying && (
                <span className="pulse-dot absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {expanded && panel !== 'none' && (
          <motion.div
            key="panel"
            data-island-surface
            className="island-surface glass mt-2.5 w-[740px] overflow-hidden rounded-[28px]"
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
          >
            {panel === 'library' ? <LibraryPanel /> : <SettingsPanel />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
