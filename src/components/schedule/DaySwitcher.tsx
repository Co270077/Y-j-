import type { DayOfWeek } from '../../db/types'
import { getCurrentDay, DAYS_ORDERED, DAY_LABELS } from '../../utils/time'

interface DaySwitcherProps {
  selectedDay: DayOfWeek
  onDayChange: (day: DayOfWeek) => void
}

export default function DaySwitcher({ selectedDay, onDayChange }: DaySwitcherProps) {
  const today = getCurrentDay()

  return (
    <div role="tablist" aria-label="Day of week" className="flex gap-1 px-5 py-3 overflow-x-auto no-scrollbar">
      {DAYS_ORDERED.map((day) => {
        const isSelected = day === selectedDay
        const isToday = day === today
        return (
          <button
            key={day}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onDayChange(day)}
            className={`
              flex-1 min-w-[42px] py-2 rounded-[var(--radius-md)] text-xs font-medium
              transition-all duration-150 cursor-pointer
              ${isSelected
                ? 'bg-bamboo text-warm-white shadow-sm'
                : isToday
                  ? 'bg-surface-raised text-bamboo border border-bamboo/30'
                  : 'bg-transparent text-text-muted hover:text-text-secondary'
              }
            `}
          >
            {DAY_LABELS[day]}
          </button>
        )
      })}
    </div>
  )
}
