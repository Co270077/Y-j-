import { useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import * as m from 'motion/react-m'
import type { Task, DayOfWeek, DailyLog } from '../../db/types'
import { minutesSinceMidnight, getCurrentTime } from '../../utils/time'
import TaskBlock from './TaskBlock'
import { slideUp } from '../../motion/variants'

const listStagger = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
}

interface TimelineProps {
  tasks: Task[]
  day: DayOfWeek
  dailyLogs: DailyLog[]
  onToggleComplete: (taskId: number) => void
  onToggleSubtask: (taskId: number, subtaskId: string) => void
  onEditTask: (task: Task) => void
  onDuplicateTask?: (task: Task) => void
  onDeleteTask?: (taskId: number) => void
}

export default function Timeline({
  tasks,
  day,
  dailyLogs,
  onToggleComplete,
  onToggleSubtask,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTargetRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Auto-scroll to current/next time block on route navigation or day change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80) // 80ms delay so route transition settles before scroll
    return () => clearTimeout(timer)
  }, [location.pathname, day])

  const currentMinutes = minutesSinceMidnight(getCurrentTime())

  const sortedTasks = tasks
    .filter(t => t.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Determine scroll target: current task > next upcoming > last task (late night)
  const scrollTargetTask = sortedTasks.find(task => {
    const start = minutesSinceMidnight(task.startTime)
    const end = start + task.durationMinutes
    return start <= currentMinutes && end > currentMinutes
  }) ?? sortedTasks.find(task => {
    return minutesSinceMidnight(task.startTime) > currentMinutes
  }) ?? sortedTasks[sortedTasks.length - 1]

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
    <m.div ref={scrollRef} className="px-5 py-3 flex flex-col gap-2.5" variants={listStagger} initial="initial" animate="animate">
      {sortedTasks.map((task, index) => {
        const taskMinutes = minutesSinceMidnight(task.startTime)
        const isCurrentTask = taskMinutes <= currentMinutes &&
          taskMinutes + task.durationMinutes > currentMinutes
        const log = dailyLogs.find(l => l.taskId === task.id)
        const isScrollTarget = task === scrollTargetTask
        const shouldAnimate = index < 10

        const inner = (
          <>
            {/* Current time indicator */}
            {isCurrentTask && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-sm bg-white animate-pulse" />
                <div className="flex-1 h-px bg-white/40" />
                <span className="text-[10px] text-white font-medium">NOW</span>
              </div>
            )}
            <TaskBlock
              task={task}
              log={log}
              onToggleComplete={() => task.id && onToggleComplete(task.id)}
              onToggleSubtask={(subtaskId) => task.id && onToggleSubtask(task.id, subtaskId)}
              onEdit={() => onEditTask(task)}
              onDuplicate={onDuplicateTask ? () => onDuplicateTask(task) : undefined}
              onDelete={onDeleteTask && task.id ? () => onDeleteTask(task.id!) : undefined}
            />
          </>
        )

        if (shouldAnimate) {
          return (
            <m.div
              key={task.id}
              ref={isScrollTarget ? scrollTargetRef : undefined}
              className={isScrollTarget ? 'border-l-[3px] border-white pl-2 -ml-2 rounded-sm' : ''}
              variants={slideUp}
            >
              {inner}
            </m.div>
          )
        }

        return (
          <div
            key={task.id}
            ref={isScrollTarget ? scrollTargetRef : undefined}
            className={isScrollTarget ? 'border-l-[3px] border-white pl-2 -ml-2 rounded-sm' : ''}
          >
            {inner}
          </div>
        )
      })}
    </m.div>
  )
}
