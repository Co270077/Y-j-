import * as m from 'motion/react-m'
import { snappy } from '../../motion/transitions'
import type { Subtask } from '../../db/types'

interface SubtaskListProps {
  subtasks: Subtask[]
  completions: Record<string, boolean>
  onToggle: (subtaskId: string) => void
}

export default function SubtaskList({ subtasks, completions, onToggle }: SubtaskListProps) {
  if (subtasks.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 mt-3">
      {subtasks
        .sort((a, b) => a.order - b.order)
        .map((st) => {
          const isDone = completions[st.id] || false
          return (
            <m.button
              key={st.id}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(st.id)
              }}
              whileTap={{ scale: 0.97, transition: snappy }}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-[var(--radius-sm)] hover:bg-charcoal/30 text-left cursor-pointer"
            >
              {/* Checkbox */}
              <m.div
                animate={isDone ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={snappy}
                className={`
                  w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-sm border flex items-center justify-center
                  ${isDone
                    ? 'bg-bamboo border-bamboo'
                    : 'border-stone bg-transparent'
                  }
                `}
              >
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-warm-white">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </m.div>

              <span
                className={`text-xs transition-all duration-150 ${
                  isDone ? 'text-text-muted line-through' : 'text-text-secondary'
                }`}
              >
                {st.title}
              </span>
            </m.button>
          )
        })}
    </div>
  )
}
