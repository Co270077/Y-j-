import Card from '../ui/Card'
import type { EatingWindow } from '../../db/types'
import { formatTimeDisplay, minutesSinceMidnight, getCurrentTime } from '../../utils/time'

interface MealCardProps {
  eatingWindow: EatingWindow | null
  onNavigateToMeals: () => void
}

export default function MealCard({ eatingWindow, onNavigateToMeals }: MealCardProps) {
  if (!eatingWindow) {
    return (
      <Card onClick={onNavigateToMeals}>
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Eating Window</p>
        <p className="text-xs text-text-muted">Not configured</p>
        <p className="text-[10px] text-bamboo mt-1">Tap to set up</p>
      </Card>
    )
  }

  const currentMinutes = minutesSinceMidnight(getCurrentTime())
  const windowStart = minutesSinceMidnight(eatingWindow.windowStart)
  const windowEnd = minutesSinceMidnight(eatingWindow.windowEnd)
  const isOpen = currentMinutes >= windowStart && currentMinutes < windowEnd
  const windowDuration = windowEnd - windowStart
  const fastingHours = Math.round((1440 - windowDuration) / 60)

  // Progress through eating window (0-100)
  let windowProgress = 0
  if (isOpen && windowDuration > 0) {
    windowProgress = Math.round(((currentMinutes - windowStart) / windowDuration) * 100)
  }

  // Time until window opens/closes
  let timeUntil = ''
  if (!isOpen && currentMinutes < windowStart) {
    const mins = windowStart - currentMinutes
    const h = Math.floor(mins / 60)
    const m = mins % 60
    timeUntil = h > 0 ? `Opens in ${h}h ${m}m` : `Opens in ${m}m`
  } else if (isOpen) {
    const mins = windowEnd - currentMinutes
    const h = Math.floor(mins / 60)
    const m = mins % 60
    timeUntil = h > 0 ? `Closes in ${h}h ${m}m` : `Closes in ${m}m`
  }

  return (
    <Card onClick={onNavigateToMeals}>
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Eating Window</p>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-bamboo animate-pulse' : 'bg-stone-dark'}`} />
        <span className={`text-xs font-medium ${isOpen ? 'text-bamboo' : 'text-text-muted'}`}>
          {isOpen ? 'Open' : 'Fasting'}
        </span>
        <span className="text-[9px] text-text-muted/60 ml-auto">{eatingWindow.protocol}</span>
      </div>

      {/* Progress bar */}
      {isOpen && (
        <div className="h-1 rounded-full bg-charcoal overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full bg-bamboo transition-all duration-500"
            style={{ width: `${windowProgress}%` }}
          />
        </div>
      )}

      <p className="text-[10px] text-text-muted">
        {formatTimeDisplay(eatingWindow.windowStart)} – {formatTimeDisplay(eatingWindow.windowEnd)}
      </p>
      {timeUntil && (
        <p className="text-[10px] text-text-secondary mt-0.5">{timeUntil}</p>
      )}
      <p className="text-[9px] text-text-muted/50 mt-0.5">{fastingHours}h fast</p>
    </Card>
  )
}
