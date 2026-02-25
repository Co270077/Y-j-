import Card from '../ui/Card'
import type { Task, DailyLog } from '../../db/types'
import { formatTimeDisplay, formatDuration, minutesSinceMidnight, getCurrentTime } from '../../utils/time'
import { hapticSuccess } from '../../utils/haptics'

interface UpNextCardProps {
  tasks: Task[]
  dailyLogs: DailyLog[]
  onNavigateToSchedule: () => void
  onCompleteTask?: (taskId: number) => void
}

export default function UpNextCard({ tasks, dailyLogs, onNavigateToSchedule, onCompleteTask }: UpNextCardProps) {
  const currentMinutes = minutesSinceMidnight(getCurrentTime())

  // Find the next incomplete task
  const nextTask = tasks
    .filter(t => {
      const log = dailyLogs.find(l => l.taskId === t.id)
      return !log?.isComplete
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .find(t => minutesSinceMidnight(t.startTime) >= currentMinutes - t.durationMinutes)

  if (!nextTask) {
    return (
      <Card className="col-span-2" onClick={onNavigateToSchedule}>
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Up Next</p>
        <p className="text-sm text-bamboo font-medium">All tasks complete for today</p>
      </Card>
    )
  }

  const taskMinutes = minutesSinceMidnight(nextTask.startTime)
  const minutesUntil = taskMinutes - currentMinutes
  const isNow = minutesUntil <= 0 && minutesUntil > -nextTask.durationMinutes

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (nextTask.id && onCompleteTask) {
      hapticSuccess()
      onCompleteTask(nextTask.id)
    }
  }

  return (
    <Card className="col-span-2" onClick={onNavigateToSchedule}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Up Next</p>
          <h3 className="text-sm font-semibold text-text-primary truncate">{nextTask.title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {formatTimeDisplay(nextTask.startTime)} · {formatDuration(nextTask.durationMinutes)}
            {nextTask.subtasks.length > 0 && (
              <span className="text-text-muted"> · {nextTask.subtasks.length} subtask{nextTask.subtasks.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
            isNow ? 'bg-bamboo/20 text-bamboo' : 'bg-surface-overlay text-text-muted'
          }`}>
            {isNow ? 'NOW' : minutesUntil > 0 ? `in ${formatDuration(minutesUntil)}` : 'Overdue'}
          </div>
          {onCompleteTask && (
            <button
              onClick={handleComplete}
              className="w-7 h-7 rounded-full border-2 border-stone/60 hover:border-bamboo/60 flex items-center justify-center transition-all cursor-pointer active:scale-90"
              aria-label="Complete task"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-stone/60">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
