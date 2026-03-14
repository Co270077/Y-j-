import { format } from 'date-fns'

interface HeaderProps {
  title?: string
  subtitle?: string
  rightAction?: React.ReactNode
}

export default function Header({ title, subtitle, rightAction }: HeaderProps) {
  const today = format(new Date(), 'EEEE, MMM d')

  return (
    <header className="sticky top-0 z-40 safe-area-top bg-black/90 glass-header border-b border-gray-800">
      <div className="flex items-center justify-between px-5 h-14 max-w-lg mx-auto">
        <div>
          <h1 className="text-base font-semibold text-text-primary leading-tight">
            {title || '養生'}
          </h1>
          <p className="text-xs text-text-muted">
            {subtitle || today}
          </p>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
