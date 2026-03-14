import { useEffect, useRef, useId, useState } from 'react'
import * as m from 'motion/react-m'
import { AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react'
import { useDrag } from '@use-gesture/react'
import { snappy, gentle } from '../../motion/transitions'
import { lockScroll, unlockScroll } from '../../utils/scrollLock'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  detent?: 'peek' | 'half' | 'full'
}

export default function BottomSheet({ isOpen, onClose, title, children, detent = 'half' }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const [vh, setVh] = useState(() => typeof window !== 'undefined' ? window.innerHeight || 600 : 600)

  // Update vh on resize (keyboard open, orientation change)
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const DETENTS = {
    peek: vh * 0.6,
    half: vh * 0.5,
    full: vh * 0.1,
  }

  const currentDetentY = DETENTS[detent]
  const y = useMotionValue(vh)
  const backdropOpacity = useTransform(y, [DETENTS.full, vh], [0.5, 0])

  // Open / close animation
  useEffect(() => {
    if (isOpen) {
      animate(y, currentDetentY, { type: 'spring', ...gentle })
    } else {
      animate(y, vh, { type: 'spring', ...snappy })
    }
  }, [isOpen, currentDetentY, vh, y])

  // Body scroll lock (ref-counted to support stacked modals)
  useEffect(() => {
    if (isOpen) {
      lockScroll()
      return () => unlockScroll()
    }
  }, [isOpen])

  // Escape key + focus trap
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Auto-focus
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const focusTarget =
      dialogRef.current.querySelector<HTMLElement>('input, select, textarea') ||
      dialogRef.current.querySelector<HTMLElement>('button')
    focusTarget?.focus()
  }, [isOpen])

  const handleDismiss = () => {
    animate(y, vh, { type: 'spring', ...snappy }).then(onClose)
  }

  const bind = useDrag(
    ({ active, movement: [, my], velocity: [, vy], last }) => {
      // Only drag if content is scrolled to top
      if (contentRef.current && contentRef.current.scrollTop > 0 && my > 0) return

      if (active) {
        y.set(Math.max(DETENTS.full, currentDetentY + my))
      } else if (last) {
        if (my > vh * 0.3 || vy > 0.5) {
          handleDismiss()
        } else {
          animate(y, currentDetentY, { type: 'spring', ...snappy })
        }
      }
    },
    { axis: 'y', filterTaps: true }
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            data-testid="sheet-backdrop"
            className="fixed inset-0 z-[100] bg-black backdrop-blur-sm"
            style={{ opacity: backdropOpacity }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            ref={overlayRef}
            onClick={(e) => {
              if (e.target === overlayRef.current) handleDismiss()
            }}
          />
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid="sheet-panel"
            style={{ y }}
            className="fixed top-0 left-0 right-0 z-[101] flex justify-center overflow-hidden"
            exit={{ y: vh, transition: { ...snappy } }}
          >
            <div className="w-full max-w-lg bg-charcoal border-t border-border rounded-t-[var(--radius-xl)] max-h-[90vh] flex flex-col">
              {/* Handle bar + Header — entire area is drag target */}
              <div
                {...bind()}
                className="cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'none' }}
              >
                <div className="flex justify-center pt-3 pb-3">
                  <div className="w-10 h-1 rounded-full bg-surface-overlay" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3">
                  <h2 id={titleId} className="text-lg font-semibold text-text-primary">{title}</h2>
                  <button
                    onClick={handleDismiss}
                    aria-label="Close"
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content with overlapping drag zone */}
              <div className="relative flex-1 overflow-hidden">
                {/* Invisible drag extension — overlaps top of content area */}
                <div
                  {...bind()}
                  className="absolute inset-x-0 top-0 h-10 z-10 cursor-grab active:cursor-grabbing"
                  style={{ touchAction: 'none' }}
                />
                <div ref={contentRef} className="h-full overflow-y-auto px-5 pt-2" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
                  {children}
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
