import { useMotionValue, useSpring, useMotionValueEvent } from 'motion/react'
import { useState, useEffect } from 'react'
import { gentle } from '../motion/transitions'

export function useCountUp(target: number): number {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, gentle)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    motionValue.set(target)
  }, [target, motionValue])

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplay(Math.round(latest))
  })

  return display
}
