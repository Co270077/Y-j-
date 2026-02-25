import { useNavigate } from 'react-router-dom'
import type { Task, DailyLog } from '../../db/types'
import { formatTimeDisplay, formatDuration, minutesSinceMidnight, getCurrentTime, getCurrentDay } from '../../utils/time'

interface TimelinePeekProps {
  tasks: Task[]
  dailyLogs: DailyLog[]
}

const CATEGORY_COLORS: Record<string, string> = {
  supplement: 'bg-cat-supplement',
  meal: 'bg-cat-meal',
  workout: 'bg-cat-workout',
  habit: 'bg-cat-habit',
  custom: 'bg-cat-custom',
}

export default function TimelinePeek({ tasks, dailyLogs }: TimelinePeekProps) {
  const navigate = useNavigate()
  const today = getCurrentDay()
  const currentMinutes = minutesSinceMidnight(getCurrentTime())

  const upcomingTasks = tasks
    .filter(t => t.days.includes(today))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .filter(t => {
      const taskEnd = minutesSinceMidnight(t.startTime) + t.durationMinutes
      return taskEnd > currentMinutes
    })
    .slice(0, 3)

  if (upcomingTasks.length === 0) return null

  return (
    <div className="px-5 mt-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Coming Up</p>
        <button
          onClick={() => navigate('/schedule')}
          className="text-[10px] text-bamboo font-medium cursor-pointer"
        >
          See all
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {upcomingTasks.map(task => {
          const log = dailyLogs.find(l => l.taskId === task.id)
          const isComplete = log?.isComplete || false
          const taskMinutes = minutesSinceMidnight(task.startTime)
          const isNow = taskMinutes <= currentMinutes && taskMinutes + task.durationMinutes > currentMinutes

          return (
            <button
              key={task.id}
              onClick={() => navigate('/schedule')}
              className={`
                flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] text-left cursor-pointer
                transition-all duration-150
                ${isComplete ? 'opacity-40' : 'hover:bg-surface-raised'}
              `}
            >
              {/* Color dot */}
              <div className={`w-2 h-2 min-w-[8px] rounded-full ${CATEGORY_COLORS[task.category] || 'bg-cat-custom'} ${isNow ? 'animate-pulse' : ''}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${isComplete ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                  {task.title}
                </p>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className="text-[10px] text-text-muted">{formatTimeDisplay(task.startTime)}</p>
                <p className="text-[9px] text-text-muted/60">{formatDuration(task.durationMinutes)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
