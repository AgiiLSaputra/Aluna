import { AnimatePresence, motion } from 'motion/react'
import type { JSX } from 'react'
import { useIslandStore } from '../store/island'
import { CheckIcon, CloseIcon, WifiOffIcon } from './Icons'

export function Toast(): JSX.Element {
  const toast = useIslandStore((state) => state.toast)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`flex max-w-[520px] items-center gap-2.5 rounded-full border px-4 py-2.5 text-[11px] shadow-2xl backdrop-blur-xl ${
              toast.kind === 'error'
                ? 'border-red-400/25 bg-red-950/85 text-red-100/90'
                : toast.kind === 'success'
                  ? 'border-emerald-400/25 bg-emerald-950/85 text-emerald-100/90'
                  : 'border-white/12 bg-black/85 text-white/75'
            }`}
            role="status"
          >
            {toast.kind === 'error' ? (
              <WifiOffIcon width={14} height={14} className="shrink-0" />
            ) : toast.kind === 'success' ? (
              <CheckIcon width={14} height={14} className="shrink-0" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
            )}
            <span className="leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => useIslandStore.getState().dismissToast(toast.id)}
              className="pointer-events-auto ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
              aria-label="Tutup notifikasi"
            >
              <CloseIcon width={11} height={11} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
