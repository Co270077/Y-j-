import { useState } from 'react'
import * as m from 'motion/react-m'
import { AnimatePresence } from 'motion/react'
import type { Protocol } from '../../db/types'
import { formatTimeDisplay } from '../../utils/time'
import Card from '../ui/Card'
import SwipeActionRow from '../ui/SwipeActionRow'
import { slideUp } from '../../motion/variants'
import { snappy } from '../../motion/transitions'

const listStagger = {
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
}

interface ProtocolListProps {
  protocols: Protocol[]
  onSelect: (protocol: Protocol) => void
  onToggleActive: (id: number) => void
  onDelete?: (protocol: Protocol) => void
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

export default function ProtocolList({ protocols, onSelect, onToggleActive, onDelete }: ProtocolListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

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

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <m.div className="flex flex-col gap-3" variants={listStagger} initial="initial" animate="animate">
      {sorted.map((protocol, index) => {
        const isExpanded = expandedId === protocol.id

        const cardContent = (
          <SwipeActionRow
            key={protocol.id}
            onDelete={onDelete ? () => onDelete(protocol) : undefined}
          >
            <Card
              onClick={() => protocol.id && toggleExpand(protocol.id)}
              className={isExpanded ? 'shadow-lg' : ''}
            >
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

                  {/* Collapsed: show first few supplements */}
                  {!isExpanded && (
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
                  )}

                  {/* Expanded: full supplement list + edit button */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <m.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: snappy }}
                        exit={{ height: 0, opacity: 0, transition: snappy }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="flex flex-col gap-1 mt-2.5">
                          {protocol.supplements.map(s => (
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
                        </div>
                        <div className="mt-3">
                          <m.button
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelect(protocol)
                            }}
                            whileTap={{ scale: 0.97, transition: snappy }}
                            className="flex items-center gap-1.5 text-[10px] text-text-muted hover:text-bamboo transition-colors font-medium uppercase tracking-wider cursor-pointer"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </m.button>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active toggle — min 44px touch target */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (protocol.id) onToggleActive(protocol.id)
                  }}
                  className={`
                    px-3 py-2 min-h-[44px] min-w-[44px] rounded-full text-[10px] font-medium transition-all cursor-pointer flex items-center justify-center
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
          </SwipeActionRow>
        )

        if (index < 10) {
          return (
            <m.div key={protocol.id} variants={slideUp}>
              {cardContent}
            </m.div>
          )
        }

        return <div key={protocol.id}>{cardContent}</div>
      })}
    </m.div>
  )
}
