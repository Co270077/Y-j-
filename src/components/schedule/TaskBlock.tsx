import { useState } from 'react'
import type { Task, DailyLog } from '../../db/types'
import { formatTimeDisplay, formatDuration, getEndTimeDisplay } from '../../utils/time'
import { hapticSuccess, hapticLight } from '../../utils/haptics'
import SubtaskList from './SubtaskList'

interface TaskBlockProps {
  task: Task
  log: DailyLog | undefined
  onToggleComplete: () => void
  onToggleSubtask: (subtaskId: string) => void
  onEdit: () => void
  onDuplicate?: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  supplement: 'var(--color-cat-supplement)',
  meal: 'var(--color-cat-meal)',
  workout: 'var(--color-cat-workout)',
  habit: 'var(--color-cat-habit)',
  custom: 'var(--color-cat-custom)',
}

const CATEGORY_LABELS: Record<string, string> = {
  supplement: 'Supplement',
  meal: 'Meal',
  workout: 'Workout',
  habit: 'Habit',
  custom: 'Task',
}

export default function TaskBlock({ task, log, onToggleComplete, onToggleSubtask, onEdit, onDuplicate }: TaskBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const isComplete = log?.isComplete || false
  const subtaskCompletions = log?.subtaskCompletions || {}

  const completedSubtasks = task.subtasks.filter(st => subtaskCompletions[st.id]).length
  const totalSubtasks = task.subtasks.length
  const progressPct = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const accentColor = task.color || CATEGORY_COLORS[task.category] || CATEGORY_COLORS.custom

  return (
    <div
      className={`
        relative rounded-[var(--radius-md)] border transition-all duration-300
        ${isComplete
          ? 'bg-surface-raised/50 border-border-light'
          : 'bg-surface-raised border-border-light'
        }
      `}
      style={{ opacity: isComplete ? 0.55 : 1 }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity duration-300"
        style={{ backgroundColor: accentColor, opacity: isComplete ? 0.4 : 1 }}
      />

      {/* Main content — tap to expand */}
      <div
        className="pl-4 pr-3 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Category + Time range */}
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ color: accentColor, backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
              >
                {CATEGORY_LABELS[task.category]}
              </span>
              <p className="text-[10px] text-text-muted font-medium">
                {formatTimeDisplay(task.startTime)} – {getEndTimeDisplay(task.startTime, task.durationMinutes)}
                <span className="ml-1.5 text-text-muted/60">{formatDuration(task.durationMinutes)}</span>
              </p>
            </div>

            {/* Title */}
            <h3 className={`text-sm font-medium mt-1 transition-all duration-200 ${isComplete ? 'line-through text-text-muted' : 'text-text-primary'}`}>
              {task.title}
            </h3>

            {/* Description preview (collapsed only) */}
            {!expanded && task.description && (
              <p className="text-[11px] text-text-muted/70 mt-0.5 line-clamp-1">{task.description}</p>
            )}

            {/* Subtask progress bar */}
            {totalSubtasks > 0 && !expanded && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 rounded-full bg-charcoal overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
                  />
                </div>
                <span className="text-[10px] text-text-muted whitespace-nowrap">{completedSubtasks}/{totalSubtasks}</span>
              </div>
            )}
          </div>

          {/* Complete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!isComplete) hapticSuccess()
              else hapticLight()
              onToggleComplete()
            }}
            className={`
              mt-1.5 w-7 h-7 min-w-[28px] rounded-full border-2 flex items-center justify-center
              transition-all duration-200 cursor-pointer active:scale-90
              ${isComplete
                ? 'border-bamboo bg-bamboo'
                : 'border-stone/60 hover:border-bamboo/60'
              }
            `}
          >
            {isComplete && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-warm-white animate-check">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="animate-fade-in mt-2">
            {/* Description */}
            {task.description && (
              <p className="text-xs text-text-muted leading-relaxed mb-2">{task.description}</p>
            )}

            {/* Subtasks */}
            <SubtaskList
              subtasks={task.subtasks}
              completions={subtaskCompletions}
              onToggle={(subtaskId) => {
                hapticLight()
                onToggleSubtask(subtaskId)
              }}
            />

            {/* Subtask progress (shown in expanded view) */}
            {totalSubtasks > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-charcoal overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%`, backgroundColor: accentColor }}
                  />
                </div>
                <span className="text-[10px] text-text-muted whitespace-nowrap">{completedSubtasks}/{totalSubtasks}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-bamboo transition-colors font-medium uppercase tracking-wider cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              {onDuplicate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                  className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-bamboo transition-colors font-medium uppercase tracking-wider cursor-pointer"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Duplicate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Expand indicator */}
        <div className="flex justify-center mt-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-text-muted/30 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  )
}
