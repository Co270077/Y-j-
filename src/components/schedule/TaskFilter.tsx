import type { TaskCategory } from '../../db/types'

interface TaskFilterProps {
  activeFilter: TaskCategory | 'all'
  onFilterChange: (filter: TaskCategory | 'all') => void
  taskCounts: Record<string, number>
}

const FILTERS: { value: TaskCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'supplement', label: 'Supps' },
  { value: 'meal', label: 'Meals' },
  { value: 'workout', label: 'Workout' },
  { value: 'habit', label: 'Habits' },
  { value: 'custom', label: 'Custom' },
]

export default function TaskFilter({ activeFilter, onFilterChange, taskCounts }: TaskFilterProps) {
  return (
    <div className="flex gap-1.5 px-5 pb-2 overflow-x-auto">
      {FILTERS.map(f => {
        const count = f.value === 'all'
          ? Object.values(taskCounts).reduce((a, b) => a + b, 0)
          : (taskCounts[f.value] || 0)

        if (f.value !== 'all' && count === 0) return null

        return (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`
              px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap
              transition-all duration-150 cursor-pointer
              ${activeFilter === f.value
                ? 'bg-bamboo/20 text-bamboo'
                : 'bg-transparent text-text-muted hover:text-text-secondary'
              }
            `}
          >
            {f.label}
            {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
