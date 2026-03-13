import Card from '../ui/Card'
import type { Task, DailyLog } from '../../db/types'
import { getCurrentDay } from '../../utils/time'
import { useCountUp } from '../../hooks/useCountUp'

interface StreakCardProps {
  tasks: Task[]
  dailyLogs: DailyLog[]
}

export default function StreakCard({ tasks, dailyLogs }: StreakCardProps) {
  const today = getCurrentDay()
  const todayTasks = tasks.filter(t => t.days.includes(today))
  const completed = todayTasks.filter(t => dailyLogs.find(l => l.taskId === t.id)?.isComplete).length
  const total = todayTasks.length

  // Simple remaining counter
  const remaining = total - completed
  const animatedRemaining = useCountUp(remaining)

  return (
    <Card>
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-2">Remaining</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${remaining === 0 && total > 0 ? 'text-bamboo' : 'text-text-primary'}`}>
          {remaining === 0 && total > 0 ? '0' : animatedRemaining}
        </span>
        <span className="text-xs text-text-muted">
          {remaining === 0 && total > 0 ? 'All done!' : `task${remaining !== 1 ? 's' : ''} left`}
        </span>
      </div>
    </Card>
  )
}
