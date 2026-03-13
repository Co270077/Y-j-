import type { Transition } from 'motion/react'

/** For interactions and taps — critically damped, fast */
export const snappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
  mass: 1,
}

/** For page transitions — critically damped, smooth */
export const gentle: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
  mass: 1,
}

/** For micro-feedback — overdamped, near-instant */
export const instant: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 40,
  mass: 0.8,
}
