import { useEffect } from 'react'
import * as m from 'motion/react-m'
import { useMotionValue, useSpring } from 'motion/react'
import { gentle } from '../../motion/transitions'

interface ProgressRingProps {
  progress: number    // 0 to 100
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}

export default function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  color = 'var(--color-bamboo)',
  bgColor = 'var(--color-charcoal-lighter)',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (Math.min(progress, 100) / 100) * circumference

  const offsetValue = useMotionValue(circumference) // start empty
  const springOffset = useSpring(offsetValue, gentle)

  useEffect(() => {
    offsetValue.set(targetOffset)
  }, [targetOffset, offsetValue])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: springOffset }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
