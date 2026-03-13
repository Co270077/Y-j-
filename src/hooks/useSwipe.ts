import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

/**
 * @deprecated Use SwipeActionRow + useSwipeAction for item-level swipe gestures.
 * useSwipe was used for page-level day switching on SchedulePage — replaced by
 * DaySwitcher buttons to avoid conflicts with item swipe gestures.
 */

interface SwipeProps {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

const SWIPE_THRESHOLD = 50
const SWIPE_MAX_Y = 80

export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers): SwipeProps {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = Math.abs(e.changedTouches[0].clientY - touchStart.current.y)
    touchStart.current = null

    // Only trigger if horizontal swipe is dominant
    if (dy > SWIPE_MAX_Y) return
    if (Math.abs(dx) < SWIPE_THRESHOLD) return

    if (dx < 0) {
      onSwipeLeft?.()
    } else {
      onSwipeRight?.()
    }
  }, [onSwipeLeft, onSwipeRight])

  return { onTouchStart, onTouchEnd }
}
