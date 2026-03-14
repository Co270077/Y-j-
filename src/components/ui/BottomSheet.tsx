import { useEffect, useRef, useId, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const dismissingRef = useRef(false)

  const [vh, setVh] = useState(() => typeof window !== 'undefined' ? window.innerHeight || 600 : 600)

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Detent positions (y from top of screen)
  const DETENTS = {
    peek: vh * 0.65,
    half: vh * 0.45,
    full: vh * 0.08,
  }

  const startY = DETENTS[detent]
  const y = useMotionValue(vh)
  const backdropOpacity = useTransform(y, [DETENTS.full, vh], [0.5, 0])

  // Snap to nearest detent (supports swiping up to full)
  const snapToNearest = useCallback((currentY: number) => {
    const detentValues = [DETENTS.full, DETENTS.half, DETENTS.peek]
    let closest = startY
    let minDist = Infinity
    for (const d of detentValues) {
      const dist = Math.abs(currentY - d)
      if (dist < minDist) {
        minDist = dist
        closest = d
      }
    }
    animate(y, closest, { type: 'spring', ...snappy })
  }, [DETENTS.full, DETENTS.half, DETENTS.peek, startY, y])

  // Animate in when opened
  useEffect(() => {
    if (isOpen) {
      dismissingRef.current = false
      y.set(vh)
      animate(y, startY, { type: 'spring', ...gentle })
    }
  }, [isOpen, startY, vh, y])

  // Scroll lock
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
      if (e.key === 'Escape') handleDismiss()
      if (e.key === 'Tab' && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Auto-focus
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return
    const focusTarget =
      sheetRef.current.querySelector<HTMLElement>('input, select, textarea') ||
      sheetRef.current.querySelector<HTMLElement>('button')
    focusTarget?.focus()
  }, [isOpen])

  const handleDismiss = useCallback(() => {
    if (dismissingRef.current) return
    dismissingRef.current = true
    animate(y, vh, { type: 'spring', ...snappy }).then(() => {
      onClose()
      dismissingRef.current = false
    })
  }, [y, vh, onClose])

  const bind = useDrag(
    ({ active, movement: [, my], velocity: [, vy], direction: [, dy], last, memo }) => {
      // Capture starting y position on drag start
      if (memo === undefined) memo = y.get()
      const currentY = memo + my

      // Only allow drag-down if content is scrolled
      if (contentRef.current && contentRef.current.scrollTop > 0 && my > 0) return memo

      if (active) {
        // Clamp: can't go above full detent, rubber-band below start
        const clamped = Math.max(DETENTS.full, currentY)
        y.set(clamped)
      } else if (last) {
        // Dismiss if dragged far enough down or fast flick down
        if (dy > 0 && (my > vh * 0.2 || vy > 0.5)) {
          handleDismiss()
        } else {
          // Snap to nearest detent
          snapToNearest(y.get())
        }
      }

      return memo
    },
    { axis: 'y', filterTaps: true }
  )

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <m.div
            data-testid="sheet-backdrop"
            className="fixed inset-0 z-[100] bg-black"
            style={{ opacity: backdropOpacity, pointerEvents: isOpen ? 'auto' : 'none' }}
            initial={{ opacity: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            ref={overlayRef}
            onClick={(e) => {
              if (e.target === overlayRef.current) handleDismiss()
            }}
          />

          {/* Sheet panel — positioned via y MotionValue, NOT AnimatePresence */}
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid="sheet-panel"
            className="fixed inset-x-0 bottom-0 z-[101] flex justify-center"
            style={{ top: 0, pointerEvents: isOpen ? 'auto' : 'none' }}
          >
            <m.div
              style={{ y }}
              className="w-full max-w-lg flex flex-col"
            >
              <div className="bg-charcoal border-t border-border rounded-t-[var(--radius-xl)] max-h-[92vh] flex flex-col">
                {/* Drag handle area — covers handle bar + header */}
                <div
                  {...bind()}
                  className="cursor-grab active:cursor-grabbing select-none"
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
                  {/* Extended drag zone into content */}
                  <div className="h-3" />
                </div>

                {/* Content */}
                <div className="relative flex-1 overflow-hidden -mt-3">
                  <div
                    {...bind()}
                    className="absolute inset-x-0 top-0 h-8 z-10 cursor-grab active:cursor-grabbing"
                    style={{ touchAction: 'none' }}
                  />
                  <div ref={contentRef} className="h-full overflow-y-auto px-5 pt-1" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
                    {children}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(sheet, document.body)
}
