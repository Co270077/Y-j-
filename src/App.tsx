import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { NavigationProvider } from './contexts/NavigationContext'
import { useSettingsStore } from './stores/settingsStore'
import { useScheduleStore } from './stores/scheduleStore'
import { useProtocolStore } from './stores/protocolStore'
import { useMealStore } from './stores/mealStore'
import { scheduleTaskNotifications } from './utils/notificationScheduler'
import { useDailyReset } from './hooks/useDailyReset'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const ProtocolsPage = lazy(() => import('./pages/ProtocolsPage'))
const MealsPage = lazy(() => import('./pages/MealsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

export default function App() {
  const loadSettings = useSettingsStore(s => s.load)
  const loadSchedule = useScheduleStore(s => s.load)
  const loadProtocols = useProtocolStore(s => s.load)
  const loadMeals = useMealStore(s => s.load)

  const settings = useSettingsStore(s => s.settings)
  const tasks = useScheduleStore(s => s.tasks)

  useEffect(() => {
    loadSettings()
    loadSchedule()
    loadProtocols()
    loadMeals()
  }, [loadSettings, loadSchedule, loadProtocols, loadMeals])

  // Auto-reset daily logs at midnight
  useDailyReset()

  // Re-schedule notifications when tasks or settings change
  useEffect(() => {
    if (settings && tasks.length > 0) {
      scheduleTaskNotifications(tasks, settings)
    }
  }, [tasks, settings])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <NavigationProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/protocols" element={<ProtocolsPage />} />
              <Route path="/meals" element={<MealsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </NavigationProvider>
    </BrowserRouter>
  )
}
