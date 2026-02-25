import type { Task, DailyLog } from '../../db/types'
import { formatTimeDisplay, formatDuration, getEndTimeDisplay, minutesSinceMidnight, getCurrentTime } from '../../utils/time'
import { hapticSuccess, hapticLight } from '../../utils/haptics'

const CATEGORY_COLORS: Record<string, string> = {
  supplement: 'bg-cat-supplement',
  meal: 'bg-cat-meal',
  workout: 'bg-cat-workout',
  habit: 'bg-cat-habit',
  custom: 'bg-cat-custom',
}

const CATEGORY_TEXT: Record<string, string> = {
  supplement: 'text-cat-supplement',
  meal: 'text-cat-meal',
  workout: 'text-cat-workout',
  habit: 'text-cat-habit',
  custom: 'text-cat-custom',
}

interface UpNextCardProps {
  tasks: Task[]
  dailyLogs: DailyLog[]
  onNavigateToSchedule: () => void
  onCompleteTask?: (taskId: number) => void
  onToggleSubtask?: (taskId: number, subtaskId: string) => void
}

export default function UpNextCard({ tasks, dailyLogs, onNavigateToSchedule, onCompleteTask, onToggleSubtask }: UpNextCardProps) {
  const currentMinutes = minutesSinceMidnight(getCurrentTime())

  // Get all incomplete tasks sorted by time
  const incompleteTasks = tasks
    .filter(t => {
      const log = dailyLogs.find(l => l.taskId === t.id)
      return !log?.isComplete
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Current/next task: first incomplete that hasn't fully ended
  const currentTask = incompleteTasks
    .find(t => minutesSinceMidnight(t.startTime) >= currentMinutes - t.durationMinutes)

  // The task after the current one
  const nextTask = currentTask
    ? incompleteTasks.find(t => t.id !== currentTask.id && t.startTime >= currentTask.startTime)
    : null

  // All done state
  if (!currentTask) {
    const total = tasks.length
    const completed = tasks.filter(t => dailyLogs.find(l => l.taskId === t.id)?.isComplete).length
    return (
      <div className="px-5 mb-2">
        <div
          onClick={onNavigateToSchedule}
          className="p-5 rounded-[var(--radius-lg)] bg-surface-raised border border-border-light card-shadow cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bamboo/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bamboo">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-bamboo">All tasks complete</p>
              <p className="text-xs text-text-muted">{completed}/{total} done for today</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const taskMinutes = minutesSinceMidnight(currentTask.startTime)
  const taskEndMinutes = taskMinutes + currentTask.durationMinutes
  const minutesUntil = taskMinutes - currentMinutes
  const isNow = minutesUntil <= 0 && currentMinutes < taskEndMinutes
  const isOverdue = currentMinutes >= taskEndMinutes

  // Time progress within the task (0-100)
  const timeProgress = isNow
    ? Math.min(100, Math.round(((currentMinutes - taskMinutes) / currentTask.durationMinutes) * 100))
    : isOverdue ? 100 : 0

  // Subtask completion state
  const log = dailyLogs.find(l => l.taskId === currentTask.id)
  const subtaskCompletions = log?.subtaskCompletions || {}
  const completedSubtasks = currentTask.subtasks.filter(st => subtaskCompletions[st.id]).length
  const totalSubtasks = currentTask.subtasks.length

  const handleComplete = () => {
    if (currentTask.id && onCompleteTask) {
      hapticSuccess()
      onCompleteTask(currentTask.id)
    }
  }

  const handleSubtaskToggle = (subtaskId: string) => {
    if (currentTask.id && onToggleSubtask) {
      hapticLight()
      onToggleSubtask(currentTask.id, subtaskId)
    }
  }

  return (
    <div className="px-5 mb-2">
      <div className="rounded-[var(--radius-lg)] bg-surface-raised border border-border-light card-shadow overflow-hidden">
        {/* Time progress bar */}
        {isNow && (
          <div className="h-0.5 bg-charcoal">
            <div
              className={`h-full ${CATEGORY_COLORS[currentTask.category]} transition-all duration-1000 ease-linear`}
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        )}

        <div className="p-4">
          {/* Status + Category */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[currentTask.category]} ${isNow ? 'animate-pulse' : ''}`} />
              <span className={`text-[10px] font-medium uppercase tracking-wider ${CATEGORY_TEXT[currentTask.category]}`}>
                {currentTask.category}
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
              isNow
                ? 'bg-bamboo/20 text-bamboo'
                : isOverdue
                  ? 'bg-danger/15 text-danger'
                  : 'bg-surface-overlay text-text-muted'
            }`}>
              {isNow ? 'NOW' : isOverdue ? 'OVERDUE' : `in ${formatDuration(minutesUntil)}`}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-text-primary mb-1">{currentTask.title}</h2>

          {/* Time range */}
          <p className="text-xs text-text-secondary mb-1">
            {formatTimeDisplay(currentTask.startTime)} – {getEndTimeDisplay(currentTask.startTime, currentTask.durationMinutes)}
            <span className="text-text-muted"> · {formatDuration(currentTask.durationMinutes)}</span>
          </p>

          {/* Description */}
          {currentTask.description && (
            <p className="text-xs text-text-muted mt-1 mb-1">{currentTask.description}</p>
          )}

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="mt-3 pt-3 border-t border-border-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Subtasks</span>
                <span className="text-[10px] text-text-muted">{completedSubtasks}/{totalSubtasks}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {currentTask.subtasks.map(st => {
                  const done = !!subtaskCompletions[st.id]
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleSubtaskToggle(st.id)}
                      className="flex items-center gap-2.5 py-1 text-left cursor-pointer group"
                    >
                      <div className={`w-4.5 h-4.5 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                        done
                          ? `${CATEGORY_COLORS[currentTask.category]} border-transparent`
                          : 'border-stone/50 group-hover:border-stone/80'
                      }`}>
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-warm-white">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                        {st.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Complete button */}
          <button
            onClick={handleComplete}
            className="mt-4 w-full py-2.5 rounded-[var(--radius-md)] bg-bamboo text-warm-white text-sm font-semibold hover:bg-bamboo-dark active:scale-[0.98] transition-all cursor-pointer"
          >
            Mark Complete
          </button>
        </div>

        {/* Next up preview */}
        {nextTask && (
          <button
            onClick={onNavigateToSchedule}
            className="w-full px-4 py-2.5 border-t border-border-light bg-charcoal/30 flex items-center gap-3 cursor-pointer hover:bg-charcoal/50 transition-colors"
          >
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider shrink-0">Next</span>
            <div className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[nextTask.category]} shrink-0`} />
            <span className="text-xs text-text-secondary truncate flex-1 text-left">{nextTask.title}</span>
            <span className="text-[10px] text-text-muted shrink-0">{formatTimeDisplay(nextTask.startTime)}</span>
          </button>
        )}
      </div>
    </div>
  )
}
