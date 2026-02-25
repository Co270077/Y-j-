import { useNavigate } from 'react-router-dom'
import UpNextCard from './UpNextCard'
import ProgressCard from './ProgressCard'
import ProtocolCard from './ProtocolCard'
import MealCard from './MealCard'
import StreakCard from './StreakCard'
import WeeklyAdherenceCard from './WeeklyAdherenceCard'
import TimelinePeek from './TimelinePeek'
import WelcomeCard from './WelcomeCard'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useProtocolStore } from '../../stores/protocolStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useMinuteTick } from '../../hooks/useClock'
import { getCurrentDay } from '../../utils/time'
import { showToast } from '../ui/Toast'

export default function DashboardGrid() {
  const navigate = useNavigate()
  const tasks = useScheduleStore(s => s.tasks)
  const dailyLogs = useScheduleStore(s => s.dailyLogs)
  const toggleTaskComplete = useScheduleStore(s => s.toggleTaskComplete)
  const protocols = useProtocolStore(s => s.protocols)
  const settings = useSettingsStore(s => s.settings)

  const handleQuickComplete = async (taskId: number) => {
    await toggleTaskComplete(taskId)
    showToast('Task completed')
  }

  useMinuteTick()

  const today = getCurrentDay()
  const todayTasks = tasks.filter(t => t.days.includes(today))
  const isEmpty = tasks.length === 0 && protocols.length === 0

  if (isEmpty) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <WelcomeCard />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <UpNextCard
          tasks={todayTasks}
          dailyLogs={dailyLogs}
          onNavigateToSchedule={() => navigate('/schedule')}
          onCompleteTask={handleQuickComplete}
        />

        <ProgressCard
          tasks={todayTasks}
          dailyLogs={dailyLogs}
        />

        <StreakCard
          tasks={tasks}
          dailyLogs={dailyLogs}
        />

        <MealCard
          eatingWindow={settings?.eatingWindow || null}
          onNavigateToMeals={() => navigate('/meals')}
        />

        <ProtocolCard
          protocols={protocols}
          onNavigateToProtocols={() => navigate('/protocols')}
        />

        <WeeklyAdherenceCard
          tasks={tasks}
          dailyLogs={dailyLogs}
        />
      </div>

      <TimelinePeek tasks={tasks} dailyLogs={dailyLogs} />
    </div>
  )
}
