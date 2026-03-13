import React from 'react'
import { m, useTransform } from 'motion/react'
import { useSwipeAction } from '../../hooks/useSwipeAction'

interface SwipeActionRowProps {
  children: React.ReactNode
  onComplete?: () => void
  onDelete?: () => void
  enabled?: boolean
  className?: string
}

export default function SwipeActionRow({
  children,
  onComplete,
  onDelete,
  enabled = true,
  className,
}: SwipeActionRowProps) {
  const { bind, x, rightBgOpacity, leftBgOpacity, containerRef } = useSwipeAction({
    onComplete,
    onDelete,
    enabled,
  })

  // Icon scale transforms (0.5 at rest → 1.2 at threshold)
  const threshold = 0.4 * 375 // fallback; actual computed in hook
  const rightIconScale = useTransform(x, [0, threshold], [0.5, 1.2])
  const leftIconScale = useTransform(x, [-threshold, 0], [1.2, 0.5])

  const gestureProps = enabled ? bind() : {}

  return (
    <div
      ref={containerRef}
      {...gestureProps}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)',
        touchAction: 'pan-y',
      }}
    >
      {/* Right swipe background (green / complete) */}
      {onComplete && (
        <m.div
          style={{
            opacity: rightBgOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'rgb(22 163 74)', // green-600
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '1rem',
          }}
          aria-hidden
        >
          <m.span style={{ scale: rightIconScale, display: 'inline-flex' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </m.span>
        </m.div>
      )}

      {/* Left swipe background (red / delete) */}
      {onDelete && (
        <m.div
          style={{
            opacity: leftBgOpacity,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'rgb(220 38 38)', // red-600
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '1rem',
          }}
          aria-hidden
        >
          <m.span style={{ scale: leftIconScale, display: 'inline-flex' }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </m.span>
        </m.div>
      )}

      {/* Content layer — slides over backgrounds */}
      <m.div
        style={{
          x,
          backgroundColor: 'var(--color-surface-raised)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </m.div>
    </div>
  )
}
