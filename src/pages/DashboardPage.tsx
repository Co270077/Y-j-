import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import DashboardGrid from '../components/dashboard/DashboardGrid'
import { useClock } from '../hooks/useClock'

function getGreeting(): { english: string; japanese: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { english: 'Good morning', japanese: 'おはようございます' }
  if (hour < 17) return { english: 'Good afternoon', japanese: 'こんにちは' }
  if (hour < 21) return { english: 'Good evening', japanese: 'こんばんは' }
  return { english: 'Good night', japanese: 'おやすみなさい' }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const today = format(new Date(), 'EEEE, MMMM d')
  const greeting = getGreeting()
  const clock = useClock()

  return (
    <>
      <Header
        title="養生"
        subtitle={today}
        rightAction={
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium tabular-nums">{clock}</span>
            <button
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-raised transition-colors cursor-pointer text-text-muted"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
          </div>
        }
      />

      {/* Greeting */}
      <div className="px-5 pt-3 pb-1 max-w-lg mx-auto">
        <p className="text-lg font-semibold text-text-primary">
          {greeting.english}
          <span className="text-text-muted font-normal text-sm ml-2">{greeting.japanese}</span>
        </p>
      </div>

      <DashboardGrid />

      {/* FAB — Quick Add */}
      <button
        onClick={() => navigate('/schedule', { state: { openNewTask: true } })}
        aria-label="Quick add task"
        className="fixed bottom-[calc(4rem+16px+env(safe-area-inset-bottom,0px))] right-5 w-14 h-14 rounded-full bg-bamboo text-warm-white shadow-lg shadow-bamboo/20 flex items-center justify-center hover:bg-bamboo-dark active:scale-95 transition-all cursor-pointer z-40"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </>
  )
}
