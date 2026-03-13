import { useRef, useState } from 'react'
import { useMotionValue, useTransform, animate, type MotionValue } from 'motion/react'
import { useDrag } from '@use-gesture/react'
import { hapticSuccess } from '../utils/haptics'

interface UseSwipeActionOptions {
  onComplete?: () => void
  onDelete?: () => void
  threshold?: number
  enabled?: boolean
}

interface UseSwipeActionReturn {
  bind: (...args: any[]) => any
  x: MotionValue<number>
  rightBgOpacity: MotionValue<number>
  leftBgOpacity: MotionValue<number>
  isSwiping: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function useSwipeAction({
  onComplete,
  onDelete,
  threshold: thresholdPct = 0.4,
  enabled = true,
}: UseSwipeActionOptions = {}): UseSwipeActionReturn {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const directionLocked = useRef<'left' | 'right' | null>(null)
  const hasTriggeredHaptic = useRef(false)
  const [isSwiping, setIsSwiping] = useState(false)

  const getThreshold = () =>
    (containerRef.current?.offsetWidth || 375) * thresholdPct

  const rightBgOpacity = useTransform(x, [0, getThreshold()], [0, 1])
  const leftBgOpacity = useTransform(x, [-getThreshold(), 0], [1, 0])

  const bind = useDrag(
    ({ active, movement: [mx, my], direction: [dx], cancel, last }) => {
      if (!enabled) return

      const threshold = getThreshold()
      const absMx = Math.abs(mx)
      const absMy = Math.abs(my)

      // Vertical scroll priority: cancel in first 10px if vertical dominates
      if (absMx < 10 && absMy > absMx) {
        cancel()
        return
      }

      // Lock direction after 10px horizontal movement
      if (absMx >= 10 && directionLocked.current === null) {
        directionLocked.current = dx > 0 ? 'right' : 'left'
      }

      if (active) {
        setIsSwiping(true)

        let clampedMx = mx

        // Prevent movement in direction without handler
        if (!onComplete && clampedMx > 0) clampedMx = 0
        if (!onDelete && clampedMx < 0) clampedMx = 0

        // Prevent opposite direction from locked
        if (directionLocked.current === 'right' && clampedMx < 0) clampedMx = 0
        if (directionLocked.current === 'left' && clampedMx > 0) clampedMx = 0

        // Apply rubber-band resistance past threshold
        if (Math.abs(clampedMx) > threshold) {
          const sign = clampedMx > 0 ? 1 : -1
          clampedMx = sign * (threshold + (Math.abs(clampedMx) - threshold) * 0.3)
        }

        // Haptic at threshold crossing (once per gesture)
        if (Math.abs(clampedMx) >= threshold && !hasTriggeredHaptic.current) {
          hasTriggeredHaptic.current = true
          hapticSuccess()
        }

        x.set(clampedMx)
      }

      if (last || !active) {
        setIsSwiping(false)
        const currentX = x.get()
        const absX = Math.abs(currentX)

        if (absX >= threshold) {
          if (currentX > 0 && onComplete) {
            onComplete()
            animate(x, window.innerWidth, { type: 'spring', stiffness: 400, damping: 28 })
          } else if (currentX < 0 && onDelete) {
            onDelete()
            animate(x, -window.innerWidth, { type: 'spring', stiffness: 400, damping: 28 })
          } else {
            animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
          }
        } else {
          animate(x, 0, { type: 'spring', stiffness: 400, damping: 28 })
        }

        directionLocked.current = null
        hasTriggeredHaptic.current = false
      }
    },
    {
      axis: 'lock',
      filterTaps: true,
      pointer: { capture: false },
    }
  )

  return { bind, x, rightBgOpacity, leftBgOpacity, isSwiping, containerRef }
}
