import { useMemo } from 'react'
import Card from '../ui/Card'
import type { Task, DailyLog } from '../../db/types'
import { DAYS_ORDERED, DAY_LABELS, getCurrentDay } from '../../utils/time'

interface WeeklyAdherenceCardProps {
  tasks: Task[]
  dailyLogs: DailyLog[]
}

export default function WeeklyAdherenceCard({ tasks, dailyLogs }: WeeklyAdherenceCardProps) {
  const today = getCurrentDay()

  const weekData = useMemo(() => {
    return DAYS_ORDERED.map(day => {
      const dayTasks = tasks.filter(t => t.days.includes(day))
      const total = dayTasks.length
      // For simplicity, we only have accurate completion data for today
      // Future improvement: load multiple days of logs
      const isToday = day === today
      const completed = isToday
        ? dayTasks.filter(t => dailyLogs.find(l => l.taskId === t.id)?.isComplete).length
        : 0
      return { day, total, completed, isToday }
    })
  }, [tasks, dailyLogs, today])

  const maxTasks = Math.max(...weekData.map(d => d.total), 1)

  return (
    <Card className="col-span-2">
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Weekly Load</p>
      <div className="flex items-end justify-between gap-1.5 h-20">
        {weekData.map(({ day, total, completed, isToday }) => {
          const height = total > 0 ? (total / maxTasks) * 100 : 4
          const completedHeight = total > 0 ? (completed / maxTasks) * 100 : 0
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative flex items-end justify-center" style={{ height: '56px' }}>
                {/* Background bar (total tasks) */}
                <div
                  className={`w-full rounded-sm transition-all duration-300 ${
                    isToday ? 'bg-bamboo/20' : 'bg-surface-overlay'
                  }`}
                  style={{ height: `${height}%`, minHeight: '2px' }}
                >
                  {/* Completed overlay */}
                  {completedHeight > 0 && (
                    <div
                      className="w-full bg-bamboo rounded-sm absolute bottom-0 left-0 transition-all duration-300"
                      style={{ height: `${completedHeight}%`, minHeight: '2px' }}
                    />
                  )}
                </div>
              </div>
              <span className={`text-[9px] font-medium ${
                isToday ? 'text-bamboo' : 'text-text-muted'
              }`}>
                {DAY_LABELS[day]}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
