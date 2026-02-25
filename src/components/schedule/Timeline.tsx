import { useRef, useEffect } from 'react'
import type { Task, DayOfWeek, DailyLog } from '../../db/types'
import { minutesSinceMidnight, getCurrentTime } from '../../utils/time'
import TaskBlock from './TaskBlock'

interface TimelineProps {
  tasks: Task[]
  day: DayOfWeek
  dailyLogs: DailyLog[]
  onToggleComplete: (taskId: number) => void
  onToggleSubtask: (taskId: number, subtaskId: string) => void
  onEditTask: (task: Task) => void
  onDuplicateTask?: (task: Task) => void
}

export default function Timeline({
  tasks,
  day,
  dailyLogs,
  onToggleComplete,
  onToggleSubtask,
  onEditTask,
  onDuplicateTask,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentTimeRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (currentTimeRef.current) {
      currentTimeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [day])

  const currentMinutes = minutesSinceMidnight(getCurrentTime())

  // Find the next incomplete task
  const sortedTasks = tasks
    .filter(t => t.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5">
        <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-sm text-text-muted text-center">No tasks for this day</p>
        <p className="text-xs text-text-muted/60 text-center mt-1">Tap + to add your first task</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="px-5 py-3 flex flex-col gap-2.5">
      {sortedTasks.map((task) => {
        const taskMinutes = minutesSinceMidnight(task.startTime)
        const isCurrentTask = taskMinutes <= currentMinutes &&
          taskMinutes + task.durationMinutes > currentMinutes
        const log = dailyLogs.find(l => l.taskId === task.id)

        return (
          <div key={task.id} ref={isCurrentTask ? currentTimeRef : undefined}>
            {/* Current time indicator */}
            {isCurrentTask && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-bamboo animate-pulse" />
                <div className="flex-1 h-px bg-bamboo/40" />
                <span className="text-[10px] text-bamboo font-medium">NOW</span>
              </div>
            )}
            <TaskBlock
              task={task}
              log={log}
              onToggleComplete={() => task.id && onToggleComplete(task.id)}
              onToggleSubtask={(subtaskId) => task.id && onToggleSubtask(task.id, subtaskId)}
              onEdit={() => onEditTask(task)}
              onDuplicate={onDuplicateTask ? () => onDuplicateTask(task) : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}
