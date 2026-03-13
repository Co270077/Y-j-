import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function WelcomeCard() {
  const navigate = useNavigate()

  return (
    <Card className="col-span-2">
      <div className="text-center py-4">
        <p className="text-2xl mb-2">時</p>
        <h3 className="text-sm font-semibold text-text-primary mb-1">Welcome to Yōjō</h3>
        <p className="text-xs text-text-muted mb-4 leading-relaxed max-w-[280px] mx-auto">
          Your daily optimization starts here. Add your first task to build your schedule.
        </p>
        <div className="flex gap-2 justify-center">
          <Button size="sm" onClick={() => navigate('/schedule', { state: { openNewTask: true } })}>
            Add first task
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/protocols')}>
            Set up protocol
          </Button>
        </div>
      </div>
    </Card>
  )
}
