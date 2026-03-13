import Card from '../ui/Card'
import ProgressRing from '../ui/ProgressRing'
import type { Task, DailyLog } from '../../db/types'
import { useCountUp } from '../../hooks/useCountUp'

interface ProgressCardProps {
  tasks: Task[]
  dailyLogs: DailyLog[]
}

export default function ProgressCard({ tasks, dailyLogs }: ProgressCardProps) {
  const total = tasks.length
  const completed = tasks.filter(t => dailyLogs.find(l => l.taskId === t.id)?.isComplete).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const animatedProgress = useCountUp(progress)
  const animatedCompleted = useCountUp(completed)

  return (
    <Card>
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Today</p>
      <div className="flex items-center gap-3">
        <ProgressRing progress={progress} size={52} strokeWidth={4}>
          <span className="text-xs font-semibold text-text-primary">{animatedProgress}%</span>
        </ProgressRing>
        <div>
          <p className="text-lg font-bold text-text-primary leading-tight">{animatedCompleted}/{total}</p>
          <p className="text-[10px] text-text-muted">tasks done</p>
        </div>
      </div>
    </Card>
  )
}
