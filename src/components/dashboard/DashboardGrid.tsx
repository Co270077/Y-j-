import { useNavigate } from 'react-router-dom'
import * as m from 'motion/react-m'
import { AnimatePresence } from 'motion/react'
import UpNextCard from './UpNextCard'
import ProgressCard from './ProgressCard'
import ProtocolCard from './ProtocolCard'
import MealCard from './MealCard'
import StreakCard from './StreakCard'
import WeeklyAdherenceCard from './WeeklyAdherenceCard'
import TimelinePeek from './TimelinePeek'
import WelcomeCard from './WelcomeCard'
import Skeleton from '../ui/Skeleton'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useProtocolStore } from '../../stores/protocolStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useMinuteTick } from '../../hooks/useClock'
import { getCurrentDay } from '../../utils/time'
import { showToast } from '../ui/Toast'
import { scaleIn, fadeIn } from '../../motion/variants'

const gridStagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

export default function DashboardGrid() {
  const navigate = useNavigate()
  const tasks = useScheduleStore(s => s.tasks)
  const dailyLogs = useScheduleStore(s => s.dailyLogs)
  const toggleTaskComplete = useScheduleStore(s => s.toggleTaskComplete)
  const toggleSubtaskComplete = useScheduleStore(s => s.toggleSubtaskComplete)
  const protocols = useProtocolStore(s => s.protocols)
  const settings = useSettingsStore(s => s.settings)

  const handleQuickComplete = async (taskId: number) => {
    await toggleTaskComplete(taskId)
    showToast('Task completed')
  }

  const handleSubtaskToggle = async (taskId: number, subtaskId: string) => {
    await toggleSubtaskComplete(taskId, subtaskId)
  }

  useMinuteTick()

  const today = getCurrentDay()
  const todayTasks = tasks.filter(t => t.days.includes(today))
  const isEmpty = tasks.length === 0 && protocols.length === 0
  const isLoaded = tasks.length > 0 || protocols.length > 0 || settings !== null

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!isLoaded ? (
          <m.div key="skeleton" variants={fadeIn} initial="initial" animate="animate" exit="exit">
            <div className="pt-4 px-5">
              <Skeleton variant="card" width="100%" height={120} className="mb-3" />
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-4">
              <Skeleton variant="card" height={88} />
              <Skeleton variant="card" height={88} />
              <Skeleton variant="card" height={88} />
              <Skeleton variant="card" height={88} />
            </div>
          </m.div>
        ) : isLoaded && isEmpty ? (
          <m.div key="welcome" variants={fadeIn} initial="initial" animate="animate">
            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              <WelcomeCard />
            </div>
          </m.div>
        ) : (
          <m.div key="content" variants={fadeIn} initial="initial" animate="animate">
            <div className="pt-4">
              <m.div variants={scaleIn}>
                <UpNextCard
                  tasks={todayTasks}
                  dailyLogs={dailyLogs}
                  onNavigateToSchedule={() => navigate('/schedule')}
                  onCompleteTask={handleQuickComplete}
                  onToggleSubtask={handleSubtaskToggle}
                />
              </m.div>
            </div>

            <m.div className="grid grid-cols-2 gap-3 px-5 pb-4" variants={gridStagger} initial="initial" animate="animate">
              <m.div variants={scaleIn}>
                <ProgressCard
                  tasks={todayTasks}
                  dailyLogs={dailyLogs}
                />
              </m.div>

              <m.div variants={scaleIn}>
                <StreakCard
                  tasks={tasks}
                  dailyLogs={dailyLogs}
                />
              </m.div>

              <m.div variants={scaleIn}>
                <MealCard
                  eatingWindow={settings?.eatingWindow || null}
                  onNavigateToMeals={() => navigate('/meals')}
                />
              </m.div>

              <m.div variants={scaleIn}>
                <ProtocolCard
                  protocols={protocols}
                  onNavigateToProtocols={() => navigate('/protocols')}
                />
              </m.div>

              <m.div variants={scaleIn} className="col-span-2">
                <WeeklyAdherenceCard
                  tasks={tasks}
                  dailyLogs={dailyLogs}
                />
              </m.div>
            </m.div>

            <TimelinePeek tasks={tasks} dailyLogs={dailyLogs} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
