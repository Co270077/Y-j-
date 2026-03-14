import { useLocation } from 'react-router-dom'
import * as m from 'motion/react-m'
import { hapticLight } from '../../utils/haptics'
import { useNavigation } from '../../contexts/NavigationContext'
import { snappy } from '../../motion/transitions'

const tabs = [
  { path: '/', label: 'Dashboard', icon: DashboardIcon },
  { path: '/schedule', label: 'Schedule', icon: ScheduleIcon },
  { path: '/protocols', label: 'Protocols', icon: ProtocolIcon },
  { path: '/meals', label: 'Meals', icon: MealIcon },
]

export default function BottomNav() {
  const location = useLocation()
  const { navigateTo } = useNavigation()

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom bg-black border-t border-gray-700">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => { hapticLight(); navigateTo(path, 'tab') }}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors cursor-pointer ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Animated pill indicator */}
              {isActive && (
                <m.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-x-1 inset-y-1 bg-white/10"
                  transition={snappy}
                />
              )}
              <span className="relative z-10">
                <Icon active={isActive} />
              </span>
              <span className="relative z-10 text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// ===== Inline SVG Icons =====

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ScheduleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ProtocolIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4" />
      <path d="M9 3h6" />
      <path d="M15 3h4a2 2 0 0 1 2 2v4" />
      <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
      <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function MealIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}
