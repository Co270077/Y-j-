import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: boolean
}

export default function Card({ children, className = '', onClick, padding = true }: CardProps) {
  if (onClick) {
    return (
      <m.div
        onClick={onClick}
        whileTap={{ scale: 0.98, transition: snappy }}
        className={`
          bg-surface-raised border border-border-light card-shadow
          rounded-[var(--radius-lg)]
          ${padding ? 'p-4' : ''}
          cursor-pointer
          ${className}
        `}
      >
        {children}
      </m.div>
    )
  }

  return (
    <div
      className={`
        bg-surface-raised border border-border-light card-shadow
        rounded-[var(--radius-lg)]
        ${padding ? 'p-4' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
