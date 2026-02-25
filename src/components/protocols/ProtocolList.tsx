import type { Protocol } from '../../db/types'
import { formatTimeDisplay } from '../../utils/time'
import Card from '../ui/Card'

interface ProtocolListProps {
  protocols: Protocol[]
  onSelect: (protocol: Protocol) => void
  onToggleActive: (id: number) => void
}

function getTimingLabel(rule: Protocol['supplements'][0]['timingRule']): string {
  switch (rule.type) {
    case 'specific_time': return formatTimeDisplay(rule.time)
    case 'with_meal': return `w/ ${rule.meal}`
    case 'before_meal': return `${rule.minutesBefore}m pre-${rule.meal}`
    case 'after_meal': return `${rule.minutesAfter}m post-${rule.meal}`
    case 'on_wake': return rule.offsetMinutes > 0 ? `wake +${rule.offsetMinutes}m` : 'on wake'
    case 'before_sleep': return rule.offsetMinutes > 0 ? `sleep -${rule.offsetMinutes}m` : 'at sleep'
  }
}

export default function ProtocolList({ protocols, onSelect, onToggleActive }: ProtocolListProps) {
  if (protocols.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-5">
        <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-muted">
            <path d="M9 3H5a2 2 0 0 0-2 2v4" />
            <path d="M9 3h6" />
            <path d="M15 3h4a2 2 0 0 1 2 2v4" />
            <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
            <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <p className="text-sm text-text-muted text-center">No protocols yet</p>
        <p className="text-xs text-text-muted/60 text-center mt-1">Create your first supplement stack</p>
      </div>
    )
  }

  // Sort: active first, then by name
  const sorted = [...protocols].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="flex flex-col gap-3">
      {sorted.map(protocol => (
        <Card key={protocol.id} onClick={() => onSelect(protocol)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary">{protocol.name}</h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {protocol.supplements.length} supplement{protocol.supplements.length !== 1 ? 's' : ''}
                {' · '}
                {protocol.cyclePattern.type === 'daily' ? 'Daily' :
                 protocol.cyclePattern.type === 'on_off' ? `${protocol.cyclePattern.daysOn} on / ${protocol.cyclePattern.daysOff} off` :
                 `${protocol.cyclePattern.days.length} days/week`}
              </p>

              {/* Supplement details */}
              <div className="flex flex-col gap-1 mt-2.5">
                {protocol.supplements.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cat-supplement" />
                      <span className="text-xs text-text-secondary">{s.name}</span>
                      <span className="text-[10px] text-text-muted">{s.dose}</span>
                    </div>
                    <span className="text-[10px] text-text-muted tabular-nums">
                      {getTimingLabel(s.timingRule)}
                    </span>
                  </div>
                ))}
                {protocol.supplements.length > 5 && (
                  <span className="text-[10px] text-text-muted ml-3">
                    +{protocol.supplements.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Active toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (protocol.id) onToggleActive(protocol.id)
              }}
              className={`
                px-2.5 py-1 rounded-full text-[10px] font-medium transition-all cursor-pointer
                ${protocol.isActive
                  ? 'bg-bamboo/20 text-bamboo'
                  : 'bg-surface-overlay text-text-muted hover:text-text-secondary'
                }
              `}
            >
              {protocol.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}
