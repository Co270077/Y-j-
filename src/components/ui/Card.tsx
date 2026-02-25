interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: boolean
}

export default function Card({ children, className = '', onClick, padding = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface-raised border border-border-light card-shadow
        rounded-[var(--radius-lg)]
        ${padding ? 'p-4' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform duration-100' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
