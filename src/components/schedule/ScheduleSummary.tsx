import type { Task, DayOfWeek } from '../../db/types'
import { formatDuration } from '../../utils/time'

interface ScheduleSummaryProps {
  tasks: Task[]
  day: DayOfWeek
}

const CATEGORY_ORDER = ['supplement', 'meal', 'workout', 'habit', 'custom']

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  supplement: { bg: 'bg-cat-supplement/10', text: 'text-cat-supplement' },
  meal: { bg: 'bg-cat-meal/10', text: 'text-cat-meal' },
  workout: { bg: 'bg-cat-workout/10', text: 'text-cat-workout' },
  habit: { bg: 'bg-cat-habit/10', text: 'text-cat-habit' },
  custom: { bg: 'bg-cat-custom/10', text: 'text-cat-custom' },
}

export default function ScheduleSummary({ tasks, day }: ScheduleSummaryProps) {
  const dayTasks = tasks
    .filter(t => t.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (dayTasks.length === 0) return null

  // Calculate total scheduled time
  const totalMinutes = dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0)

  // Category breakdown
  const categories = CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      count: dayTasks.filter(t => t.category === cat).length,
    }))
    .filter(c => c.count > 0)

  return (
    <div className="px-5 pb-2">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {/* Total time */}
        <span className="text-[10px] text-text-muted whitespace-nowrap">
          {formatDuration(totalMinutes)} scheduled
        </span>
        <div className="w-px h-3 bg-border" />
        {/* Category chips */}
        {categories.map(({ category, count }) => {
          const style = CATEGORY_STYLES[category]
          return (
            <span
              key={category}
              className={`text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap ${style.bg} ${style.text}`}
            >
              {count} {category}
            </span>
          )
        })}
      </div>
    </div>
  )
}
