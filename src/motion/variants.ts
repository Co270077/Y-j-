import type { Variants } from 'motion/react'
import { gentle, snappy } from './transitions'

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: gentle },
  exit: { opacity: 0, transition: snappy },
}

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: gentle },
  exit: { opacity: 0, y: 10, transition: snappy },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: gentle },
  exit: { opacity: 0, y: -10, transition: snappy },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: snappy },
  exit: { opacity: 0, scale: 0.95, transition: snappy },
}

export const tap: Variants = {
  whileTap: { scale: 0.97, transition: snappy },
}

export const completePulse: Variants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.05, 1], transition: snappy },
}
